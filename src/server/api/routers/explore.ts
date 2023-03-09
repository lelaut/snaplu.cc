import { z } from "zod";
import { type inferProcedureOutput } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "../trpc";
import vsearch from "../../vsearch";
import { AppRouter } from "../root";

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

      const searchResponse = await vsearch.search({
        vector: new Array(512).fill(0) as number[],
        limit: cursorStep,
        offset,
      });
      console.log({ searchResponse });
      // TODO: put this info in vsearch metadata so you don't need to fetch it
      const cards = await Promise.all(
        (
          await ctx.prisma.card.findMany({
            where: {
              generation: {
                in: searchResponse.result ?? [],
              },
            },
            select: {
              id: true,
              generation: true,
              collectionId: true,
              collection: {
                select: {
                  name: true,
                  producerId: true,
                  producer: {
                    select: {
                      nickname: true,
                    },
                  },
                },
              },
            },
          })
        ).map(async ($) => ({
          id: $.id,
          generation: $.generation,
          url: await ctx.storage.urlForFetchingCard({
            userId: $.collection.producerId,
            collectionId: $.collectionId,
            cardId: $.id,
            forever: true,
          }),
          collectionId: $.collectionId,
          collectionName: $.collection.name,
          producerName: $.collection.producer.nickname,
        }))
      );

      return { cards, cursorStep, nextCursor: offset + cursorStep };
    }),
});
