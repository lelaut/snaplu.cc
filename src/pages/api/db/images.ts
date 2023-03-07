import { type NextApiHandler } from "next";

import { prisma } from "../../../server/db";
import storage from "../../../server/storage";

const handler: NextApiHandler = async (req, res) => {
  const collection = await prisma.collection.findMany({
    select: {
      id: true,
      producerId: true,
    },
  });

  const data = await Promise.all(
    collection.map(async ($) => ({
      id: $.id,
      cards: await storage.getCollectionCards({
        userId: $.producerId,
        collectionId: $.id,
      }),
    }))
  );

  res.status(200).json(data);
};

export default handler;
