/**
 * @jest-environment node
 */

import { createTestRouter } from "../../../utils/test";

describe("test me router", () => {
  const USER: any = { id: "tester_id", name: "tester" };

  it("happy path for me.creditPurchases route", async () => {
    const router = createTestRouter(USER);
  });

  it("happy path for me.deck route", async () => {
    const router = createTestRouter(USER);
  });

  it("fail to get signed url for deck's card", async () => {
    const router = createTestRouter(USER);
  });

  it("happy path for me.content route", async () => {
    const router = createTestRouter(USER);
  });
});
