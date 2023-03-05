import { type Card } from "@prisma/client";
import { type Decimal } from "@prisma/client/runtime";

export interface CardWithUrl extends Card {
  url: string;
}

export interface CollectionModel {
  id: string;

  slug: string;
  description: string;
  size: number;
  playcost: number;
  link: string;
  playLink: string;
  creator: {
    username: string;
    link: string;
  };
}

export type UserModel = {
  id: string;
  link: string;
} & (
  | {
      type: "producer";
    }
  | {
      type: "consumer";
    }
);

export interface MonthlyProfit {
  period: Date;
  profit: Decimal;
}

export interface CollectionWithProfits {
  id: string;
  name: string;
  cardId: string;
  profit: MonthlyProfit[];
}
