import Card from "../Card/Card";
import GameResults, { type GameStat } from "../GameResults/GameResults";
import type { BriscaCard } from "../spanishDeck/games/brisca/brisca";
import { suits, type Card as PlayingCard } from "../spanishDeck/spanishDeck";
import "./Table.css";

export type TableProps = {
  cards: BriscaCard[];
  deckCount: number;
  gameSuitCard: BriscaCard | null;
  gameSuitId: PlayingCard["suit"] | null;
  currentPlayerName: string | null;
  handWinnerName: string | null;
  winningCardId: BriscaCard["id"] | null;
  gameStats: GameStat[];
};

export function Table({
  cards,
  deckCount,
  gameSuitCard,
  gameSuitId,
  currentPlayerName,
  handWinnerName,
  winningCardId,
  gameStats,
}: TableProps) {
  const gameSuitDetails = suits.find((suit) => suit.id === gameSuitId);

  return (
    <div className="card-table" role="group" aria-label="Cards played this hand">
      <section className="card-table__played-area" aria-label="Played cards">
        <div className="card-table__played-cards">
          {cards.map((card) => (
            <div
              className={card.id === winningCardId
                ? "card-table__played-card card-table__played-card--winner"
                : "card-table__played-card"}
              key={card.id}
            >
              <Card img={card.img} rank={card.rank} suit={card.suit} />
            </div>
          ))}
        </div>
      </section>
      {currentPlayerName && (
        <p className="card-table__current-player" aria-live="polite">
          {currentPlayerName}'s turn
        </p>
      )}
      {handWinnerName && (
        <p className="card-table__hand-winner" aria-live="assertive">
          {handWinnerName} wins the hand!
        </p>
      )}
      <GameResults stats={gameStats} />
      <div className="card-table__game-suit" aria-label="Game suit">
        <span className="card-table__game-suit-name" aria-label="Suit">
          {gameSuitDetails
            ? `${gameSuitDetails.icon} ${gameSuitDetails.name}${gameSuitCard ? ` ${gameSuitCard.rank}` : ""}`
            : null}
        </span>
      </div>
      <section className="card-table__deck-area" aria-label="Deck and game suit card">
        {gameSuitCard && (
          <div className="card-table__trump-card">
            <Card img={gameSuitCard.img} rank={gameSuitCard.rank} suit={gameSuitCard.suit} />
          </div>
        )}
        <div
          aria-label={`${deckCount} cards left in the deck`}
          className={deckCount > 0 ? "card-table__deck" : "card-table__deck card-table__deck--empty"}
          role="img"
        >
          <span className="card-table__deck-count">{deckCount}</span>
        </div>
      </section>
    </div>
  );
}

export default Table;
