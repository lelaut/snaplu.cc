import { type NextApiHandler } from "next";

import { prisma } from "../../../server/db";
import embedding from "../../../server/services/embedding";
import storage from "../../../server/storage";
import vsearch from "../../../server/vsearch";

// TODO: this should not be run by anyone
const handler: NextApiHandler = async (req, res) => {
  const cards = await prisma.card.findMany({
    where: {
      embeddedAt: null,
      rarity: null,
    },
    select: {
      id: true,
      generation: true,
      collectionId: true,
      collection: {
        select: {
          producerId: true,
        },
      },
    },
  });
  const vectors = await Promise.all(
    cards.map(async (card) => {
      const url = await storage.urlForFetchingCard({
        userId: card.collection.producerId,
        collectionId: card.collectionId,
        cardId: card.id,
      });

      return await embedding(url);
    })
  );

  while (
    !(await vsearch.upload({
      batch: {
        vectors,
        ids: cards.map(($) => $.generation),
      },
    }))
  );

  const cardIds = cards.map(($) => $.id);
  const embeddedAt = new Date();

  await prisma.card.updateMany({
    where: {
      id: {
        in: cardIds,
      },
    },
    data: {
      embeddedAt,
    },
  });

  res.status(200).json({ ids: cardIds, embeddedAt });
};

export default handler;
