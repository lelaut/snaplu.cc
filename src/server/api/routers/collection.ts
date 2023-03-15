import { z } from "zod";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { supportedCurrencies } from "../../../utils/payment";
import { prisma } from "../../db";
import { RarityName } from "@prisma/client";

// TODO: add a slug to the collection model, this should also have a URL preview when
// creating a collection.
export const collectionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        cards: z
          .object({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            rarity: z.enum(Object.values(RarityName) as [string, ...string[]]),
          })
          .array()
          .nonempty(),
        price: z.object({
          unitAmount: z.number().int(),
          currency: z.enum(supportedCurrencies),
          others: z
            .object(
              supportedCurrencies.reduce(
                (acc, it) => ({
                  ...acc,
                  [it]: z.object({
                    unitAmount: z.number().int(),
                  }),
                }),
                {}
              )
            )
            .optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const collectionId = nanoid();
      const cards = await Promise.all(
        input.cards.map(async (card) => {
          const id = nanoid();
          const url = await ctx.storage.urlForUploadingCard({
            userId,
            collectionId,
            cardId: id,
          });

          return { ...card, id, url };
        })
      );

      const { id } = await ctx.payment.createCollectionPrice({
        userId,
        collectionId,
        collectionName: input.name,
        price: input.price,
      });

      await ctx.prisma.collection.create({
        data: {
          id: collectionId,
          name: input.name,
          description: input.description,
          gameplayPriceRef: id,
          producer: {
            connect: {
              id: userId,
            },
          },
          cards: {
            create: cards.map((card) => ({
              id: card.id,
              rarityName: card.rarity,
            })),
          },
        },
      });

      return {
        collectionId: collectionId,
        cardsNameToUploadLink: cards.reduce<Record<string, string>>(
          (acc, it) => ({
            ...acc,
            [it.id]: it.url,
          }),
          {}
        ),
      };
    }),

  // TODO: Create images embeddings
  confirm: protectedProcedure
    .input(z.string())
    .mutation(async ({ input: collectionId, ctx }) => {
      const userId = ctx.session.user.id;
      const userName = ctx.session.user.name ?? "none";
      const response = await ctx.storage.getCollectionCards({
        userId,
        collectionId,
      });
      const numberOfCardsInCollection = await prisma.card.count({
        where: {
          collectionId,
        },
      });
      const everyCardWasUploaded =
        response.cards === null
          ? false
          : response.cards.length === numberOfCardsInCollection &&
            response.cards.every((it) => (it.size ?? 0) > 0);

      if (!everyCardWasUploaded) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "not every card was uploaded",
        });
      }

      await ctx.prisma.collection.update({
        where: {
          id: collectionId,
        },
        data: {
          confirmed: true,
        },
      });

      return {
        redirect: `${userName}/${collectionId}`,
      };
    }),

  cardsUnlocked: publicProcedure
    .input(
      z.object({ producerId: z.string(), collectionId: z.string().optional() })
    )
    .query(async ({ input: { producerId, collectionId }, ctx }) => {
      const consumerId = ctx.session?.user.id;

      if (typeof consumerId === "undefined") return [];

      return await Promise.all(
        (
          await ctx.prisma.consumerCard.findMany({
            where: {
              card: {
                collectionId,
                collection: {
                  producerId,
                },
              },
              consumerId,
            },
            select: {
              cardId: true,
              card: {
                select: {
                  collectionId: true,
                  collection: {
                    select: {
                      producerId: true,
                    },
                  },
                },
              },
            },
          })
        ).map(async ($) => ({
          url: await ctx.storage.urlForFetchingCard({
            userId: $.card.collection.producerId,
            collectionId: $.card.collectionId,
            cardId: $.cardId,
          }),
        }))
      );
    }),
});
