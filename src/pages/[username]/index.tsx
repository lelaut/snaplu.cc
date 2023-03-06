import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  type NextPage,
  type InferGetStaticPropsType,
  type GetStaticPaths,
  type GetStaticProps,
} from "next";
import Link from "next/link";

import {
  CollectionBlockedCard,
  CollectionUnblockedCard,
} from "../../components/Collection";
import { LayoutWithNav, LayoutWithFixedContext } from "../../components/Layout";
import { PlayLink } from "../../components/Link";
import { prisma } from "../../server/db";
import { fakeCollections } from "../../utils/fake";
import { bucketKey } from "../../utils/format";

const UserPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  user,
}) => {
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
                    href={collection.link}
                    className="truncate text-lg font-bold tracking-wider transition hover:opacity-50"
                  >
                    {collection.name}
                  </Link>
                  <p className="truncate text-sm opacity-50">
                    {collection.description}
                  </p>
                </div>
                <PlayLink link={collection.playLink} />
              </div>
              <Link href={collection.link}>
                <div className="flex gap-4 overflow-x-auto p-4">
                  {collection.cardsUnblocked.map((card) => (
                    <CollectionUnblockedCard key={card.id} color={card.color} />
                  ))}
                  <CollectionBlockedCard amount={collection.cardsBlocked} />
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
  user: {
    name: string;
    description: string;

    collections: {
      name: string;
      description: string;
      link: string;
      playcost: number;
      playLink: string;
      creatorUsername: string;
      creatorLink: string;

      cardsUnblocked: {
        id: string;
        color: string;
        imageSrc: boolean;
      }[];
      cardsBlocked: number;
    }[];
  };
}> = ({ params }) => {
  if (typeof params === "undefined") {
    return { props: {} };
  }

  const data = await prisma.producer.findUnique({
    where: {
      slug: params.username as string,
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
              cards: {
                where: {
                  NOT: {
                    rarity: null,
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (data === null) {
    return { props: {} };
  }

  return {
    props: {
      user: {
        name: data.nickname,
        description: data.description,

        collections: data.collections.map((collection) => ({
          id: collection.id,
          name: collection.name,
          description: collection.description,
          // TODO: fetch price from stripe
          freeCards: collection.cards.map((card) => ({
            // TODO: must never expirer
            url: getSignedUrl(bucketKey(data.id, collection.id, card.id), "GetObject"),
          }))
          
        }))

        collections: fakeCollections(username),
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
    paths: users.map(($) => ({ params: { username: $.slug } })),
    fallback: "blocking",
  };
};
