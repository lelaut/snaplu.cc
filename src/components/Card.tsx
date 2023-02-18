import { type CSSProperties } from "react";
import { type CardModel } from "../utils/models";

export const MIN_CARD_WIDTH = 250;
export const CARD_ASPECT = 1.5;
export const CARDS_PER_LINE =
  typeof window !== "undefined"
    ? Math.floor(window.innerWidth / MIN_CARD_WIDTH)
    : 1;

interface CardProps {
  card?: CardModel;
  style: CSSProperties;
  isCurrentReference: boolean;
  onClick: (card: CardModel) => void;
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

  // TODO: finish this
  return (
    <div
      className={`bg-indigo-500 p-1 hover:opacity-100 ${
        isCurrentReference
          ? "border border-yellow-500"
          : "cursor-pointer opacity-90"
      }`}
      style={style}
      onClick={() => !isCurrentReference && onClick && onClick(card)}
    >
      {Object.keys(card).map((key) => (
        <p key={key}>
          {key}: {card[key]}
        </p>
      ))}
    </div>
  );
};

export default Card;
