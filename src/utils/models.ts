export interface CardModel {
  reference: string;
  id: string;
  generation: number;

  link: string;
  slug: string;
  collection: {
    slug: string;
    size: number;
    playcost: number;
    link: string;
    creator: {
      username: string;
      link: string;
    };
  };
}

export interface CollectionModel {
  id: string;

  slug: string;
  description: string;
  size: number;
  playcost: number;
  link: string;
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
