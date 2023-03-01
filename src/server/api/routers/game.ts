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
      });

      if (gameplay === null || gameplay.consumerId !== userId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // TODO: get pre signed url for card image

      return { gameplay };
    }),

  play: protectedProcedure
    .input(z.object({ collectionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      // TODO: check to see if user has credit

      const cardId = (await ctx.prisma
        .$queryRaw`SELECT id FROM "Card" ORDER BY RANDOM() LIMIT 1;`) as string;

      // TODO: subtract user credit and create gameplay, all in a
      // single transaction

      const gameplay = await ctx.prisma.gameplay.create({
        data: { consumerId: userId, collectionId: input.collectionId, cardId },
      });

      return { gameplay };
    }),
});
