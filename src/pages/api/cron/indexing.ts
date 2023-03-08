import { type NextRequest, NextResponse } from "next/server";

import { prisma } from "../../../server/db";
import embedding from "../../../server/services/embedding";
import storage from "../../../server/storage";
import vsearch from "../../../server/vsearch";

// export const config = {
//   runtime: "edge",
// };

// TODO: this should not be run by anyone
export default async function handler(req: NextRequest) {
  const cards = await prisma.card.findMany({
    where: {
      embeddedAt: null,
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

  const card = cards[1]!;
  const url = await storage.urlForFetchingCard({
    userId: card.collection.producerId,
    collectionId: card.collectionId,
    cardId: card.id,
  });

  console.log({
    id: card.id,
    url: "http://snaplucc-dev.localstack:4566/card/clezs8mmi0080120nncytg4u3/FAKE_COL_1678286146613/FAKE_CARD_0_1678286146613",
    // url: "http://snaplucc-dev.localhost.localstack.cloud:4566/card/clezs8mmi0080120nncytg4u3/FAKE_COL_1678286146613/FAKE_CARD_0_1678286146613",
  });

  const vector = await embedding(
    "http://snaplucc-dev.localstack:4566/card/clezs8mmi0080120nncytg4u3/FAKE_COL_1678286146613/FAKE_CARD_0_1678286146613"
  );

  console.log("embedding size", vector.length);

  return new NextResponse(JSON.stringify({ text: "success" }), {
    status: 200,
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

  return new NextResponse(JSON.stringify({ ids: cardIds, embeddedAt }), {
    status: 200,
  });
}
