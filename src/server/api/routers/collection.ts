import { z } from "zod";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { env } from "../../../env.mjs";
import { bucketKey } from "../../../utils/format";
import { supportedCurrencies } from "../../payment";

// TODO: add a slug to the collection model, this should also have a URL preview when
// creating a collection.
export const collectionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        cardsName: z.string().array().nonempty(),
        price: z.object({
          unitAmount: z.number().int(),
          currency: z.enum(supportedCurrencies),
          forOtherCurrencies: z
            .object(
              supportedCurrencies.reduce(
                (acc, it) => ({
                  ...acc,
                  [it]: z.object({
                    unitAmount: z.number().int(),
                  }),
                }),
                {}
              )
            )
            .optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const collectionId = nanoid();
      const cards = await Promise.all(
        input.cardsName.map<Promise<Prisma.CardCreateWithoutCollectionInput>>(
          async (name) => {
            const id = nanoid();
            const command = new PutObjectCommand({
              Bucket: env.AWS_S3_BUCKET,
              Key: bucketKey(userId, collectionId, id),
            });
            const url = await getSignedUrl(ctx.s3, command, {
              expiresIn: +env.AWS_S3_PUT_EXP,
            });

            return { id, name, url };
          }
        )
      );

      const priceResponse = await ctx.stripe.prices.create({
        unit_amount: input.price.unitAmount,
        currency: input.price.currency,
        metadata: {
          userId,
          collectionId,
        },
        product_data: {
          name: input.name,
          metadata: {
            userId,
            collectionId,
          },
          // TODO: make sure this is right.
          tax_code: env.STRIPE_TAX_CODE,
          unit_label: input.name, // TODO: make it better?
        },
        currency_options: input.price.forOtherCurrencies,
      });

      await ctx.prisma.collection.create({
        data: {
          id: collectionId,
          name: input.name,
          description: input.description,
          gameplayPriceRef: priceResponse.id,
          producer: {
            connect: {
              id: userId,
            },
          },
          cards: {
            create: cards,
          },
        },
      });

      return {
        collectionId: collectionId,
        cardsNameToUploadLink: cards.reduce<Record<string, string>>(
          (acc, it) => ({
            ...acc,
            [it.name]: it.url,
          }),
          {}
        ),
      };
    }),

  // TODO: Create images embeddings
  confirm: protectedProcedure
    .input(z.string())
    .mutation(async ({ input: collectionId, ctx }) => {
      const userId = ctx.session.user.id;
      const userName = ctx.session.user.name ?? "none";
      const command = new ListObjectsV2Command({
        Bucket: env.AWS_S3_BUCKET,
        Delimiter: "/",
        Prefix: bucketKey(userId, collectionId),
      });
      const response = await ctx.s3.send(command);
      const everyCardWasUploaded =
        response.Contents?.every((it) => (it.Size ?? 0) > 0) ?? false;

      if (!everyCardWasUploaded) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "not every card was uploaded",
        });
      }

      await ctx.prisma.collection.update({
        where: {
          id: collectionId,
        },
        data: {
          confirmed: true,
        },
      });

      return {
        redirect: `${userName}/${collectionId}`,
      };
    }),
});
