import Stripe from "stripe";

import { env } from "../env.mjs";

// TODO: decouple this into a generic interface instead, name `payment`
export const stripe = new Stripe(env.STRIPE_API_KEY, {
  apiVersion: "2022-11-15",
});

// TODO: get this from Stripe API: https://stripe.com/docs/api/country_specs/list?lang=node
export const supportedCurrencies: [string, ...string[]] = ["brl", "usd"];
