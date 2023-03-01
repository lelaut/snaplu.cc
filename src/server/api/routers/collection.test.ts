/**
 * @jest-environment node
 */

import { env } from "../../../env.mjs";
import { bucketKey } from "../../../utils/format";
import { createTestRouter } from "../../../utils/test";
import { prismaMock as prisma } from "../../__mocks__/db.js";

describe("test collection router", () => {
  const USER: any = { id: "tester_id", name: "tester" };

  it("happy path for collection.create route", async () => {
    const router = createTestRouter(USER);

    const createCollection = prisma.collection.create.mockResolvedValue(
      // TODO: return a real collection
      {} as any
    );

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

    // Expected db changes
    expect(createCollection).toHaveBeenCalledTimes(1);

    // Expected result
    expect(createResult.collectionId).toBe("nanoid_1");
    expect(createResult.cardsNameToUploadLink).toBe({
      card_1: `signed_url_(${JSON.stringify({
        Bucket: env.AWS_S3_BUCKET,
        Key: bucketKey("user_id", "nanoid_1", "nanoid_2"),
      })})_${env.AWS_S3_PUT_EXP}_1`,
      card_2: `signed_url_(${JSON.stringify({
        Bucket: env.AWS_S3_BUCKET,
        Key: bucketKey("user_id", "nanoid_1", "nanoid_3"),
      })})_${env.AWS_S3_PUT_EXP}_2`,
    });
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
});
