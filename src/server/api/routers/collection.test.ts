/**
 * @jest-environment node
 */

import { TRPCError } from "@trpc/server";
import fs from "fs";

import { bucketKey } from "../../../utils/format";
import { createTestRouter, getSignedUrlPattern } from "../../../utils/testing";
import { prisma } from "../../db";
import storage from "../../storage";

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
  });

  it("happy path for collection.create route", async () => {
    const router = createTestRouter(USER);

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
    expect(createdCollection?.gameplayPriceRef.startsWith("price_")).toBe(true);

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

  it("happy path for collection.confirm route", async () => {
    const router = createTestRouter(USER);

    const createResponse = await router.collection.create({
      name: "collection_name",
      description: "collection_description",
      cardsName: ["card_1", "card_2"],
      price: {
        unitAmount: 100,
        currency: "brl",
      },
    });
    const testFile = fs.readFileSync("public/cat.jpg");
    await Promise.all(
      Object.values(createResponse.cardsNameToUploadLink).map((upload) =>
        fetch(upload, {
          method: "PUT",
          body: testFile,
        })
      )
    );

    const confirmResponse = await router.collection.confirm(
      createResponse.collectionId
    );

    const collection = await prisma.collection.findUnique({
      where: {
        id: createResponse.collectionId,
      },
    });

    expect(collection?.confirmed).toBe(true);
    expect(confirmResponse.redirect).toBe(`${USER.name}/NANOID_3`);

    await storage.deleteCollectionCards({
      userId: USER.id,
      collectionId: "NANOID_3",
      cardsId: ["NANOID_4", "NANOID_5"],
    });
    await prisma.collection.delete({
      where: {
        id: createResponse.collectionId,
      },
    });
  });

  // it("listing s3 bucket fails", async () => {
  //   const router = createTestRouter(USER);
  // });

  it("some content not uploaded", async () => {
    const router = createTestRouter(USER);

    const createResponse = await router.collection.create({
      name: "collection_name",
      description: "collection_description",
      cardsName: ["card_1", "card_2"],
      price: {
        unitAmount: 100,
        currency: "brl",
      },
    });
    const testFile = fs.readFileSync("public/cat.jpg");
    await Promise.all(
      Object.values(createResponse.cardsNameToUploadLink)
        .slice(1) // Skip one
        .map((upload) =>
          fetch(upload, {
            method: "PUT",
            body: testFile,
          })
        )
    );

    await expect(
      router.collection.confirm(createResponse.collectionId)
    ).rejects.toThrowError(
      new TRPCError({
        code: "BAD_REQUEST",
        message: "not every card was uploaded",
      })
    );

    const collection = await prisma.collection.findUnique({
      where: {
        id: createResponse.collectionId,
      },
    });
    expect(collection?.confirmed).toBe(false);

    await storage.deleteCollectionCards({
      userId: USER.id,
      collectionId: "NANOID_3",
      cardsId: ["NANOID_4", "NANOID_5"],
    });
    await prisma.collection.delete({
      where: {
        id: createResponse.collectionId,
      },
    });
  });

  // it("fail to create collection", async () => {
  //   const router = createTestRouter(USER);
  // });
});
