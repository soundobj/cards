import Card from "../Card/Card";
import type { BriscaCard } from "../spanishDeck/games/brisca/brisca";
import "./Table.css";

export type TableProps = {
  cards: BriscaCard[];
  gameSuit: BriscaCard | null;
};

export function Table({ cards, gameSuit }: TableProps) {
  return (
    <div className="card-table" role="group" aria-label="Cards played this hand">
      <div className="card-table__played-cards">
        {cards.map((card) => (
          <Card key={card.id} rank={card.rank} suit={card.suit} />
        ))}
      </div>
      <div className="card-table__game-suit" aria-label="Game suit">
        <span>Game suit</span>
        {gameSuit && <Card rank={gameSuit.rank} suit={gameSuit.suit} />}
      </div>
    </div>
  );
}

export default Table;
