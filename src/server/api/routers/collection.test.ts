/**
 * @jest-environment node
 */

import { PrismaClient } from "@prisma/client";
import { DeepMockProxy } from "jest-mock-extended";
import Stripe from "stripe";

import { bucketKey } from "../../../utils/format";
import { createTestRouter, getSignedUrlPattern } from "../../../utils/test";
import { prisma } from "../../db";
import { stripe } from "../../payment";

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
const stripeMock = stripe as unknown as DeepMockProxy<Stripe>;

describe("test collection router", () => {
  const USER: any = { id: "tester_id", name: "tester" };

  it("happy path for collection.create route", async () => {
    const createCollection = prismaMock.collection.create.mockResolvedValue(
      // TODO: return a real collection
      {} as any
    );
    const createPrices = stripeMock.prices.create.mockResolvedValue({
      id: "PRICE_ID",
    } as any);

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

    // Expected api calls
    // https://github.com/stripe/stripe-mock
    // use a combination of testmode and your own implementation to also
    // handle errors...
    expect(createPrices).toHaveBeenCalledTimes(1);

    // Expected db changes
    expect(createCollection).toHaveBeenCalledTimes(1);

    // Expected result
    expect(createResult.collectionId).toBe("NANO_ID");
    expect(Object.keys(createResult.cardsNameToUploadLink).length).toBe(2);
    expect(createResult.cardsNameToUploadLink.card_1).toMatch(
      getSignedUrlPattern(bucketKey(USER.id, "NANO_ID", "NANO_ID"), "PutObject")
    );
    expect(createResult.cardsNameToUploadLink.card_2).toMatch(
      getSignedUrlPattern(bucketKey(USER.id, "NANO_ID", "NANO_ID"), "PutObject")
    );
  });

  it("create signed url fail", async () => {
    const router = createTestRouter(USER);
  });

  it("create price fail", async () => {
    const router = createTestRouter(USER);
  });

  it("create collection in db fail", async () => {
    const router = createTestRouter(USER);
  });

  it("when collection name already in use", async () => {
    const router = createTestRouter(USER);
  });

  // TODO: try to add a custom validator to zod
  it("when card name duplicated", async () => {
    const router = createTestRouter(USER);
  });

  it("happy path for collection.confirm route", async () => {
    const router = createTestRouter(USER);

    const confirmResponse = await router.collection.confirm("collection_id");
  });

  it("listing s3 bucket fails", async () => {
    const router = createTestRouter(USER);
  });

  it("some content not uploaded", async () => {
    const router = createTestRouter(USER);
  });

  it("fail to create collection", async () => {
    const router = createTestRouter(USER);
  });
});
