import { type NextApiHandler } from "next";

import { prisma } from "../../../server/db";
import storage from "../../../server/storage";
import vsearch from "../../../server/vsearch";
import { flushDb } from "../../../utils/db";
import { createFakeUsers, randomImage } from "../../../utils/fake";
import { untilResolveAll } from "../../../utils/promise";
import { indexing } from "../cron/indexing";

const handler: NextApiHandler = async (req, res) => {
  await flushDb(prisma);
  await vsearch.clear();
  await createFakeUsers(prisma, +new Date());

  const data = await prisma.card.findMany({
    select: {
      id: true,
      collection: {
        select: {
          id: true,
          producerId: true,
        },
      },
    },
  });

  await untilResolveAll(
    data.map(async ($) => {
      const uploadUrl = await storage.urlForUploadingCard({
        userId: $.collection.producerId,
        collectionId: $.collection.id,
        cardId: $.id,
      });

      const image = await fetch(
        randomImage({
          id: $.id,
        })
      );
      const blob = await image.blob();

      await fetch(uploadUrl, {
        method: "PUT",
        body: blob,
      });
    })
  );

  const collections = await prisma.collection.findMany({
    select: {
      id: true,
      producerId: true,
    },
  });

  const cards = (
    await Promise.all(
      collections.map(async ($) => {
        const { cards } = await storage.getCollectionCards({
          userId: $.producerId,
          collectionId: $.id,
        });
        return cards ?? [];
      })
    )
  ).flatMap(($) => $);

  try {
    await indexing();
  } catch (e) {
    res.status(500).end((e as Error).message);
  }

  res.status(200).json({ cards });
};

export default handler;
