import { type NextApiHandler } from "next";

import { prisma } from "../../../server/db";
import embedding from "../../../server/services/embedding";
import storage from "../../../server/storage";
import vsearch from "../../../server/vsearch";

export async function indexing() {
  const cards = await prisma.card.findMany({
    where: {
      embeddedAt: null,
      rarity: null,
    },
    select: {
      id: true,
      collectionId: true,
      collection: {
        select: {
          producerId: true,
        },
      },
    },
  });

  // This must be sequential because is our responsability to call only when the server is not busy
  // https://github.com/replicate/cog/blob/75b7802219e7cd4cee845e34c4c22139558615d4/python/cog/server/runner.py#L84
  const vectors = [];
  for (const card of cards) {
    const url = await storage.urlForFetchingCard({
      userId: card.collection.producerId,
      collectionId: card.collectionId,
      cardId: card.id,
      forever: true,
    });

    vectors.push(await embedding(url));
  }

  const success = await vsearch.upload({
    batch: {
      vectors,
      ids: cards.map(($) => $.id),
    },
  });
  if (!success) {
    throw new Error("Unable to upload to the search engine");
  }

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
}

// TODO: this should not be run by anyone
const handler: NextApiHandler = async (req, res) => {
  try {
    await indexing();
  } catch (e) {
    res.status(500).end((e as Error).message);
  }
};

export default handler;
