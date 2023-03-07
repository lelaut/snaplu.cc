import {
  type NextPage,
  type GetStaticProps,
  type GetStaticPaths,
  type InferGetStaticPropsType,
} from "next";

import { LayoutWithNav, LayoutWithFixedContext } from "../../components/Layout";
import { ArtistLink } from "../../components/Link";
import { PlayAction } from "../../components/Action";
import {
  CollectionBlockedCard,
  CollectionFreeCard,
} from "../../components/Collection";
import { prisma } from "../../server/db";
import storage from "../../server/storage";

const CollectionPage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ userslug, collection }) => {
  return (
    <LayoutWithNav>
      <LayoutWithFixedContext
        contextContent={<p className="text-sm">{collection.description}</p>}
        contextTitle={collection.name}
        contextSubtitle={
          <p>
            <span className="opacity-50">by</span>{" "}
            <ArtistLink name={collection.creatorUsername} slug={userslug} />
          </p>
        }
        // TODO: add crazy animation when hovering
        contextAction={<PlayAction collectionId={collection.id} />}
      >
        <div className="flex flex-wrap justify-center gap-4 p-4">
          {collection.freeCards.map((card) => (
            <CollectionFreeCard key={card.url} url={card.url} />
          ))}
          <CollectionBlockedCard amount={collection.numberOfBlockedCards} />
        </div>
      </LayoutWithFixedContext>
    </LayoutWithNav>
  );
};

export default CollectionPage;

export const getStaticProps: GetStaticProps<{
  userslug: string;
  collection: {
    id: string;
    name: string;
    description: string;
    creatorUsername: string;

    freeCards: {
      url: string;
    }[];
    numberOfBlockedCards: number;
  };
}> = async ({ params }) => {
  if (typeof params?.collection === "undefined") {
    return { notFound: true };
  }

  const collection = await prisma.collection.findUnique({
    where: {
      id: params.collection as string,
    },
    select: {
      id: true,
      producerId: true,
      name: true,
      description: true,
      gameplayPriceRef: true,

      cards: {
        where: {
          rarity: null,
        },
        select: {
          id: true,
        },
      },
      _count: {
        select: {
          cards: true,
        },
      },
    },
  });

  if (collection === null) {
    return { notFound: true };
  }

  return {
    props: {
      collection: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        // TODO: fetch price from stripe
        freeCards: await Promise.all(
          collection.cards.map(async (card) => ({
            url: await storage.urlForFetchingCard({
              userId: collection.producerId,
              collectionId: collection.id,
              cardId: card.id,
              forever: true,
            }),
          }))
        ),
        numberOfBlockedCards: collection._count.cards - collection.cards.length,
      },
    },

    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 10 seconds
    revalidate: 10, // In seconds
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const collections = await prisma.collection.findMany({
    select: {
      id: true,
      producer: {
        select: {
          slug: true,
        },
      },
    },
  });

  return {
    paths: collections.map(($) => ({
      params: { userslug: $.producer.slug, collection: $.id },
    })),
    fallback: "blocking",
  };
};
