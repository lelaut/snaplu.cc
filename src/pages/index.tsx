import { type NextPage } from "next";
import { useState } from "react";
import Head from "next/head";

import { api } from "../utils/api";
import { LayoutWithNav } from "../components/Layout";
import { useWindowDimensions } from "../utils/hooks";
import { cardsPerLine, CardsGrid } from "../components/Collection";
import { type CardModel } from "../utils/models";

const HomePage: NextPage = () => {
  const [reference, setReference] = useState<string | undefined>();

  const { width } = useWindowDimensions();

  // TODO: deal with error responses, maybe send user to another page?
  const explore = api.explore.cards.useInfiniteQuery(
    {
      reference,
      cardsPerLine: cardsPerLine(
        typeof window !== "undefined" ? window.innerWidth : 1
      ),
    },
    {
      getNextPageParam: (it) => it.nextCursor,
      refetchOnWindowFocus: false,
    }
  );

  const cards =
    explore.data?.pages.flatMap((it) => {
      return it.cards;
    }) ?? [];

  // TODO: change URL to use the hash
  const handleCardClick = async ({ id }: CardModel) => {
    await explore.refetch();
    setReference(id === reference ? undefined : id);
  };

  return (
    <>
      <Head>
        <title>SnapLucc</title>
        <meta name="description" content="Exploring photos in our database" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <LayoutWithNav>
        <CardsGrid
          width={width}
          onClick={handleCardClick}
          cards={cards}
          isFetchingNextPage={explore.isFetchingNextPage}
          fetchNextPage={
            explore.fetchNextPage as unknown as () => Promise<void>
          }
        />
      </LayoutWithNav>
    </>
  );
};

export default HomePage;
