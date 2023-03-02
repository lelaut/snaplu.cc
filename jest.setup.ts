import { mockDeep } from "jest-mock-extended";
import Stripe from "stripe";

jest.mock("nanoid", () => {
  return {
    nanoid: jest.fn(() => "NANO_ID"),
  };
});

jest.mock("./src/server/payment", () => ({
  stripe: mockDeep<Stripe>(),
  supportedCurrencies: ["brl", "usd"],
}));

jest.mock("./src/server/db");
