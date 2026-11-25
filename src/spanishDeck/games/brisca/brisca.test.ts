import { describe, expect, test } from "@jest/globals";
import { createDeck } from "../../spanishDeck";
import { briscaDeck, dealCards, findWinner, getHandCards, getHandSuit, getHandWinner, getNextHandCards, setPlayersTurn, type BriscaCard, type PlayedCard, type Player } from "./brisca";

describe("Brisca", () => {
  describe("findWinner", () => {
    const cardWithPoints = (id: BriscaCard["id"], points: number): BriscaCard => {
      const [rank, suit] = id.split("-") as [BriscaCard["rank"], BriscaCard["suit"]];
      return { id, rank, suit, points };
    };

    test("returns the player with the highest total points in won cards", () => {
      const players: Player[] = [
        { id: 0, name: "Player 0", wonCards: [cardWithPoints("1-c", 11)], cards: [] },
        { id: 1, name: "Player 1", wonCards: [cardWithPoints("3-s", 10), cardWithPoints("10-b", 2)], cards: [] },
        { id: 2, name: "Player 2", wonCards: [cardWithPoints("12-g", 4)], cards: [] },
      ];

      expect(findWinner(players)).toEqual([players[1]]);
    });

    test("returns an empty list when there are no players", () => {
      expect(findWinner([])).toEqual([]);
    });

    test("returns all players tied for the highest score", () => {
      const firstPlayer: Player = {
        id: 0,
        name: "Player 0",
        wonCards: [cardWithPoints("1-c", 11)],
        cards: [],
      };
      const secondPlayer: Player = {
        id: 1,
        name: "Player 1",
        wonCards: [cardWithPoints("3-s", 10), cardWithPoints("10-b", 1)],
        cards: [],
      };

      const thirdPlayer: Player = {
        id: 2,
        name: "Player 2",
        wonCards: [cardWithPoints("3-c", 10)],
        cards: [],
      };

      expect(findWinner([firstPlayer, secondPlayer, thirdPlayer])).toEqual([firstPlayer, secondPlayer]);
    });
  });

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

  test("getNextHandCards returns one card per player and the remaining cards", () => {
    const cards = createDeck();
    const originalCards = [...cards];

    const [dealtCards, remainingCards] = getNextHandCards(cards, 3);

    expect(dealtCards).toEqual(originalCards.slice(0, 3));
    expect(remainingCards).toEqual(originalCards.slice(3));
    expect(cards).toEqual(originalCards);
  });

  test("dealCards gives one BriscaCard to each player and returns the remaining deck", () => {
    const deck = [...briscaDeck];
    const originalDeck = [...deck];
    const players: Player[] = [
      { id: 0, name: "Player 0", wonCards: [], cards: [] },
      { id: 1, name: "Player 1", wonCards: [], cards: [] },
      { id: 2, name: "Player 2", wonCards: [], cards: [] },
    ];

    const [remainingDeck, updatedPlayers] = dealCards(deck, players);

    expect(updatedPlayers).toBe(players);
    expect(updatedPlayers.map(({ cards }) => cards)).toEqual(
      originalDeck.slice(0, players.length).map((card) => [card]),
    );
    expect(remainingDeck).toEqual(originalDeck.slice(players.length));
    expect(deck).toEqual(originalDeck);
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
