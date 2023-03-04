/**
 * @jest-environment node
 */

import { createFakeCollection } from "../../../utils/fake";
import { bucketKey } from "../../../utils/format";
import { createTestRouter, getSignedUrlPattern } from "../../../utils/testing";
import { prisma } from "../../db";

describe("test game router", () => {
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
    const deleteGameplays = prisma.gameplay.deleteMany();
    const deleteProfits = prisma.collectionProfit.deleteMany();
    const deletePurchases = prisma.creditPurchase.deleteMany();
    const deleteCCards = prisma.consumerCard.deleteMany();
    const deleteCards = prisma.card.deleteMany();
    const deleteUsers = prisma.user.deleteMany();

    await prisma.$transaction([
      deleteGameplays,
      deleteProfits,
      deletePurchases,
      deleteCCards,
      deleteCards,
      deleteUsers,
    ]);
  });

  it("happy path for game.get route", async () => {
    const COST = 100;

    // Arrange
    const { collectionId, cards } = await createFakeCollection(prisma, {
      producerId: USER.id,
      cards: true,
    });
    const gameplayId = "gameplay";
    await prisma.gameplay.create({
      data: {
        id: gameplayId,
        consumerId: USER.id,
        collectionId,
        cardId: cards[0],
      },
    });

    // Act
    const router = createTestRouter(USER);
    const { gameplay } = await router.game.get({ gameplayId });

    // Assert
    expect(gameplay.id).toBe(gameplayId);
    expect(gameplay.url).toMatch(
      getSignedUrlPattern(
        bucketKey(USER.id, collectionId, cards[0]),
        "GetObject"
      )
    );
  });

  // it("fail to find game", async () => {
  //   const router = createTestRouter(USER);
  // });

  // it("try to illegaly see a gameplay that it's not yours", async () => {
  //   const router = createTestRouter(USER);
  // });

  // it("fail to generate gameplay's card signed url", async () => {
  //   const router = createTestRouter(USER);
  // });

  it("happy path for game.play route", async () => {
    const COST = 2000;

    // Arrange
    const { collectionId, cards } = await createFakeCollection(prisma, {
      producerId: USER.id,
      cards: true,
    });
    await prisma.consumer.update({
      where: {
        id: USER.id,
      },
      data: {
        credits: COST,
      },
    });

    // Act
    const router = createTestRouter(USER);
    const { gameplay } = await router.game.play({ collectionId });

    // Assert
    const { credits } = await prisma.consumer.findUnique({
      where: { id: USER.id },
    });
    expect(credits).toBe(0n);
    expect(gameplay.collectionId).toBe(collectionId);
    expect(gameplay.consumerId).toBe(USER.id);
    expect(cards).toContain(gameplay.cardId);
  });

  // it("user without enough credit", async () => {
  //   const router = createTestRouter(USER);
  // });

  // it("fail to subtract user credit", async () => {
  //   const router = createTestRouter(USER);
  // });

  // it("fail to create gameplay", async () => {
  //   const router = createTestRouter(USER);
  // });

  // it("fail to create consumer card", async () => {
  //   const router = createTestRouter(USER);
  // });
});
