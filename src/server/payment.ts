import Stripe from "stripe";

import { env } from "../env.mjs";
import { type SupportedCurrencies } from "../utils/payment";

interface CreateCollectionPriceParams {
  userId: string;
  collectionId: string;
  collectionName: string;
  price: {
    unitAmount: number;
    currency: SupportedCurrencies;
    others?: Partial<Record<SupportedCurrencies, number>>;
  };
}

interface Price {
  id: string;
  unitAmount: number;
  currency: SupportedCurrencies;
}

class PaymentSystem {
  private stripe: Stripe;

  constructor() {
    this.stripe =
      process.env.NODE_ENV === "production"
        ? new Stripe(env.STRIPE_API_KEY, {
            apiVersion: "2022-11-15",
          })
        : new Stripe("sk_test_123", {
            apiVersion: "2022-11-15",
            host: env.STRIPE_HOST,
            port: +env.STRIPE_PORT,
            protocol: "http",
          });
  }

  async createCollectionPrice(
    create: CreateCollectionPriceParams
  ): Promise<Price> {
    const metadata = {
      userId: create.userId,
      collectionId: create.collectionId,
    };
    const response = await this.stripe.prices.create({
      unit_amount: create.price.unitAmount,
      currency: create.price.currency,
      metadata,
      product_data: {
        name: create.collectionName,
        metadata,
        // TODO: make sure this is right.
        // tax_code: env.STRIPE_TAX_CODE,
        unit_label: create.collectionName, // TODO: make it better?
      },
      currency_options:
        typeof create.price.others !== "undefined"
          ? Object.keys(create.price.others).reduce(
              (acc, currency) => ({
                ...acc,
                unit_amount: create.price.others[currency] as number,
              }),
              {}
            )
          : undefined,
    });

    // TODO: deal with error

    return {
      id: response.id,
      unitAmount: response.unit_amount ?? 0,
      currency: response.currency as SupportedCurrencies,
    };
  }

  async fetchCollectionPrice(
    priceId: string,
    // TODO: make the conversion with a static table fetched from [here]()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currency?: SupportedCurrencies
  ): Promise<Price> {
    const response = await this.stripe.prices.retrieve(priceId);

    // TODO: deal with error

    return {
      id: response.id,
      unitAmount: response.unit_amount ?? 0,
      currency: response.currency as SupportedCurrencies,
    };
  }
}

const payment = new PaymentSystem();

export default payment;
