import { type PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

import { type MonthlyProfit } from "./models";
import { dayjs } from "./format";

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

export function fakeMonthlyProfits(): MonthlyProfit[] {
  return fakeArray(2, 10).map(() => ({
    year: 2023,
    month: Math.round(Math.random() * 11) as MonthlyProfit["month"],
    profit: Math.floor(Math.random() * 1000),
  }));
}

type FakeCollectionOptions = { producerId: string } & (
  | { cards: true }
  | { cards: true; consumers: true; consumerId: string }
  | { profit: true }
);

export async function createFakeCollection(
  prisma: PrismaClient,
  options: FakeCollectionOptions
) {
  const collectionId = "FAKE_COL";
  const cards =
    "cards" in options ? fakeArray(2, 10).map((i) => `FAKE_CARD_${i}`) : [];
  const consumers =
    "consumers" in options
      ? fakeArray(2, cards.length).map((i) => `FAKE_CON_CARD_${i}`)
      : [];
  const profits =
    "profit" in options
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
      producerId: options.producerId,
      gameplayPriceRef: "PRICE_REF",
    },
  });

  await Promise.all(
    cards.map(($) =>
      prisma.card.create({
        data: {
          id: $,
          name: $,
          collectionId,
        },
      })
    )
  );

  await Promise.all(
    consumers.map(($, i) =>
      prisma.consumerCard.create({
        data: {
          consumerId: options.consumerId,
          cardId: cards[i],
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
          producerId: options.producerId,
        },
      })
    )
  );

  return { collectionId, cards, consumers, profits };
}
