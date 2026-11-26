import { suits, type Card as PlayingCard } from "../spanishDeck/spanishDeck";
import "./Card.css";

export type CardProps = Pick<PlayingCard, "rank" | "suit">;

export function Card({ rank, suit }: CardProps) {
  const suitDetails = suits.find((item) => item.id === suit)!;

  return (
    <span
      className="playing-card"
      role="img"
      aria-label={`${rank} of ${suitDetails.name}`}
    >
      <span className="playing-card__rank">{rank}</span>
      <span className="playing-card__suit" aria-hidden="true">
        {suitDetails.icon}
      </span>
    </span>
  );
}

export default Card;
