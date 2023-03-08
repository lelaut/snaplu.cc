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
  CollectionCardLoading,
  CollectionFreeCard,
} from "../../components/Collection";
import { prisma } from "../../server/db";
import storage from "../../server/storage";
import { api } from "../../utils/api";

const CollectionPage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ userslug, collection }) => {
  const unlockedCards = api.collection.cardsUnlocked.useQuery({
    producerId: collection.producerId,
    collectionId: collection.id,
  });

  return (
    <LayoutWithNav>
      <LayoutWithFixedContext
        contextContent={<p className="text-sm">{collection.description}</p>}
        contextTitle={collection.name}
        contextSubtitle={
          <p>
            <span className="opacity-50">by</span>{" "}
            <ArtistLink name={collection.producerUsername} slug={userslug} />
          </p>
        }
        // TODO: add crazy animation when hovering
        contextAction={<PlayAction collectionId={collection.id} />}
      >
        <div className="flex flex-wrap justify-center gap-4 p-4">
          {collection.freeCards.map((card) => (
            <CollectionFreeCard key={card.url} url={card.url} />
          ))}
          {typeof unlockedCards.data !== "undefined" ? (
            <>
              {unlockedCards.data.map((card) => (
                <CollectionFreeCard key={card.url} url={card.url} />
              ))}
              <CollectionBlockedCard
                amount={
                  collection.numberOfBlockedCards - unlockedCards.data.length
                }
              />
            </>
          ) : (
            <CollectionCardLoading />
          )}
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
    producerId: string;
    producerUsername: string;

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
      producer: {
        select: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
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
      userslug: params.userslug as string,
      collection: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        producerId: collection.producerId,
        producerUsername: collection.producer.user.name ?? "",
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
