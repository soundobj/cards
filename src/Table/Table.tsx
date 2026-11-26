import Card from "../Card/Card";
import GameResults, { type GameStat } from "../GameResults/GameResults";
import type { BriscaCard } from "../spanishDeck/games/brisca/brisca";
import "./Table.css";

export type TableProps = {
  cards: BriscaCard[];
  deckCount: number;
  gameSuit: BriscaCard | null;
  currentPlayerName: string | null;
  handWinnerName: string | null;
  winningCardId: BriscaCard["id"] | null;
  gameStats: GameStat[];
};

export function Table({
  cards,
  deckCount,
  gameSuit,
  currentPlayerName,
  handWinnerName,
  winningCardId,
  gameStats,
}: TableProps) {
  return (
    <div className="card-table" role="group" aria-label="Cards played this hand">
      <div className="card-table__played-cards">
        {cards.map((card) => (
          <div
            className={card.id === winningCardId
              ? "card-table__played-card card-table__played-card--winner"
              : "card-table__played-card"}
            key={card.id}
          >
            <Card rank={card.rank} suit={card.suit} />
          </div>
        ))}
      </div>
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
        <span>Game suit</span>
        {gameSuit && <Card rank={gameSuit.rank} suit={gameSuit.suit} />}
      </div>
      <div
        aria-label={`${deckCount} cards left in the deck`}
        className={deckCount > 0 ? "card-table__deck" : "card-table__deck card-table__deck--empty"}
        role="img"
      >
        <span className="card-table__deck-count">{deckCount}</span>
      </div>
    </div>
  );
}

export default Table;
