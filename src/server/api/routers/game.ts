import { z } from "zod";
import { v4 as uuid } from "uuid";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const gameRouter = createTRPCRouter({
  gameplay: protectedProcedure.input(z.string().uuid()).query(() => {
    const id = uuid();

    return {
      card: {
        name: "Some card name",
        color: "pink",
        rarity: "normal",
        link: `/deck#${id}`,
      },
      replayLink: "/play/COLLECTION_ID",
      collectionLink: `/username/collection`,
    };
  }),
});
