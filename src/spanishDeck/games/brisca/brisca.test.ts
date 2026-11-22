import { describe, expect, test } from "@jest/globals";
import { createDeck } from "../../spanishDeck";
import { getHandCards, getHandSuit, getHandWinner, handCardsToPlayers, setPlayersTurn, type PlayedCard, type Player } from "./brisca";

describe("Brisca", () => {
  describe("setPlayersTurn", () => {
    const makePlayers = (count: number): Player[] =>
      Array.from({ length: count }, (_, id) => ({ id, name: `Player ${id}`, wonCards: [], cards: [] }));

    test.each([
      [2, 1, [1, 0]],
      [3, 2, [2, 0, 1]],
      [4, 1, [1, 2, 3, 0]],
    ])("rotates the order clockwise for %i players after player %i wins", (count, winnerId, expectedIds) => {
      const players = makePlayers(count);

      expect(setPlayersTurn(winnerId, players).map(({ id }) => id)).toEqual(expectedIds);
      expect(players.map(({ id }) => id)).toEqual(Array.from({ length: count }, (_, id) => id));
    });
  });

  test("getHandCards removes one card per player and returns the dealt cards", () => {
    const cards = createDeck();
    const originalCards = [...cards];

    const [remainingDeckCards, dealtCards] = getHandCards(cards, 3);

    expect(dealtCards).toEqual(originalCards.slice(0, 3));
    expect(remainingDeckCards).toEqual(originalCards.slice(3));
    expect(cards).toEqual(originalCards);

  });

  test("handCardsToPlayers returns one card per player and the remaining cards", () => {
    const cards = createDeck();
    const originalCards = [...cards];

    const [dealtCards, remainingCards] = handCardsToPlayers(cards, 3);

    expect(dealtCards).toEqual(originalCards.slice(0, 3));
    expect(remainingCards).toEqual(originalCards.slice(3));
    expect(cards).toEqual(originalCards);
  });

  describe("getHandSuit", () => {
    const hand: PlayedCard[] = [
      { id: "1-c", rank: "1", suit: "c", points: 11, playerId: 0 },
      { id: "3-s", rank: "3", suit: "s", points: 10, playerId: 1 },
    ];

    test("returns the game suit when a card of that suit was played", () => {
      expect(getHandSuit(hand, "s")).toBe("s");
    });

    test("returns the first played card's suit when no game-suit card was played", () => {
      expect(getHandSuit(hand, "g")).toBe("c");
    });
  });

  describe("getHandWinner", () => {
    test("chooses the game-suit card with the most points", () => {
      const hand: PlayedCard[] = [
        { id: "1-c", rank: "1", suit: "c", points: 11, playerId: 0 },
        { id: "3-c", rank: "3", suit: "c", points: 10, playerId: 1 },
      ];

      const handWinner = getHandWinner(hand, "c");

      expect(handWinner).toBe(0);
    });

    test("chooses the highest-ranked game-suit card when none have points", () => {
      const hand: PlayedCard[] = [
        { id: "2-c", rank: "2", suit: "c", points: 0, playerId: 0 },
        { id: "7-c", rank: "7", suit: "c", points: 0, playerId: 1 },
        { id: "1-s", rank: "1", suit: "s", points: 11, playerId: 2 },
      ];

      expect(getHandWinner(hand, "c")).toBe(1);
    });

    test("uses the lead suit and chooses its highest-point card when no game-suit card was played", () => {
      const hand: PlayedCard[] = [
        { id: "3-c", rank: "3", suit: "c", points: 10, playerId: 0 },
        { id: "1-c", rank: "1", suit: "c", points: 11, playerId: 1 },
        { id: "7-s", rank: "7", suit: "s", points: 0, playerId: 2 },
      ];

      expect(getHandWinner(hand, "g")).toBe(1);
    });

    test("uses the lead suit and highest rank when no game-suit or point cards were played", () => {
      const hand: PlayedCard[] = [
        { id: "4-c", rank: "4", suit: "c", points: 0, playerId: 0 },
        { id: "7-c", rank: "7", suit: "c", points: 0, playerId: 1 },
        { id: "2-s", rank: "2", suit: "s", points: 0, playerId: 2 },
      ];

      expect(getHandWinner(hand, "g")).toBe(1);
    });
  });
});
