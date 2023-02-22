import { z } from "zod";
import { v4 as uuid } from "uuid";

import { type MonthlyProfit, type CardModel } from "../../../utils/models";
import { createTRPCRouter, publicProcedure } from "../trpc";
import {
  fakeDelay,
  fakeDeposits,
  fakeMonthlyProfits,
} from "../../../utils/fake";

// TODO: change this to be `protectedProcedure`
export const meRouter = createTRPCRouter({
  credit: publicProcedure.query(() =>
    fakeDelay(() => ({
      lastDeposits: fakeDeposits().slice(0, 5),
    }))
  ),

  deck: publicProcedure
    .input(
      z.object({
        cardsPerLine: z.number().positive(),
        cursor: z.number().nullish(),
      })
    )
    .query<{
      cards: CardModel[];
      cursorStep: number;
      nextCursor: number;
    }>(({ input }) =>
      fakeDelay(() => ({
        cards: Array.from(Array(input.cardsPerLine * 10).keys()).map<CardModel>(
          (generation) => {
            const id = uuid();
            const creator = {
              username: `creator_${generation}`,
              link: `/${`creator_${generation}`}`,
            };
            const collection = {
              slug: `collection_${generation}`,
              size: Math.floor(Math.random() * 10 + 10),
              playcost: +(Math.random() * 0.9 + 0.1).toFixed(2),
              link: `/${creator.username}/${`collection_${generation}`}`,
              creator,
            };

            return {
              reference: "",
              id,
              generation: generation + (input.cursor ?? 0),

              link: `/${creator.username}/${collection.slug}#${id}`,
              slug: `card_${generation}`,
              collection,
            };
          }
        ),
        cursorStep: input.cardsPerLine * 10,
        nextCursor: (input.cursor ?? 0) + input.cardsPerLine * 10,
      }))
    ),

  content: publicProcedure
    .input(
      z.object({
        cursor: z.number().nullish(),
      })
    )
    .query<{
      months: MonthlyProfit[];
      collections: {
        name: string;
        image: string;
        months: MonthlyProfit[];
        link: string;
      }[];
      cursorStep: number;
      nextCursor: number;
    }>(({ input }) =>
      fakeDelay(() => ({
        months: fakeMonthlyProfits().slice(0, 5),
        collections: Array.from(Array(10).keys()).map((generation) => {
          const name = `collection_${generation + (input.cursor ?? 0)}`;

          return {
            name,
            image: ["#f00", "#0f0", "#00f"][Math.round(Math.random() * 3)]!,
            months: fakeMonthlyProfits().slice(0, 5),
            link: `/username/${name}`,
          };
        }),
        cursorStep: 10,
        nextCursor: (input.cursor ?? 0) + 10,
      }))
    ),
});
