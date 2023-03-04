import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../../../env.mjs";
import { bucketKey } from "../../../utils/format";

export const gameRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ gameplayId: z.string().cuid2() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const gameplay = await ctx.prisma.gameplay.findUnique({
        where: {
          id: input.gameplayId,
        },
      });

      if (gameplay === null || gameplay.consumerId !== userId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return {
        gameplay: {
          ...gameplay,
          url: await ctx.storage.urlForFetchingCard({
            userId,
            collectionId: gameplay.collectionId,
            cardId: gameplay.cardId,
          }),
        },
      };
    }),

  play: protectedProcedure
    .input(z.object({ collectionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const consumer = await ctx.prisma.consumer.findUnique({
        where: { id: userId },
      });
      const collection = await ctx.prisma.collection.findUnique({
        where: { id: input.collectionId },
      });

      if (collection === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collection not found",
        });
      }

      const { unitAmount: cost } = await ctx.payment.fetchCollectionPrice(
        collection.gameplayPriceRef
      );

      // TODO: create an ex_rate table from [here](https://exchangeratesapi.io) to
      // make the conversion. Currently this is not available in stripe(only in Beta).

      if (consumer === null || consumer.credits < cost) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not enought credits",
        });
      }

      const [{ id: cardId }] = (await ctx.prisma
        .$queryRaw`SELECT id FROM "Card" ORDER BY RANDOM() LIMIT 1;`) as string;

      const createGameplay = ctx.prisma.gameplay.create({
        data: { consumerId: userId, collectionId: input.collectionId, cardId },
      });
      const updateConsumer = ctx.prisma.consumer.update({
        where: {
          id: userId,
        },
        data: {
          credits: {
            decrement: cost,
          },
        },
      });

      const [gameplay] = await ctx.prisma.$transaction([
        createGameplay,
        updateConsumer,
      ]);

      return { gameplay };
    }),
});
