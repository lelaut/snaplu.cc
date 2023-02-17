import { type NextPage } from "next";
import { useState } from "react";
import Head from "next/head";
import InfiniteLoader from "react-window-infinite-loader";
import AutoSizer from "react-virtualized-auto-sizer";
import { Grid, type GridCellRenderer } from "react-virtualized";

import { api } from "../utils/api";
import { Layout } from "../components/Layout";
import { useWindowDimensions } from "../utils/hooks";
import Card, { CARDS_PER_LINE, CARD_ASPECT } from "../components/Card";
import { type CardModel } from "../utils/models";

const HomePage: NextPage = () => {
  const [hash, setHash] = useState<string | undefined>();

  const { width } = useWindowDimensions();
  const cardWidth = width / CARDS_PER_LINE;
  const cardHeight = cardWidth * CARD_ASPECT;

  // TODO: deal with error responses, maybe send user to another page?
  const explore = api.explore.cards.useInfiniteQuery(
    {
      hash,
      cardsPerLine: CARDS_PER_LINE,
    },
    {
      getNextPageParam: (it) => it.nextCursor,
    }
  );

  const cards = explore.data?.pages.flatMap((it) => it.cards) ?? [];

  // TODO: change URL to use the hash
  const handleCardClick = ({ hash }: CardModel) => {
    setHash(hash);
  };

  async function loadMoreItems(
    startIndex: number,
    stopIndex: number
  ): Promise<void> {
    if (explore.isFetchingNextPage) {
      return;
    }
    if (stopIndex < cards.length) {
      return;
    }

    if (stopIndex < 200) {
      return explore.fetchNextPage() as unknown as Promise<void>;
    }
  }

  const rowRender: GridCellRenderer = ({
    key,
    rowIndex,
    columnIndex,
    style,
  }) => {
    const idx = columnIndex + CARDS_PER_LINE * rowIndex;
    const card = cards[idx];

    return (
      <Card
        key={key}
        style={style}
        card={card}
        isCurrentReference={card?.hash === hash}
        onClick={handleCardClick}
      />
    );
  };

  return (
    <>
      <Head>
        <title>SnapLucc</title>
        <meta name="description" content="Exploring photos in our database" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        {({ navHeight, bannerHeight }) => (
          <InfiniteLoader
            isItemLoaded={(i) =>
              explore.data
                ? i > cards.length
                  ? explore.isFetchingNextPage
                  : false
                : true
            }
            itemCount={cards.length + 1}
            loadMoreItems={loadMoreItems}
          >
            {({ onItemsRendered, ref }) => (
              <AutoSizer
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                ref={ref}
                disableHeight
              >
                {({ width }) => (
                  <Grid
                    cellRenderer={rowRender}
                    columnWidth={cardWidth}
                    columnCount={CARDS_PER_LINE}
                    style={{ top: navHeight }}
                    height={window.innerHeight - navHeight - 1 - bannerHeight}
                    onSectionRendered={({
                      columnStartIndex,
                      columnStopIndex,
                      columnOverscanStartIndex,
                      columnOverscanStopIndex,
                      rowStartIndex,
                      rowStopIndex,
                      rowOverscanStartIndex,
                      rowOverscanStopIndex,
                    }) => {
                      const visibleStartIndex =
                        rowStartIndex * CARDS_PER_LINE + columnStartIndex;
                      const visibleStopIndex =
                        rowStopIndex * CARDS_PER_LINE + columnStopIndex;
                      const overscanStartIndex =
                        rowOverscanStartIndex * CARDS_PER_LINE +
                        columnOverscanStartIndex;
                      const overscanStopIndex =
                        rowOverscanStopIndex * CARDS_PER_LINE +
                        columnOverscanStopIndex;

                      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                      onItemsRendered({
                        visibleStartIndex,
                        visibleStopIndex,
                        overscanStartIndex,
                        overscanStopIndex,
                      });
                    }}
                    // TODO: add this
                    // noContentRenderer={this._noContentRenderer}
                    overscanRowCount={4}
                    rowHeight={cardHeight}
                    rowCount={Math.floor(cards.length / CARDS_PER_LINE)}
                    width={width}
                  />
                )}
              </AutoSizer>
            )}
          </InfiniteLoader>
        )}
      </Layout>
    </>
  );
};

export default HomePage;
