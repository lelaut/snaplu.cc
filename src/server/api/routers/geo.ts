import geoip, { type Lookup } from "geoip-lite";

import { type SupportedCurrencies } from "../../../utils/payment";
import { createTRPCRouter, publicProcedure } from "../trpc";

interface MeResponse extends Partial<Lookup> {
  currency: SupportedCurrencies;
}

export const geoRouter = createTRPCRouter({
  me: publicProcedure.query<MeResponse>(({ ctx: { ip } }) => {
    if (typeof ip !== "undefined") {
      return { ...geoip.lookup(ip), currency: "usd" };
    }
    return { country: "US", currency: "usd" };
  }),
});
