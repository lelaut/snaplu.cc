import { type CSSProperties } from "react";
import Link from "next/link";
import InfiniteLoader from "react-window-infinite-loader";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  Grid,
  List,
  WindowScroller,
  type GridCellRenderer,
  type ListRowRenderer,
} from "react-virtualized";

import { type CollectionWithProfits } from "../utils/models";
import { currency } from "../utils/format";
import { ArtistLink } from "./Link";
import { Spin } from "./Icon";
import { MonthlyProfitChart } from "./Chart";

export const MIN_CARD_WIDTH = 250;
export const CARD_ASPECT = 1.5;

export const cardsPerLine = (width: number) =>
  Math.max(Math.floor(width / MIN_CARD_WIDTH), 1);

interface CardProps {
  cardId: string;
  cardUrl: string;
  cardGeneration: number;
  collectionId: string;
  collectionName: string;
  creatorId: string;
  producerName: string;
  collectionSize?: number;
  collectionPlaycost?: number;
  style: CSSProperties;
  isCurrentReference?: boolean;
  onClick: (card: string) => Promise<void> | void;
}

export const CollectionCard = ({
  cardId,
  cardUrl,
  cardGeneration,
  creatorId,
  producerName,
  collectionId,
  collectionName,
  collectionSize,
  collectionPlaycost,
  style,
  isCurrentReference,
  onClick,
}: CardProps) => {
  // TODO: add i18n
  // TODO: finish this
  return (
    <div
      className={`flex cursor-pointer flex-col justify-between bg-indigo-500 p-4 hover:opacity-100 ${
        isCurrentReference ? "border border-yellow-500" : "opacity-90"
      }`}
      style={style}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClick={async () => {
        await Promise.resolve(onClick(cardId));
      }}
    >
      <div className="flex items-center justify-between text-xs">
        {([] as { content: string; color: string; colorIntensity: number }[])
          .concat(
            typeof collectionSize !== "undefined"
              ? [
                  {
                    content: `${collectionSize} cards`,
                    color: "indigo",
                    colorIntensity: 600,
                  },
                ]
              : []
          )
          .concat(
            typeof collectionPlaycost !== "undefined"
              ? [
                  {
                    content: currency.format(collectionPlaycost),
                    color: "green",
                    colorIntensity: 400,
                  },
                ]
              : []
          )
          .map((it, i) => (
            <p
              key={i}
              className={`rounded-full bg-${it.color}-${
                it.colorIntensity
              } py-px px-2 text-${it.color}-700 shadow-lg shadow-${it.color}-${
                it.colorIntensity + 100
              }`}
            >
              {it.content}
            </p>
          ))}
      </div>
      <div className="">
        <Link className="group" href={`/${creatorId}/${collectionId}`}>
          <h3 className="transform truncate text-lg font-bold opacity-80 transition group-hover:translate-x-2 group-hover:-translate-y-1 group-hover:scale-105 group-hover:opacity-100">
            {`[${cardGeneration}] ${collectionName}`}
          </h3>
        </Link>
        <p className="text-xs">
          <span className="opacity-60">Collection by </span>
          <ArtistLink name={producerName} link={`/${producerName}`} />
        </p>
      </div>
    </div>
  );
};

interface CollectionFreeCardProps {
  url: string;
}

export const CollectionFreeCard = ({ url }: CollectionFreeCardProps) => (
  <div
    className="rounded bg-white/20 bg-contain bg-center bg-no-repeat p-2"
    style={{
      backgroundImage: `url("${url}")`,
      minWidth: MIN_CARD_WIDTH,
      height: MIN_CARD_WIDTH * CARD_ASPECT,
    }}
  />
);

export const CollectionBlockedCard = ({ amount }: { amount: number }) => (
  <div
    className="flex flex-col items-center justify-center gap-1 rounded bg-neutral-100 shadow ring-2 dark:bg-neutral-700"
    style={{ minWidth: MIN_CARD_WIDTH, height: MIN_CARD_WIDTH * CARD_ASPECT }}
  >
    {amount > 0 ? (
      <>
        <p className="text-2xl font-bold">+{amount}</p>
        <p className="text-xs">
          <span className="rounded-full bg-green-400 px-2 py-px font-bold text-green-600">
            Play
          </span>{" "}
          <span className="opacity-50">to unlock more cards</span>
        </p>
      </>
    ) : (
      <p className="text-lg font-bold">You have unlock all cards</p>
    )}
  </div>
);

export const CollectionCardLoading = () => {
  return (
    <div
      className="flex flex-col items-center justify-center rounded bg-neutral-100 shadow dark:bg-neutral-700"
      style={{ minWidth: MIN_CARD_WIDTH, height: MIN_CARD_WIDTH * CARD_ASPECT }}
    >
      <Spin size={32} />
    </div>
  );
};

export interface CardGridItem {
  id: string;
  generation: number;
  url: string;
  collectionId: string;
  collectionName: string;
  producerName: string;
}

interface CardsGridProps {
  cards: CardGridItem[];

  width: number;
  onClick: (cardId: string) => Promise<void> | void;

  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<void>;

  reference?: string;
}

