import { appBaseUrl } from "../appConfig";

export const suits = [
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
  suit: Suit["id"];
  img?: string;
};

export const createDeck = (): Card[] =>
  suits.flatMap((suit) =>
    ranks.map((rank) => ({
      id: `${rank}-${suit.id}` as Card["id"],
      rank,
      suit: suit.id,
      img: `${appBaseUrl}assets/spanishDeck/${rank}-${suit.id}.jpg`,
    })),
  );

export const spanishDeck = createDeck();

export const shuffleDeck = <T extends Card>(cards: T[]): T[] => {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
};

export const removeCard = <T extends Card>(
  cards: T[],
  cardId: Card["id"],
): T[] => cards.filter((card) => card.id !== cardId);


export const getCard = <T extends Card>(
  cards: T[],
  index: number,
): T => cards[index];
