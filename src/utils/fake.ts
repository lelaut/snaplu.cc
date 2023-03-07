import { type PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

import { type MonthlyProfit } from "./models";
import { dayjs } from "./format";
import { hashcode } from "./core";

export function fakeArray(min: number, max: number) {
  return Array.from(
    Array(Math.floor(Math.random() * (max - min) + min)).keys()
  );
}

export function fakeCollectionCards() {
  return fakeArray(10, 20).map(() => ({
    id: uuidv4(),
    color: ["#f00", "#0f0", "#00f"][Math.floor(Math.random() * 3)] as string,
    imageSrc: Math.random() < 0.2,
  }));
}

export function fakeCollections(creatorUsername: string) {
  return fakeArray(2, 6).map(() => {
    const id = uuidv4();
    const name = `COLLECITON_${id.slice(0, 8)}`;

    return {
      name,
      description: `Collection ${id} description...`,
      link: `${creatorUsername}/${name}`,
      playcost: Math.random() * 0.9 + 0.1,
      playLink: `/card/${id}`,
      creatorUsername,
      creatorLink: `/${creatorUsername}`,

      cardsUnblocked: fakeCollectionCards(),
      cardsBlocked: Math.floor(Math.random() * 10 + 10),
    };
  });
}

export function fakeDeposits() {
  return fakeArray(2, 7).map(() => ({
    amount: Math.random() * 100 + 10,
    paymentMethod: "PIX",
    createdAt: +new Date() - Math.random() * 1000 * 60 * 60 * 10,
  }));
}

export function fakeDelay<T>(f: () => T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(f());
    }, 1000 + 3000 * Math.random());
  });
}

export async function createFakeUsers(
  prisma: PrismaClient,
  randomness: number
) {
  const producers = fakeArray(2, 10).map((i) => `FAKE_PRO_${i}_${randomness}`);
  const consumers = fakeArray(2, 10).map((i) => `FAKE_CON_${i}_${randomness}`);

  const consumerEntities = await Promise.all(
    consumers.map(async ($) => {
      const user = await prisma.user.create({
        data: {
          name: $,
        },
      });
      const consumer = await prisma.consumer.create({
        data: {
          id: user.id,
          credits: Math.floor(10000 + Math.random() * 10000),
          creditsCurrency: "BRL",
        },
      });

      await prisma.creditPurchase.createMany({
        data: fakeArray(2, 5).map(() => ({
          consumerId: consumer.id,
          unitAmount: Math.floor(1000 + Math.random() * 5000),
          currency: "BRL",
          transactionRef: "TRANSACTION_REF",
        })),
      });

      return consumer;
    })
  );

  const collections = await Promise.all(
    producers.map(async ($, i) => {
      const user = await prisma.user.create({
        data: {
          name: $,
        },
      });
      await prisma.producer.create({
        data: {
          id: user.id,
          nickname: `NICK_${$}`,
          description: `Description for ${$}`,
          slug: $.toLowerCase(),
        },
      });
      return await createFakeCollection(prisma, {
        randomness: String(randomness + i + 1),
        producerId: user.id,
        cards: true,
        profit: true,
        consumerId:
          consumerEntities[
            Math.floor(Math.random() * consumerEntities.length) %
              consumerEntities.length
          ]?.id,
      });
    })
  );

  await prisma.gameplay.createMany({
    data: fakeArray(2, 5).map(() => {
      const collection =
        collections[
          Math.floor(Math.random() * collections.length) % collections.length
        ];
      const collectionId = collection?.collectionId ?? "";
      const cardId =
        collection?.cardIds[
          Math.floor(Math.random() * collection?.cardIds.length) %
            collection?.cardIds.length
        ] ?? "";
      const consumerId =
        consumerEntities[
          Math.floor(Math.random() * consumerEntities.length) %
            consumerEntities.length
        ]?.id ?? "";

      return {
        collectionId,
        cardId,
        consumerId,
      };
    }),
  });
}

interface FakeCollectionOptions {
  randomness: string;
  producerId: string;
  cards?: true;
  consumerId?: string;
  profit?: true;
}

export async function createFakeCollection(
  prisma: PrismaClient,
  { randomness, producerId, cards, consumerId, profit }: FakeCollectionOptions
) {
  const collectionId = `FAKE_COL_${randomness}`;
  const cardIds =
    typeof cards !== "undefined"
      ? fakeArray(2, 10).map((i) => `FAKE_CARD_${i}_${randomness}`)
      : [];
  const consumerCardIds =
    typeof consumerId !== "undefined"
      ? fakeArray(2, cardIds.length).map(
          (i) => `FAKE_CON_CARD_${i}_${randomness}`
        )
      : [];
  const profits =
    profit === true
      ? fakeArray(24, 100).map((i) => ({
          period: dayjs()
            .subtract(i + 1, "month")
            .toDate(),
          value: Math.random() * 1000 + 100,
        }))
      : [];

  await prisma.collection.create({
    data: {
      id: collectionId,
      name: "col_name",
      description: "col_description",
      producerId: producerId,
      gameplayPriceRef: "PRICE_REF",
    },
  });

  await Promise.all(
    cardIds.map(($, i) =>
      prisma.card.create({
        data: {
          id: $,
          generation: i,
          collectionId,
        },
      })
    )
  );

  await Promise.all(
    consumerCardIds.map(($, i) =>
      prisma.consumerCard.create({
        data: {
          consumerId: consumerId ?? "",
          cardId: cardIds[i] ?? "",
        },
      })
    )
  );

  await Promise.all(
    profits.map(($) =>
      prisma.collectionProfit.create({
        data: {
          collectionId,
          period: $.period,
          profit: $.value,
          updatedAt: $.period,
          producerId: producerId,
        },
      })
    )
  );

  return { collectionId, cardIds, consumerCardIds, profits };
}

interface RandomImageProps {
  id: string;
  width: number;
  height: number;
}

export function randomImage({ id, width, height }: RandomImageProps) {
  // https://picsum.photos/images#34
  const TOTAL_IMAGES = 1084;
  const img = hashcode(id);

  return `https://picsum.photos/id/${img}/${Math.floor(width)}/${Math.floor(
    height
  )}`;
}
