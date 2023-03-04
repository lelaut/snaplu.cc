import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { dayjs } from "../../../utils/format";

export const meRouter = createTRPCRouter({
  creditPurchases: protectedProcedure
    .input(z.object({ cursor: z.number().nullish() }))
    .query(async ({ input, ctx }) => {
      const cursorStep = 10;
      const userId = ctx.session.user.id;

      const purchases = await ctx.prisma.creditPurchase.findMany({
        where: {
          consumerId: userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: input.cursor ?? 0,
        take: cursorStep,
      });

      return {
        purchases,
        cursorStep: cursorStep,
        nextCursor: (input.cursor ?? 0) + cursorStep,
      };
    }),

  deck: protectedProcedure
    .input(
      z.object({
        cardsPerLine: z.number().positive(),
        cursor: z.number().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const cursorStep = Math.min(20, input.cardsPerLine * 4);
      const userId = ctx.session.user.id;
      const deck = await ctx.prisma.consumerCard.findMany({
        select: {
          card: {
            select: {
              id: true,
              name: true,
              collectionId: true,
            },
          },
        },
        where: {
          consumerId: userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: input.cursor ?? 0,
        take: cursorStep,
      });
      const deckWithAllowedUrl = await Promise.all(
        deck.map(async (item) => ({
          ...item.card,
          // TODO: create a function that generate this, so we
          // don't have any inconsistency on how this is created
          url: await ctx.storage.urlForFetchingCard({
            userId,
            collectionId: item.card.collectionId,
            cardId: item.card.id,
          }),
        }))
      );

      return {
        cards: deckWithAllowedUrl,
        cursorStep: cursorStep,
        nextCursor: (input.cursor ?? 0) + cursorStep,
      };
    }),

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
            period: {
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
