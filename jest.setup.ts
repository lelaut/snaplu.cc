// import { mockDeep } from "jest-mock-extended";
// import Stripe from "stripe";

jest.mock("nanoid", () => {
  let counter = -1;
  return {
    nanoid: jest.fn(() => {
      counter += 1;
      return `NANOID_${counter}`;
    }),
  };
});

// jest.mock("./src/server/payment", () => ({
//   stripe: mockDeep<Stripe>(),
//   supportedCurrencies: ["brl", "usd"],
// }));

jest.mock("./src/server/payment");
