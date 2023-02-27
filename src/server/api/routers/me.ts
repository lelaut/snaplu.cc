import { z } from "zod";
import { v4 as uuid } from "uuid";

import { type CardModel } from "../../../utils/models";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { fakeDelay, fakeDeposits } from "../../../utils/fake";
import dayjs from "dayjs";

export const meRouter = createTRPCRouter({
  credit: protectedProcedure.query(() =>
    fakeDelay(() => ({
      lastDeposits: fakeDeposits().slice(0, 5),
    }))
  ),

  deck: protectedProcedure
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

  content: protectedProcedure
    .input(
      z.object({
        cursor: z.number().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const cursorStep = 10;
      const userId = ctx.session.user.id;
      const totalProfitLastFiveMonths =
        await ctx.prisma.collectionProfit.groupBy({
          by: ["period"],
          _sum: {
            profit: true,
          },
          where: {
            producerId: userId,
            updatedAt: {
              gte: dayjs().startOf("month").subtract(5, "month").toDate(),
            },
          },
          orderBy: {
            period: "asc",
          },
        });
      const contentByCursor = await ctx.prisma.collection.findMany({
        where: {
          producerId: userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        // TODO: not very efficient :(
        skip: input.cursor ?? 0,
        take: cursorStep,
      });

      return {
        totalProfitLastFiveMonths,
        contentByCursor,
        cursorStep,
        nextCursor: (input.cursor ?? 0) + cursorStep,
      };
    }),
});
