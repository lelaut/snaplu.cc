// TODO: get this from Stripe API: https://stripe.com/docs/api/country_specs/list?lang=node
// export const supportedCurrencies: [string, ...string[]] = ["brl", "usd"];

export const supportedCurrencies = ["brl", "usd"] as const;
export type SupportedCurrencies = (typeof supportedCurrencies)[number];
