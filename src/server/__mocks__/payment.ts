import Stripe from "stripe";

import { env } from "../../env.mjs";

// export { supportedCurrencies } from "../payment";

export const stripe = new Stripe("sk_test_123", {
  apiVersion: "2022-11-15",
  host: env.STRIPE_HOST,
  port: +env.STRIPE_PORT,
  protocol: "http",
});

export const supportedCurrencies: [string, ...string[]] = ["brl", "usd"];
