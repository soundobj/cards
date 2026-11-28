import Card from "../Card/Card";
import GameResults from "../GameResults/GameResults";
import type { BriscaCard, GameStat } from "../spanishDeck/games/brisca/brisca";
import "./Table.css";

export type TableProps = {
  cards: BriscaCard[];
  deckCount: number;
  gameSuitCard: BriscaCard | null;
  currentPlayerName: string | null;
  handWinnerName: string | null;
  winningCardId: BriscaCard["id"] | null;
  gameStats: GameStat[];
};

export function Table({
  cards,
  deckCount,
  gameSuitCard,
  currentPlayerName,
  handWinnerName,
  winningCardId,
  gameStats,
}: TableProps) {
  const isDeckEmpty = deckCount === 0;

  return (
    <div
      className={isDeckEmpty ? "card-table card-table--deck-empty" : "card-table"}
      role="group"
      aria-label="Cards played this hand"
    >
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
      {!isDeckEmpty && (
        <section className="card-table__deck-area" aria-label="Deck and game suit card">
          {gameSuitCard && (
            <div className="card-table__trump-card">
              <Card img={gameSuitCard.img} rank={gameSuitCard.rank} suit={gameSuitCard.suit} />
            </div>
          )}
          <div
            aria-label={`${deckCount} cards left in the deck`}
            className="card-table__deck"
            role="img"
          >
            <span className="card-table__deck-count">{deckCount}</span>
          </div>
        </section>
      )}
    </div>
  );
}

export default Table;
