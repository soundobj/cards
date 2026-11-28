import { suits, type Card as PlayingCard } from "../spanishDeck/spanishDeck";
import "./Card.css";

export type CardProps = Pick<PlayingCard, "img" | "rank" | "suit">;

export function Card({ img, rank, suit }: CardProps) {
  const suitDetails = suits.find((item) => item.id === suit)!;

  return (
    <span
      className="playing-card"
      role="img"
      aria-label={`${rank} of ${suitDetails.name}`}
    >
      {img ? (
        <img alt="" aria-hidden="true" className="playing-card__image" src={img} />
      ) : (
        <>
          <span className="playing-card__rank">{rank}</span>
          <span className="playing-card__suit" aria-hidden="true">
            {suitDetails.icon}
          </span>
        </>
      )}
    </span>
  );
}

export default Card;
