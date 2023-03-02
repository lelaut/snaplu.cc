/**
 * @jest-environment node
 */

import { createTestRouter } from "../../../utils/test";

describe("test game router", () => {
  const USER: any = { id: "tester_id", name: "tester" };

  it("happy path for game.get route", async () => {
    const router = createTestRouter(USER);
  });

  it("fail to find game", async () => {
    const router = createTestRouter(USER);
  });

  it("fail to generate gameplay's card signed url", async () => {
    const router = createTestRouter(USER);
  });

  it("happy path for game.play route", async () => {
    const router = createTestRouter(USER);
  });

  it("user without enough credit", async () => {
    const router = createTestRouter(USER);
  });

  it("fail to subtract user credit", async () => {
    const router = createTestRouter(USER);
  });

  it("fail to create gameplay", async () => {
    const router = createTestRouter(USER);
  });

  it("fail to create consumer card", async () => {
    const router = createTestRouter(USER);
  });
});
