import { NextApiHandler } from "next";
import { CARD_ASPECT, MIN_CARD_WIDTH } from "../../../components/Collection";
import { prisma } from "../../../server/db";
import storage from "../../../server/storage";
import { flushDb } from "../../../utils/db";
import { createFakeUsers, randomImage } from "../../../utils/fake";

const handler: NextApiHandler = async (req, res) => {
  await flushDb(prisma);
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

  await Promise.all(
    data.map(async ($, i) => {
      const uploadUrl = await storage.urlForUploadingCard({
        userId: $.collection.producerId,
        collectionId: $.collection.id,
        cardId: $.id,
      });

      const image = await fetch(
        randomImage({
          id: $.id,
          width: MIN_CARD_WIDTH,
          height: MIN_CARD_WIDTH * CARD_ASPECT,
        })
      );

      await fetch(uploadUrl, {
        method: "PUT",
        body: await image.blob(),
      });
    })
  );

  res.status(200).json({ status: "success" });
};

export default handler;
