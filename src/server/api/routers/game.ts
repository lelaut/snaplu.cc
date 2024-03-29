import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const gameRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ gameplayId: z.string().cuid2() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const gameplay = await ctx.prisma.gameplay.findUnique({
        where: {
          id: input.gameplayId,
        },
        select: {
          collectionId: true,
          consumerId: true,
          cardId: true,
          card: {
            select: {
              rarity: true,
            },
          },
          collection: {
            select: {
              name: true,
              producerId: true,
              producer: {
                select: {
                  slug: true,
                },
              },
            },
          },
        },
      });

      if (gameplay === null || gameplay.consumerId !== userId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return {
        producerSlug: gameplay.collection.producer.slug,
        collectionId: gameplay.collectionId,
        collectionName: gameplay.collection.name,
        rarity: gameplay.card.rarity,
        url: await ctx.storage.urlForFetchingCard({
          userId: gameplay.collection.producerId,
          collectionId: gameplay.collectionId,
          cardId: gameplay.cardId,
        }),
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
        select: {
          gameplayPriceRef: true,
        },
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

      // inspired by: https://stackoverflow.com/a/56006340
      const [selected] = await ctx.prisma.$queryRawUnsafe<
        Array<{ id: string }>
      >(
        `
          SELECT "public"."Card"."id", -LOG(RANDOM()) / "public"."Rarity"."dropRate" AS priority FROM "public"."Card" 
          INNER JOIN "public"."Rarity" ON "public"."Card"."rarityName" = "public"."Rarity"."name"
          WHERE ("public"."Card"."collectionId" = $1 AND "public"."Card"."rarityName" IS NOT NULL)
          ORDER BY "priority"
          LIMIT 1
        `,
        input.collectionId
      );

      if (typeof selected === "undefined") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No unblocked card for this collection",
        });
      }

      const createGameplay = ctx.prisma.gameplay.create({
        data: {
          consumerId: userId,
          collectionId: input.collectionId,
          cardId: selected.id,
        },
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

      const [{ id: gameplayId }] = await ctx.prisma.$transaction([
        createGameplay,
        updateConsumer,
      ]);

      return {
        gameplayId,
      };
    }),
});
