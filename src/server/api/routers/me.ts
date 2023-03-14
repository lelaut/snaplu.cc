import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { dayjs } from "../../../utils/format";
import { type CollectionWithProfits } from "../../../utils/models";
import { Decimal } from "@prisma/client/runtime";

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

  userDeck: protectedProcedure
    .input(
      z.object({
        cardsPerLine: z.number().positive(),
        cursor: z.number().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const cursorStep = Math.min(20, input.cardsPerLine * 4);
      const userId = ctx.session.user.id;
      const deck = (
        await ctx.prisma.consumerCard.findMany({
          select: {
            card: {
              select: {
                id: true,
                collection: {
                  select: {
                    id: true,
                    name: true,
                    producer: {
                      select: {
                        user: {
                          select: {
                            name: true,
                          },
                        },
                      },
                    },
                  },
                },
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
        })
      ).map(async ($) => ({
        url: await ctx.storage.urlForFetchingCard({
          userId,
          collectionId: $.card.collection.id,
          cardId: $.card.id,
        }),
        id: $.card.id,
        collectionId: $.card.collection.id,
        collectionName: $.card.collection.name,
        producerName: $.card.collection.producer.user.name,
      }));

      return {
        cards: await Promise.all(deck),
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
      const totalProfitLastFiveMonths = (
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
            period: "desc",
          },
        })
      ).map(($) => ({ period: $.period, profit: $._sum.profit }));
      const collectionProfit = (
        await ctx.prisma.collectionProfit.groupBy({
          by: ["period", "collectionId"],
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
          // TODO: not very efficient :(
          skip: input.cursor ?? 0,
          take: cursorStep,
        })
      ).map(($) => ({
        id: $.collectionId,
        period: $.period,
        profit: $._sum.profit,
      }));
      const collections = (
        await ctx.prisma.collection.findMany({
          where: {
            id: {
              in: collectionProfit.map(($) => $.id),
            },
          },
          select: {
            id: true,
            name: true,
            cards: {
              select: {
                id: true,
              },
              take: 1,
            },
          },
        })
      ).map<CollectionWithProfits>(($) => ({
        id: $.id,
        profit: collectionProfit
          .filter((c) => c.id === $.id)
          .map((c) => ({
            period: c.period,
            profit: c.profit ?? new Decimal(0),
          })),
        name: $.name,
        cardId: $.cards[0]?.id ?? "",
      }));

      return {
        totalProfitLastFiveMonths,
        collections,
        cursorStep,
        nextCursor: (input.cursor ?? 0) + cursorStep,
      };
    }),
});
