import { type NextPage } from "next";
import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import { api } from "../utils/api";
import { LayoutWithNav } from "../components/Layout";
import { useWindowDimensions } from "../utils/hooks";
import { cardsPerLine, CardsGrid } from "../components/Collection";

// TODO: make the initial page cached/static
const HomePage: NextPage = () => {
  const { asPath } = useRouter();
  const hash = asPath.split("#")[1];
  const [reference, setReference] = useState<string | undefined>(hash);

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

  const cards = explore.data?.pages.flatMap((it) => it.cards) ?? [];

  // TODO: change URL to use the hash
  const handleCardClick = async (cardId: string) => {
    window.location.hash = cardId;
    await explore.refetch();
    setReference(cardId === reference ? undefined : cardId);
  };

  return (
    <>
      <Head>
        <title>SnapLucc</title>
        <meta name="description" content="Exploring photos in our database" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <LayoutWithNav>
        {(marginTop, marginBottom) => (
          <CardsGrid
            width={width}
            onClick={handleCardClick}
            cards={cards}
            isFetchingNextPage={explore.isFetchingNextPage}
            fetchNextPage={
              explore.fetchNextPage as unknown as () => Promise<void>
            }
            containerStyle={{
              marginTop,
              marginBottom,
            }}
            reference={reference}
          />
        )}
      </LayoutWithNav>
    </>
  );
};

export default HomePage;
