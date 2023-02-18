import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { type CardModel } from "../../../utils/models";

export const exploreRouter = createTRPCRouter({
  cards: publicProcedure
    .input(
      z.object({
        reference: z.string().uuid().optional(),
        cardsPerLine: z.number().positive(),
        cursor: z.number().nullish(),
      })
    )
    // TODO: add a small random delay before sending response
    .query<{
      cards: CardModel[];
      cursorStep: number;
      nextCursor: number;
    }>(({ input, ctx: { session } }) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            cards: Array.from(
              Array(input.cardsPerLine * 10).keys()
            ).map<CardModel>((generation) => {
              const id =
                generation + (input.cursor ?? 0) === 0 && input.reference
                  ? input.reference
                  : (uuidv4() as string);
              const creator = {
                username: `creator_${generation}`,
                link: "",
              };
              const collection = {
                slug: `collection_${generation}`,
                size: Math.floor(Math.random() * 10 + 10),
                playcost: +Math.random().toFixed(2),
                link: "",
                creator,
              };

              return {
                reference:
                  input.reference ?? `USER_${session?.user?.id ?? "UNDEFINED"}`,
                id,
                generation: generation + (input.cursor ?? 0),

                link: `/${creator.username}/${collection.slug}#${id}`,
                slug: `card_${generation}`,
                collection,
              };
            }),
            cursorStep: input.cardsPerLine * 10,
            nextCursor: (input.cursor ?? 0) + input.cardsPerLine * 10,
          });
        }, 1000 + 5000 * Math.random());
      });
    }),
});
