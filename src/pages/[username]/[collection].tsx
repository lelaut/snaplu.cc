import {
  type NextPage,
  type GetStaticProps,
  type GetStaticPaths,
  type InferGetStaticPropsType,
} from "next";
import Link from "next/link";
import {
  CollectionBlockedCard,
  CollectionUnblockedCard,
} from "../../components/Collection";

import { LayoutWithNav, LayoutWithFixedContext } from "../../components/Layout";
import { ArtistLink, PlayLink } from "../../components/Link";
import { fakeCollectionCards, fakeCollections } from "../../utils/fake";

const CollectionPage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ collection }) => {
  return (
    <LayoutWithNav>
      <LayoutWithFixedContext
        contextContent={<p className="text-sm">{collection.description}</p>}
        contextTitle={collection.name}
        contextSubtitle={
          <p>
            <span className="opacity-50">by</span>{" "}
            <ArtistLink
              name={collection.creatorUsername}
              link={collection.creatorLink}
            />
          </p>
        }
        // TODO: add crazy animation when hovering
        contextAction={<PlayLink link={collection.playLink} />}
      >
        <div className="flex flex-wrap justify-center gap-4 p-4">
          {collection.cardsUnblocked.map((card) => (
            <CollectionUnblockedCard key={card.id} color={card.color} />
          ))}
          <CollectionBlockedCard amount={collection.cardsBlocked} />
        </div>
      </LayoutWithFixedContext>
    </LayoutWithNav>
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
  return {
    props: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      collection: fakeCollections(params?.username as string)[0]!,
    },

    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 10 seconds
    revalidate: 10, // In seconds
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [{ params: { username: "creator_0", collection: "collection_0" } }],
    fallback: "blocking",
  };
};
