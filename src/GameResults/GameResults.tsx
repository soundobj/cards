import "./GameResults.css";
import Card from "../Card/Card";
import { sortWonCards, type GameStat } from "../spanishDeck/games/brisca/brisca";

export type GameResultsProps = {
  stats: GameStat[];
};

export function GameResults({ stats }: GameResultsProps) {
  if (stats.length === 0) return null;

  return (
    <section
      className="game-results"
      aria-label="Final game results"
      aria-live="assertive"
    >
      <table>
        <caption>Game results</caption>
        <tbody>
          {stats.map((stat) => {
            const sortedWonCards = sortWonCards(stat.wonCards);

            return (
              <tr className={stat.isWinner ? "game-results__winner" : undefined} key={stat.playerId}>
                <th scope="row">
                  <button
                    aria-describedby={`won-cards-${stat.playerId}`}
                    className="game-results__player"
                    type="button"
                  >
                    {stat.isWinner && <span aria-hidden="true">🏆 </span>}
                    {stat.name}
                    <span className="game-results__tooltip" id={`won-cards-${stat.playerId}`} role="tooltip">
                      <span className="game-results__tooltip-title">Point cards won</span>
                      {sortedWonCards.length > 0 ? (
                        <span className="game-results__tooltip-cards">
                          {sortedWonCards.map((card) => (
                            <span className="game-results__tooltip-card" key={card.id}>
                              <Card img={card.img} rank={card.rank} suit={card.suit} />
                              <span>{card.points} pts</span>
                            </span>
                          ))}
                        </span>
                      ) : (
                        <span>No point cards</span>
                      )}
                    </span>
                  </button>
                </th>
                <td>{stat.points} points</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

export default GameResults;
