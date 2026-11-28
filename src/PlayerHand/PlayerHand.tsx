import Card from "../Card/Card";
import type { BriscaCard } from "../spanishDeck/games/brisca/brisca";
import "./PlayerHand.css";

export type PlayerHandProps = {
  cards: BriscaCard[];
  onCardClick: (card: BriscaCard) => void;
  disabled?: boolean;
};

export function PlayerHand({ cards, onCardClick, disabled = false }: PlayerHandProps) {
  if (cards.length === 0) return null;

  return (
    <div
      className="player-hand"
      role="group"
      aria-label={`${cards.length} cards in hand`}
    >
      {cards.map((card) => (
        <button
          aria-label={`Play ${card.rank} of ${card.suit}`}
          className="player-hand__card"
          disabled={disabled}
          key={card.id}
          onClick={() => onCardClick(card)}
          type="button"
        >
          <Card img={card.img} rank={card.rank} suit={card.suit} />
        </button>
      ))}
    </div>
  );
}

export default PlayerHand;
