import { z } from "zod";
import { v4 as uuid } from "uuid";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { type CardModel } from "../../../utils/models";
import { fakeDelay } from "../../../utils/fake";

export const exploreRouter = createTRPCRouter({
  cards: publicProcedure
    .input(
      z.object({
        reference: z.string().uuid().optional(),
        cardsPerLine: z.number().positive(),
        cursor: z.number().nullish(),
      })
    )
    .query<{
      cards: CardModel[];
      cursorStep: number;
      nextCursor: number;
    }>(({ input, ctx: { session } }) => {
      return fakeDelay(() => ({
        cards: Array.from(Array(input.cardsPerLine * 10).keys()).map<CardModel>(
          (generation) => {
            const id =
              generation + (input.cursor ?? 0) === 0 && input.reference
                ? input.reference
                : uuid();
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
              reference:
                input.reference ?? `USER_${session?.user?.id ?? "UNDEFINED"}`,
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
      }));
    }),
});
