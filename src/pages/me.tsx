import { type NextPage } from "next";
import Link from "next/link";
import { useRef, useState, type RefObject } from "react";

import { api } from "../utils/api";
import {
  CardsGrid,
  cardsPerLine,
  CreatorCollectionList,
} from "../components/Collection";
import { LayoutCentered, LayoutWithNav } from "../components/Layout";
import { Spin } from "../components/Spin";
import { currency, dayjs } from "../utils/format";
import { type MonthlyProfit, type CardModel } from "../utils/models";
import { MonthlyProfitChart } from "../components/Chart";

const tabs = [
  { label: "Credit", render: CreditTab },
  { label: "Deck", render: DeckTab },
  { label: "My Content", render: MyContentTab },
] as const;

const MePage: NextPage = () => {
  const tabRef = useRef<HTMLDivElement>(null);
  const tabWidth = tabRef.current?.clientWidth ?? 0;

  const [tab, setTab] = useState<(typeof tabs)[number]>(tabs[0]);

  const credit = api.me.credit.useQuery();
  const deck = api.me.deck.useInfiniteQuery(
    {
      cardsPerLine: cardsPerLine(tabRef.current?.clientWidth ?? 1),
    },
    {
      getNextPageParam: (it) => it.nextCursor,
      refetchOnWindowFocus: false,
    }
  );
  const content = api.me.content.useInfiniteQuery(
    {},
    {
      getNextPageParam: (it) => it.nextCursor,
      refetchOnWindowFocus: false,
    }
  );

  const deckCards = deck.data?.pages.flatMap((it) => it.cards) ?? [];

  const contentMonths =
    content.data?.pages[content.data?.pages.length - 1]?.months ?? [];
  const contentCollections =
    content.data?.pages.flatMap((it) => it.collections) ?? [];

  // TODO: should add hash in url
  const handleTabClick = (idx: number) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    setTab(tabs[idx]!);
  };

  return (
    <LayoutWithNav>
      <LayoutCentered>
        <div className="sticky flex w-full border-b border-inherit">
          {tabs.map((it, idx) => (
            <TabButton
              isSelected={it.label === tab.label}
              key={it.label}
              label={it.label}
              onClick={() => handleTabClick(idx)}
            />
          ))}
        </div>
        <div
          ref={tabRef}
          className="min-h-0 flex-auto border-inherit"
          style={{ overflowY: "auto" }}
        >
          {tab.label === "Credit" &&
            tab.render({
              lastDeposits: credit.data?.lastDeposits ?? [],
              lastUpdate: credit.dataUpdatedAt,
              isUpdating: credit.isFetching,
            })}
          {tab.label === "Deck" &&
            tab.render({
              cards: deckCards,
              width: tabWidth,
              fetchNextPage:
                deck.fetchNextPage as unknown as () => Promise<void>,
              isFetchingNextPage: deck.isFetchingNextPage,
              onClick: () => {
                console.log("clicked");
              },
            })}
          {tab.label === "My Content" &&
            tab.render({
              ref: tabRef,
              collectionsUpdatedAt: content.dataUpdatedAt,
              areCollectionsUpdating: content.isRefetching,
              months: contentMonths,
              collections: contentCollections,
              width: tabWidth,
              isFetchingMoreCollections: content.isFetchingNextPage,
              fetchMoreCollections:
                content.fetchNextPage as unknown as () => Promise<void>,
            })}
        </div>
      </LayoutCentered>
    </LayoutWithNav>
  );
};

export default MePage;

const TabButton = ({
  isSelected,
  label,
  onClick,
}: {
  isSelected: boolean;
  label: string;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={
        "bg-neutral-800/0 p-4 hover:bg-neutral-800/5 dark:bg-neutral-50/0 dark:hover:bg-neutral-50/5" +
        (isSelected
          ? " bg-neutral-800/5 text-blue-500 dark:bg-neutral-50/5"
          : "")
      }
      disabled={isSelected}
    >
      {label}
    </button>
  );
};

interface CreditTabProps {
  lastDeposits: { amount: number; paymentMethod: string; createdAt: number }[];
  lastUpdate: number;
  isUpdating: boolean;
}

