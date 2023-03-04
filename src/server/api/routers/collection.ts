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
import { prisma } from "../../db";

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
          others: z
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

      const { id } = await ctx.payment.createCollectionPrice({
        userId,
        collectionId,
        collectionName: input.name,
        price: input.price as any,
      });

      await ctx.prisma.collection.create({
        data: {
          id: collectionId,
          name: input.name,
          description: input.description,
          gameplayPriceRef: id,
          producer: {
            connect: {
              id: userId,
            },
          },
          cards: {
            create: cards.map((card) => ({ id: card.id, name: card.name })),
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
      const numberOfCardsInCollection = await prisma.card.count({
        where: {
          collectionId,
        },
      });
      const everyCardWasUploaded =
        typeof response.Contents === "undefined"
          ? false
          : response.Contents.length === numberOfCardsInCollection &&
            response.Contents.every((it) => (it.Size ?? 0) > 0);

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
