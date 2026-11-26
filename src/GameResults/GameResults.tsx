import "./GameResults.css";

export type GameStat = {
  playerId: number;
  name: string;
  points: number;
  isWinner: boolean;
};

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
          {stats.map((stat) => (
            <tr className={stat.isWinner ? "game-results__winner" : undefined} key={stat.playerId}>
              <th scope="row">
                {stat.isWinner && <span aria-hidden="true">🏆 </span>}
                {stat.name}
              </th>
              <td>{stat.points} points</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default GameResults;