function CreditTab({ lastDeposits, lastUpdate, isUpdating }: CreditTabProps) {
  return (
    <div className="border-inherit py-4">
      <div className="h-[200px] w-full border-b border-inherit" />
      <div className="p-4">
        <TitleWithUpdateTime
          value="Last deposits"
          lastUpdateAt={lastUpdate}
          isUpdating={isUpdating}
          className="mb-4"
        />
        {(lastDeposits.length > 0 && (
          <ul className="flex flex-col gap-4">
            {lastDeposits.map((deposit, i) => (
              <li
                key={i}
                className="rounded bg-neutral-800/5 bg-neutral-50/5 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="tracking-wide">
                    {currency.format(deposit.amount)}
                  </p>
                  <p className="rounded bg-green-500 px-2 py-px text-xs font-bold tracking-wider text-green-800">
                    {deposit.paymentMethod}
                  </p>
                </div>
                <p className="text-xs opacity-30">
                  {dayjs
                    .duration(+new Date() - deposit.createdAt)
                    .humanize(true)}
                </p>
              </li>
            ))}
          </ul>
        )) || <div>No deposit yet</div>}
      </div>
    </div>
  );
}

interface DeckTabProps {
  cards: CardModel[];
  width: number;
  fetchNextPage: () => Promise<void>;
  isFetchingNextPage: boolean;
  onClick: () => void;
}

function DeckTab({
  cards,
  width,
  fetchNextPage,
  isFetchingNextPage,
  onClick,
}: DeckTabProps) {
  // TODO: enable grid to accept unblocked cards as well
  return (
    <CardsGrid
      width={width}
      cards={cards}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onClick={onClick}
    />
  );
}

interface MyContentTabProps {
  ref: RefObject<HTMLDivElement>;
  collectionsUpdatedAt: number;
  areCollectionsUpdating: boolean;
  months: MonthlyProfit[];
  collections: {
    name: string;
    image: string;
    months: MonthlyProfit[];
    link: string;
  }[];
  width: number;
  isFetchingMoreCollections: boolean;
  fetchMoreCollections: () => Promise<void>;
}

// lastest 5 month gain chart, starting with the current one highlighted
// every collection sorted by time also a button to add a new collection,
// should also contain the update time
function MyContentTab({
  ref,
  collectionsUpdatedAt,
  areCollectionsUpdating,
  months,
  collections,
  width,
  isFetchingMoreCollections,
  fetchMoreCollections,
}: MyContentTabProps) {
  return (
    <div className="flex flex-col gap-4 border-inherit">
      <div className="pb-2">
        <MonthlyProfitChart title="Revenue" data={months} width={width} />
      </div>

      <div className="flex flex-auto flex-col border-t border-inherit">
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-inherit bg-neutral-50/80 p-4 backdrop-blur-sm dark:bg-neutral-800/80">
          <TitleWithUpdateTime
            value="Collections"
            lastUpdateAt={collectionsUpdatedAt}
            isUpdating={areCollectionsUpdating}
          />
          <Link
            className="flex items-center rounded-full bg-indigo-400 pl-2 text-xs font-bold shadow-2xl shadow-indigo-500 transition hover:bg-indigo-500"
            href="/create"
          >
            New
            <svg
              className="h-6 w-6 stroke-white"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 7V17M7 12H17"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        <CreatorCollectionList
          collections={collections}
          isFetchingNextPage={isFetchingMoreCollections}
          loadMoreItems={fetchMoreCollections}
          scrollProvider={ref.current}
          width={ref.current?.clientWidth ?? 0}
        />

        {/* TODO: display text when there is no more data to fetch */}
        {isFetchingMoreCollections && (
          <div className="flex w-full justify-center py-8">
            <Spin size={24} />
          </div>
        )}
      </div>
    </div>
  );
}

interface TitleWithUpdateTimeProps {
  value: string;
  lastUpdateAt: number;
  isUpdating: boolean;
  className?: string;
}

const TitleWithUpdateTime = ({
  value,
  lastUpdateAt,
  isUpdating,
  className,
}: TitleWithUpdateTimeProps) => (
  <div className={className}>
    <h3 className="text-xl font-bold">{value}</h3>
    <div className="flex items-center gap-1">
      {isUpdating ? (
        <>
          <Spin size={12} />
          <p className="text-xs opacity-30">Updating...</p>
        </>
      ) : (
        <p className="text-xs opacity-30">
          Updated at {new Date(lastUpdateAt).toLocaleString()}
        </p>
      )}
    </div>
  </div>
);
