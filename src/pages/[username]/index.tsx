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
} from "../../components/Card";
import { LayoutWithNav, LayoutWithFixedContext } from "../../components/Layout";
import { PlayLink } from "../../components/Link";
import { fakeCollections } from "../../utils/fake";

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
  const username = params?.username as string;

  return {
    props: {
      user: {
        name: username,
        description: `User ${username} description...`,

        collections: fakeCollections(username),
      },
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 10 seconds
    revalidate: 10, // In seconds
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [{ params: { username: "creator_0" } }],
    fallback: "blocking",
  };
};
