const suits = [
  { name: "cups", id: "c", icon: "🏆" },
  { name: "spades", id: "s", icon: "⚔️" },
  { name: "golds", id: "g", icon: "🟡" },
  { name: "clubs", id: "b", icon: "🪵" },
] as const;

const ranks = ["1", "2", "3", "4", "5", "6", "7", "10", "11", "12"] as const;

type Suit = (typeof suits)[number];

export type Card = {
  id: `${(typeof ranks)[number]}-${Suit["id"]}`;
  rank: (typeof ranks)[number];
  suit: Suit["id"]
};

export const createDeck = (): Card[] =>
  suits.flatMap((suit) =>
    ranks.map((rank) => ({
      id: `${rank}-${suit.id}` as Card["id"],
      rank,
      suit: suit.id,
    })),
  );

export const spanishDeck = createDeck();