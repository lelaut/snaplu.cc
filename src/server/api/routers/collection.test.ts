/**
 * @jest-environment node
 */

import { bucketKey } from "../../../utils/format";
import { createTestRouter, getSignedUrlPattern } from "../../../utils/test";
import { prisma } from "../../db";

describe("test collection router", () => {
  const USER = { id: "tester_id", name: "tester" };

  beforeAll(async () => {
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
  });

  afterAll(async () => {
    const deleteUsers = prisma.user.deleteMany();

    await prisma.$transaction([deleteUsers]);

    await prisma.$disconnect();
  });

  it("happy path for collection.create route", async () => {
    const router = createTestRouter(USER.id);

    const createResult = await router.collection.create({
      name: "col_name",
      description: "col_desc",
      cardsName: ["card_1", "card_2"],
      price: {
        unitAmount: 100,
        currency: "brl",
      },
    });

    const createdCollection = await prisma.collection.findFirst();
    expect(createdCollection?.producerId).toBe(USER.id);
    expect(
      createdCollection?.gameplayPriceRef.startsWith("price_")
    ).toBeTruthy();

    // Expected result
    expect(createResult.collectionId).toBe("NANOID_0");
    expect(Object.keys(createResult.cardsNameToUploadLink).length).toBe(2);
    expect(createResult.cardsNameToUploadLink.card_1).toMatch(
      getSignedUrlPattern(
        bucketKey(USER.id, "NANOID_0", "NANOID_1"),
        "PutObject"
      )
    );
    expect(createResult.cardsNameToUploadLink.card_2).toMatch(
      getSignedUrlPattern(
        bucketKey(USER.id, "NANOID_0", "NANOID_2"),
        "PutObject"
      )
    );
  });

  // it("create signed url fail", async () => {
  //   const router = createTestRouter(USER);
  // });

  // it("create price fail", async () => {
  //   const router = createTestRouter(USER);
  // });

  // it("create collection in db fail", async () => {
  //   const router = createTestRouter(USER);
  // });

  // it("when collection name already in use", async () => {
  //   const router = createTestRouter(USER);
  // });

  // // TODO: try to add a custom validator to zod
  // it("when card name duplicated", async () => {
  //   const router = createTestRouter(USER);
  // });

  // it("happy path for collection.confirm route", async () => {
  //   const router = createTestRouter(USER);

  //   // const confirmResponse = await router.collection.confirm("collection_id");
  // });

  // it("listing s3 bucket fails", async () => {
  //   const router = createTestRouter(USER);
  // });

  // it("some content not uploaded", async () => {
  //   const router = createTestRouter(USER);
  // });

  // it("fail to create collection", async () => {
  //   const router = createTestRouter(USER);
  // });
});
