import { type NextApiHandler } from "next";
import { env } from "../../../env.mjs";

import { prisma } from "../../../server/db";
import storage from "../../../server/storage";
import { s3Link } from "../../../utils/format";

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
      cards: (
        await storage.getCollectionCards({
          userId: $.producerId,
          collectionId: $.id,
        })
      ).cards?.map(($) => ({
        ...$,
        url: s3Link({ bucket: env.AWS_S3_BUCKET, key: $.key }),
      })),
    }))
  );

  res.status(200).json(data);
};

export default handler;
