import { type CSSProperties } from "react";
import Link from "next/link";
import InfiniteLoader from "react-window-infinite-loader";
import AutoSizer from "react-virtualized-auto-sizer";
import { Grid, type GridCellRenderer } from "react-virtualized";

import { type CardModel } from "../utils/models";
import { currency } from "../utils/format";
import { ArtistLink } from "./Link";
import { Spin } from "./Spin";

export const MIN_CARD_WIDTH = 250;
export const CARD_ASPECT = 1.5;
export const CARDS_PER_LINE =
  typeof window !== "undefined"
    ? Math.floor(window.innerWidth / MIN_CARD_WIDTH)
    : 1;

interface CardProps {
  card?: CardModel;
  style: CSSProperties;
  isCurrentReference?: boolean;
  onClick: (card: CardModel) => Promise<void> | void;
}

export const CollectionCard = ({
  card,
  style,
  isCurrentReference,
  onClick,
}: CardProps) => {
  // TODO: implement this
  if (!card) {
    return (
      <div className="bg-red-500" style={style}>
        <p>Nothing...</p>
      </div>
    );
  }

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
        await Promise.resolve(onClick(card));
      }}
    >
      <div className="flex items-center justify-between text-xs">
        {[
          {
            content: `${card.collection.size} cards`,
            color: "indigo",
            colorIntensity: 600,
          },
          {
            content: currency.format(card.collection.playcost),
            color: "green",
            colorIntensity: 400,
          },
        ].map((it, i) => (
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
        <Link className="group" href={card.collection.link}>
          <h3 className="transform truncate text-lg font-bold opacity-80 transition group-hover:translate-x-2 group-hover:-translate-y-1 group-hover:scale-105 group-hover:opacity-100">
            {card.collection.slug}
          </h3>
        </Link>
        <p className="text-xs">
          <span className="opacity-60">Collection by </span>
          <ArtistLink
            name={card.collection.creator.username}
            link={card.collection.creator.link}
          />
        </p>
      </div>
    </div>
  );
};

export const CollectionUnblockedCard = ({ color }: { color: string }) => (
  <div
    className="h-[300px] min-w-[200px] rounded shadow"
    style={{ backgroundColor: color }}
  />
);

export const CollectionBlockedCard = ({ amount }: { amount: number }) =>
  amount > 0 ? (
    <div className="flex h-[300px] min-w-[200px] flex-col items-center justify-center gap-1 rounded bg-neutral-100 shadow ring-2 dark:bg-neutral-700">
      <p className="text-2xl font-bold">+{amount}</p>
      <p className="text-xs">
        <span className="rounded-full bg-green-400 px-2 py-px font-bold text-green-600">
          Play
        </span>{" "}
        <span className="opacity-50">to unlock more cards</span>
      </p>
    </div>
  ) : (
    <></>
  );

interface CardsGridProps {
  cards: CardModel[];

  width: number;
  onClick: (props: CardModel) => Promise<void> | void;

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
  const cardWidth = width / CARDS_PER_LINE;
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
    const idx = columnIndex + CARDS_PER_LINE * rowIndex;
    const card = cards[idx];

    return (
      <CollectionCard
        key={key}
        style={style}
        card={card}
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
                columnCount={CARDS_PER_LINE}
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
