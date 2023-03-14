import { z } from "zod";
import { type inferProcedureOutput } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "../trpc";
import vsearch from "../../vsearch";
import { type AppRouter } from "../root";

export type ExploreCardsOutput = inferProcedureOutput<
  AppRouter["_def"]["procedures"]["explore"]["cards"]
>;

export const exploreRouter = createTRPCRouter({
  cards: publicProcedure
    .input(
      z.object({
        reference: z.string().uuid().optional(),
        cardsPerLine: z.number().positive(),
        cursor: z.number().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const cursorStep = 10;
      const offset = input.cursor ?? 0;
      const vector =
        typeof input.reference !== "undefined"
          ? (await vsearch.retrieve(input.reference)).result.vector
          : (new Array(512).fill(0) as number[]);
      const searchResponse = await vsearch.search({
        vector,
        limit: cursorStep,
        offset,
      });
      const points = searchResponse.result ?? [];
      const pointsWithReference =
        typeof input.reference !== "undefined" && (input.cursor ?? 0) === 0
          ? [{ id: input.reference, score: 1 }, ...points]
          : points;
      // TODO: put this info in vsearch metadata so you don't need to fetch it
      const cards = await Promise.all(
        (
          await ctx.prisma.card.findMany({
            where: {
              id: {
                in: pointsWithReference.map(($) => $.id),
              },
            },
            select: {
              id: true,
              collectionId: true,
              collection: {
                select: {
                  name: true,
                  producerId: true,
                  producer: {
                    select: {
                      nickname: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          })
        ).map(async ($) => ({
          id: $.id,
          url: await ctx.storage.urlForFetchingCard({
            userId: $.collection.producerId,
            collectionId: $.collectionId,
            cardId: $.id,
            forever: true,
          }),
          collectionId: $.collectionId,
          collectionName: $.collection.name,
          producerName: $.collection.producer.nickname,
          producerSlug: $.collection.producer.slug,
        }))
      );
      const cardsWithScore = cards
        .map((card) => ({
          ...card,
          score:
            pointsWithReference.find((point) => point.id === card.id)?.score ??
            0,
        }))
        .sort((a, b) => b.score - a.score);

      return {
        cards: cardsWithScore,
        cursorStep,
        nextCursor: offset + cursorStep,
      };
    }),
});
