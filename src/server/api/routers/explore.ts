import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { type CardModel } from "../../../utils/models";

export const exploreRouter = createTRPCRouter({
  cards: publicProcedure
    .input(
      z.object({
        hash: z.string().uuid().optional(),
        cardsPerLine: z.number().positive(),
        cursor: z.number().nullish(),
      })
    )
    // TODO: add a small random delay before sending response
    .query(({ input, ctx: { session } }) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            cards: Array.from(
              Array(input.cardsPerLine * 10).keys()
            ).map<CardModel>((generation) => ({
              reference:
                input.hash ?? `USER_${session?.user?.id ?? "UNDEFINED"}`,
              hash:
                generation + (input.cursor ?? 0) === 0 && input.hash
                  ? input.hash
                  : (uuidv4() as string),
              generation: generation + (input.cursor ?? 0),
            })),
            cursorStep: input.cardsPerLine * 10,
            nextCursor: (input.cursor ?? 0) + input.cardsPerLine * 10,
          });
        }, 1000 + 5000 * Math.random());
      });
    }),
});
