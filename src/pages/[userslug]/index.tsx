import {
  type NextPage,
  type InferGetStaticPropsType,
  type GetStaticPaths,
  type GetStaticProps,
} from "next";
import Link from "next/link";

import {
  CollectionBlockedCard,
  CollectionFreeCard,
} from "../../components/Collection";
import { LayoutWithNav, LayoutWithFixedContext } from "../../components/Layout";
import { PlayAction } from "../../components/Action";
import { prisma } from "../../server/db";
import storage from "../../server/storage";
import { collectionLink } from "../../utils/format";

const UserPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  user,
}) => {
  console.log({ user });

  // TODO: set 404.tsx page
  if (typeof user === "undefined") {
    return <p>error</p>;
  }

  return (
    <LayoutWithNav>
      <LayoutWithFixedContext
        contextTitle={user.name}
        contextAction={<button>Follow</button>}
        contextContent={<p>{user.description}</p>}
      >
        <div className="flex flex-col gap-4 p-4">
          {user.collections.map((collection) => (
            <div key={collection.name} className="p-2">
              <div className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <Link
                    href={collectionLink({
                      userslug: user.slug,
                      collectionId: collection.id,
                    })}
                    className="truncate text-lg font-bold tracking-wider transition hover:opacity-50"
                  >
                    {collection.name}
                  </Link>
                  <p className="truncate text-sm opacity-50">
                    {collection.description}
                  </p>
                </div>
                <PlayAction collectionId={collection.id} />
              </div>
              <Link
                href={collectionLink({
                  userslug: user.slug,
                  collectionId: collection.id,
                })}
              >
                <div className="flex gap-4 overflow-x-auto p-4">
                  {collection.freeCards.map((card) => (
                    <CollectionFreeCard key={card.url} url={card.url} />
                  ))}
                  <CollectionBlockedCard
                    amount={collection.numberOfBlockedCards}
                  />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </LayoutWithFixedContext>
    </LayoutWithNav>
  );
};

export default UserPage;

export const getStaticProps: GetStaticProps<{
  user?: {
    slug: string;
    name: string;
    description: string;

    collections: {
      id: string;
      name: string;
      description: string;

      freeCards: {
        url: string;
      }[];
      numberOfBlockedCards: number;
    }[];
  };
}> = async ({ params }) => {
  if (typeof params === "undefined") {
    return { notFound: true };
  }

  const data = await prisma.producer.findUnique({
    where: {
      slug: params.userslug as string,
    },
    select: {
      id: true,
      nickname: true,
      description: true,

      collections: {
        select: {
          id: true,
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
      },
    },
  });

  if (data === null) {
    return { notFound: true };
  }

  return {
    props: {
      user: {
        slug: params.userslug as string,
        name: data.nickname,
        description: data.description,

        collections: await Promise.all(
          data.collections.map(async (collection) => ({
            id: collection.id,
            name: collection.name,
            description: collection.description,
            // TODO: fetch price from stripe
            freeCards: await Promise.all(
              collection.cards.map(async (card) => ({
                url: await storage.urlForFetchingCard({
                  userId: data.id,
                  collectionId: collection.id,
                  cardId: card.id,
                  forever: true,
                }),
              }))
            ),
            numberOfBlockedCards:
              collection._count.cards - collection.cards.length,
          }))
        ),
      },
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 10 seconds
    revalidate: 10, // In seconds
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const users = await prisma.producer.findMany({
    select: {
      slug: true,
    },
  });

  return {
    paths: users.map(($) => ({ params: { userslug: $.slug } })),
    fallback: "blocking",
  };
};
