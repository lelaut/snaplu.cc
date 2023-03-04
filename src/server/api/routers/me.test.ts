/**
 * @jest-environment node
 */

import { createFakeCollection } from "../../../utils/fake";
import { bucketKey } from "../../../utils/format";
import { createTestRouter, getSignedUrlPattern } from "../../../utils/testing";
import { prisma } from "../../db";

describe("test me router", () => {
  const USER = { id: "tester_id", name: "tester" };

  beforeEach(async () => {
    await prisma.user.create({
      data: {
        ...USER,
      },
    });
    await prisma.producer.create({
      data: {
        id: USER.id,
      },
    });
    await prisma.consumer.create({
      data: {
        id: USER.id,
        credits: 0,
        creditsCurrency: "brl",
      },
    });
  });

  afterEach(async () => {
    const deleteProfits = prisma.collectionProfit.deleteMany();
    const deletePurchases = prisma.creditPurchase.deleteMany();
    const deleteCCards = prisma.consumerCard.deleteMany();
    const deleteCards = prisma.card.deleteMany();
    const deleteUsers = prisma.user.deleteMany();

    await prisma.$transaction([
      deleteProfits,
      deletePurchases,
      deleteCCards,
      deleteCards,
      deleteUsers,
    ]);
  });

  it("happy path for me.creditPurchases route", async () => {
    const EXPECTED = ["TX_REF_1", "TX_REF_2"];

    // Arrange
    await Promise.all(
      EXPECTED.map((transactionRef) =>
        prisma.creditPurchase.create({
          data: {
            consumerId: USER.id,
            transactionRef,
          },
        })
      )
    );

    // Act
    const router = createTestRouter(USER);
    const { purchases: received } = await router.me.creditPurchases({
      cursor: null,
    });

    // Assert
    expect(EXPECTED.length).toBe(received.length);
    received.forEach(($) => {
      expect(EXPECTED.includes($.transactionRef)).toBe(true);
    });
  });

  it("happy path for me.deck route", async () => {
    // Arrange
    const {
      collectionId: E_COLL,
      cards: E_CARDS,
      consumers: E_CONS,
    } = await createFakeCollection(prisma, {
      producerId: USER.id,
      cards: true,
      consumers: true,
      consumerId: USER.id,
    });

    // Act
    const router = createTestRouter(USER);
    const { cards } = await router.me.deck({
      cursor: null,
      cardsPerLine: 2,
    });

    // Assert
    expect(E_CONS.length).toBe(cards.length);
    cards.forEach(($) => {
      expect(E_CARDS.includes($.id)).toBe(true);
      expect(E_CARDS.includes($.name)).toBe(true);
      expect($.collectionId).toBe(E_COLL);
      expect($.url).toMatch(
        getSignedUrlPattern(bucketKey(USER.id, E_COLL, $.id), "GetObject")
      );
    });
  });

  // it("fail to get signed url for deck's card", async () => {
  //   const router = createTestRouter(USER);
  // });

  it("happy path for me.content route", async () => {
    // Arrange
    const { profits: E_PROFITS } = await createFakeCollection(prisma, {
      producerId: USER.id,
      profit: true,
    });

    // Act
    const router = createTestRouter(USER);
    const { totalProfitLastFiveMonths, contentByCursor } =
      await router.me.content({ cursor: null });

    // Assert
    expect(totalProfitLastFiveMonths.length).toBe(5);
    totalProfitLastFiveMonths.forEach(($) => {
      const sum = E_PROFITS.reduce(
        (acc, profit) =>
          (+$.period === +profit.period ? profit.value : 0) + acc,
        0
      );
      expect($._sum.profit?.toNumber() ?? 0).toBeCloseTo(sum);
    });
  });
});
