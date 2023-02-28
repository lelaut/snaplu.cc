import { z } from "zod";
import { v4 as uuid } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

import { type CardModel } from "../../../utils/models";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { fakeDelay, fakeDeposits } from "../../../utils/fake";
import dayjs from "dayjs";
import { env } from "../../../env.mjs";
import { bucketKey } from "../../../utils/format";

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
    }>(({ input, ctx }) => {
      const cursorStep = Math.min(20, input.cardsPerLine * 4);
      const userId = ctx.session.user.id;
      const deck = ctx.prisma.consumerCard.findMany({
        select: {
          card: {
            id: true,
            name: true,
            url: true,
            collectionId: true,
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
      const deckWithAllowedUrl = deck.map((card) => ({
        ...card,
        url: getSignedUrl(
          ctx.s3,
          new GetObjectCommand({
            Bucket: env.AWS_S3_BUCKET,
            Key: bucketKey(userId, card.collectionId, card.id),
          }),
          {
            expiresIn: 5 * 60, // TODO: move this to .env file
          }
        ),
      }));

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
