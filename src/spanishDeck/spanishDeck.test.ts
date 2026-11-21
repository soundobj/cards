import { afterEach, describe, expect, jest, test } from "@jest/globals";
import {
  createDeck,
  getCard,
  removeCard,
  shuffleDeck,
  spanishDeck,
} from "./spanishDeck";

describe("Spanish deck", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("createDeck creates 40 unique cards with the expected IDs", () => {
    const deck = createDeck();

    expect(deck).toHaveLength(40);
    expect(new Set(deck.map((card) => card.id)).size).toBe(40);
    expect(deck[0]).toEqual({ id: "1-c", rank: "1", suit: "c" });
    expect(deck.at(-1)).toEqual({ id: "12-b", rank: "12", suit: "b" });
  });

  test("spanishDeck contains the generated Spanish deck", () => {
    expect(spanishDeck).toEqual(createDeck());
  });

  test("getCard returns the last card of the deck", () => {
    const deck = createDeck();

    expect(getCard(deck, deck.length - 1)).toEqual({
      id: "12-b",
      rank: "12",
      suit: "b",
    });
  });

  test("shuffleDeck returns a shuffled copy and preserves all cards", () => {
    const cards = createDeck().slice(0, 4);
    const original = [...cards];
    jest.spyOn(Math, "random").mockReturnValue(0);

    const shuffled = shuffleDeck(cards);

    expect(shuffled.map((card) => card.id)).toEqual([
      "2-c",
      "3-c",
      "4-c",
      "1-c",
    ]);
    expect(shuffled).not.toBe(cards);
    expect(cards).toEqual(original);
    expect([...shuffled].sort((a, b) => a.id.localeCompare(b.id))).toEqual(
      [...original].sort((a, b) => a.id.localeCompare(b.id)),
    );
  });

  test("removeCard returns a new deck without the requested card", () => {
    const cards = createDeck();
    const original = [...cards];
    const removedCardId = cards[1].id;

    const result = removeCard(cards, removedCardId);

    expect(result).toHaveLength(cards.length - 1);
    expect(result.some((card) => card.id === removedCardId)).toBe(false);
    expect(result).toEqual(cards.filter((card) => card.id !== removedCardId));
    expect(result).not.toBe(cards);
    expect(cards).toEqual(original);
  });

  test("removeCard preserves additional card properties", () => {
    const cards = [
      { ...createDeck()[0], points: 11 },
      { ...createDeck()[1], points: 0 },
    ];

    const result = removeCard(cards, cards[0].id);

    expect(result).toEqual([cards[1]]);
    expect(result[0].points).toBe(0);
  });

  test("removeCard returns an unchanged copy when the ID is missing", () => {
    const cards = createDeck().slice(0, 2);
    const result = removeCard(cards, "12-b");

    expect(result).toEqual(cards);
    expect(result).not.toBe(cards);
  });
});
