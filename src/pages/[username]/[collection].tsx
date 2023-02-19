import {
  type NextPage,
  type GetStaticProps,
  type GetStaticPaths,
  type InferGetStaticPropsType,
} from "next";
import Link from "next/link";
import Card from "../../components/Card";

import { Layout, LayoutWithFixedContext } from "../../components/Layout";
import { ArtistLink } from "../../components/Link";

const CollectionPage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ collection }) => {
  return (
    <Layout>
      <LayoutWithFixedContext
        contextContent={<p className="text-sm">{collection.description}</p>}
        contextTitle={collection.name}
        contextSubtitle={
          <p className="text-xs">
            <span className="opacity-50">by</span>{" "}
            <ArtistLink
              name={collection.creatorUsername}
              link={collection.creatorLink}
            />
          </p>
        }
        // TODO: add crazy animation when hovering
        contextAction={
          <Link
            href={collection.playLink}
            className="rounded-full bg-green-400 px-6 py-1 font-bold text-green-800 shadow-2xl shadow-green-500"
          >
            Play
          </Link>
        }
      >
        <div className="flex flex-wrap justify-center gap-4 p-4">
          {collection.cardsUnblocked.map((card, i) => (
            <div
              key={i}
              className="h-[300px] w-[200px] rounded shadow"
              style={{ backgroundColor: card.color }}
            ></div>
          ))}
          {collection.cardsBlocked > 0 && (
            <div className="flex h-[300px] w-[200px] flex-col items-center justify-center gap-1 rounded bg-neutral-100 shadow ring-2 dark:bg-neutral-700">
              <p className="text-2xl font-bold">+{collection.cardsBlocked}</p>
              <p className="text-xs">
                <span className="rounded-full bg-green-400 px-2 py-px font-bold text-green-600">
                  Play
                </span>{" "}
                <span className="opacity-50">to unlock more cards</span>
              </p>
            </div>
          )}
        </div>
      </LayoutWithFixedContext>
    </Layout>
  );
};

export default CollectionPage;

export const getStaticProps: GetStaticProps<{
  collection: {
    name: string;
    description: string;
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
  };
}> = ({ params }) => {
  // const res = await fetch("https://.../posts");
  // const posts = await res.json();

  const collection = params?.collection as string;
  const username = params?.username as string;
  const totalCards = Math.floor(Math.random() * 40 + 30);

  return {
    props: {
      collection: {
        name: collection,
        description: `Lorem ipsum description ${collection} ${username}`,
        playcost: Math.random() * 0.9 + 0.1,
        playLink: `/play/${`ID_${collection}`}`,
        creatorUsername: username,
        creatorLink: `/${username}`,

        cardsUnblocked: Array.from(
          Array(Math.floor(totalCards * 0.2)).keys()
        ).map((i) => ({
          id: `${username}_${collection}_CARD_${i + 1}`,
          color: ["#f00", "#0f0", "#00f"][
            Math.floor(Math.random() * 3)
          ] as string,
          imageSrc: Math.random() < 0.2,
        })),
        cardsBlocked: totalCards - Math.floor(totalCards * 0.2),
      },
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 10 seconds
    revalidate: 10, // In seconds
  };
};

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// the path has not been generated.
export const getStaticPaths: GetStaticPaths = () => {
  // We'll pre-render only these paths at build time.
  // { fallback: 'blocking' } will server-render pages
  // on-demand if the path doesn't exist.
  return {
    paths: [{ params: { username: "creator_0", collection: "collection_0" } }],
    fallback: "blocking",
  };
};
