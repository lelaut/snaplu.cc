import { type CSSProperties } from "react";
import Link from "next/link";

import { type CardModel } from "../utils/models";
import { currency } from "../utils/format";
import { ArtistLink } from "./Link";

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

const Card = ({ card, style, isCurrentReference, onClick }: CardProps) => {
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

export default Card;