export const CardsGrid = ({
  cards,
  width,
  onClick,
  isFetchingNextPage,
  fetchNextPage,
  reference,
}: CardsGridProps) => {
  const _cardsPerLine = cardsPerLine(width);
  const cardWidth = width / _cardsPerLine;
  const cardHeight = cardWidth * CARD_ASPECT;

  async function loadMoreItems(
    startIndex: number,
    stopIndex: number
  ): Promise<void> {
    if (isFetchingNextPage) {
      return;
    }
    if (stopIndex < cards.length) {
      return;
    }

    if (stopIndex < 200) {
      return fetchNextPage();
    }
  }

  const rowRender: GridCellRenderer = ({
    key,
    rowIndex,
    columnIndex,
    style,
  }) => {
    const idx = columnIndex + _cardsPerLine * rowIndex;
    const card = cards[idx];

    if (typeof card === "undefined") {
      return <div key={key} style={style} />;
    }

    return (
      <CollectionCard
        key={key}
        style={style}
        cardId={card.id}
        cardUrl={card.url}
        cardGeneration={card.generation}
        creatorId={card.id}
        producerName={card.producerName}
        collectionId={card.collectionId}
        collectionName={card.collectionName}
        isCurrentReference={card?.id === reference}
        onClick={onClick}
      />
    );
  };

  return (
    <div className="h-full w-full">
      <InfiniteLoader
        isItemLoaded={(i) => (i > cards.length ? isFetchingNextPage : false)}
        itemCount={cards.length + 1}
        loadMoreItems={loadMoreItems}
      >
        {({ onItemsRendered, ref }) => (
          <AutoSizer ref={ref}>
            {({ width, height }) => (
              <Grid
                cellRenderer={rowRender}
                columnWidth={cardWidth}
                columnCount={_cardsPerLine}
                // style={{ top: navHeight + 1 }}
                height={height}
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
                    rowStartIndex * _cardsPerLine + columnStartIndex;
                  const visibleStopIndex =
                    rowStopIndex * _cardsPerLine + columnStopIndex;
                  const overscanStartIndex =
                    rowOverscanStartIndex * _cardsPerLine +
                    columnOverscanStartIndex;
                  const overscanStopIndex =
                    rowOverscanStopIndex * _cardsPerLine +
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
                rowCount={Math.floor(cards.length / _cardsPerLine)}
                width={width}
              />
            )}
          </AutoSizer>
        )}
      </InfiniteLoader>

      <div
        className={
          "pointer-events-none fixed right-4 bottom-20 rounded-full bg-neutral-50 p-4 shadow-xl transition-opacity duration-500 dark:bg-neutral-800 xs:bottom-24 md:right-10 md:bottom-10 md:pb-4 " +
          (isFetchingNextPage ? "opacity-100" : "opacity-0")
        }
      >
        <Spin size={20} />
      </div>
    </div>
  );
};

interface CreatorCollectionListProps {
  collections: CollectionWithProfits[];
  isFetchingNextPage: boolean;
  loadMoreItems: () => Promise<void>;
  scrollProvider: any;
  width: number;
}

export const CreatorCollectionList = ({
  collections,
  isFetchingNextPage,
  loadMoreItems,
  scrollProvider,
  width,
}: CreatorCollectionListProps) => {
  const rowCount = collections.length;
  const ROW_HEIGHT = 212;

  const rowRenderer: ListRowRenderer = ({ key, index, style }) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const collection = collections[index];

    if (typeof collection === "undefined") {
      return <div key={key} style={style} />;
    }

    return (
      <div
        key={key}
        style={style}
        className="border-b border-neutral-200 dark:border-neutral-700"
      >
        <MonthlyProfitChart
          // TODO: make a link to the collection
          title={collection.name}
          data={collection.profit}
          width={width}
        />
      </div>
    );
  };

  return (
    <InfiniteLoader
      isItemLoaded={(i) =>
        i > collections.length ? isFetchingNextPage : false
      }
      itemCount={collections.length + 1}
      loadMoreItems={loadMoreItems}
    >
      {({ onItemsRendered, ref }) => (
        <WindowScroller ref={ref} scrollElement={scrollProvider}>
          {({ height, isScrolling, onChildScroll, scrollTop }) => (
            <AutoSizer disableHeight>
              {({ width }) => (
                // TODO: fix this issue, it is using @types/react@17 and not
                // @types/react@18 so you will need to enforce it.
                // See https://github.com/bvaughn/react-virtualized/issues/1746
                <List
                  autoHeight
                  rowHeight={ROW_HEIGHT}
                  rowCount={rowCount}
                  rowRenderer={rowRenderer}
                  isScrolling={isScrolling}
                  scrollTop={scrollTop}
                  onScroll={onChildScroll}
                  overscanRowCount={2}
                  width={width}
                  height={height}
                  onRowsRendered={({
                    startIndex,
                    stopIndex,
                    overscanStartIndex,
                    overscanStopIndex,
                  }) => {
                    onItemsRendered({
                      visibleStartIndex: startIndex,
                      visibleStopIndex: stopIndex,
                      overscanStartIndex,
                      overscanStopIndex,
                    });
                  }}
                />
              )}
            </AutoSizer>
          )}
        </WindowScroller>
      )}
    </InfiniteLoader>
  );
};
