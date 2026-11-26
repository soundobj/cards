
import { assign, setup, fromPromise } from "xstate";
import {
  type BriscaCard,
  type PlayedCard,
  type Player,
  briscaDeck,
  chooseStartingPlayerAtRandom,
  dealCards,
  findWinner,
  getHandWinner,
  removeCardFromDeckWhenOddPlayers,
  resetPlayers,
  setPlayersTurn,
} from "../spanishDeck/games/brisca/brisca";
import { shuffleDeck } from "../spanishDeck/spanishDeck";
import type { Card } from "../spanishDeck/spanishDeck";

type BriscaContext = {
  deck: BriscaCard[];
  tableHand: PlayedCard[];
  currentPlayerId: number | null;
  gameSuit: BriscaCard | null;
  gameSuitId: Card["suit"] | null;
  handWinnerId: number | null;
  handWinningCardId: BriscaCard["id"] | null;
  players: Player[] | null;
  winners: Player[];
};

type BriscaEvent =
  | { type: "prepareGame"; players: Player[] }
  | { type: "playCard"; playerId: number; cardId: BriscaCard["id"] };

export const briscaMachine = setup({
  types: {} as {
    context: BriscaContext;
    events: BriscaEvent;
  },

  actors: {
    prepareGame: fromPromise(
      async ({ input }: { input: { players: Player[] } }) => {
        const cards = removeCardFromDeckWhenOddPlayers(briscaDeck, input.players.length);
        const shuffledDeck = shuffleDeck(cards);
        const gameSuit = shuffledDeck[0];
        let deck = shuffledDeck.slice(1);
        let players = chooseStartingPlayerAtRandom(resetPlayers(input.players));

        for (let hand = 0; hand < 3; hand += 1) {
          [deck, players] = dealCards(deck, players);
        }

        return { deck, gameSuit, players };
      },
    ),
  },

  guards: {
    isValidPlay: ({ context, event }) => {
      if (event.type !== "playCard") return false;
      if (event.playerId !== context.currentPlayerId) return false;

      return context.players?.some(
        (player) =>
          player.id === event.playerId &&
          player.cards.some((card) => card.id === event.cardId),
      ) ?? false;
    },
    isFinalPlay: ({ context, event }) => {
      if (event.type !== "playCard" || context.players === null) return false;
      if (event.playerId !== context.currentPlayerId) return false;

      const ownsCard = context.players.some(
        (player) =>
          player.id === event.playerId &&
          player.cards.some((card) => card.id === event.cardId),
      );

      return ownsCard && context.tableHand.length + 1 === context.players.length;
    },
    hasCardsToDeal: ({ context }) => context.deck.length > 0 || context.gameSuit !== null,
    isGameOver: ({ context }) =>
      context.deck.length === 0 &&
      context.gameSuit === null &&
      (context.players ?? []).every((player) => player.cards.length === 0),
  },

  actions: {
    consoleLogDeck: ({ event }) => {
      console.log("Game preparation completed!", event);
    },
    playCard: assign(({ context, event }) => {
      if (event.type !== "playCard") return {};

      // find the played card and its owner
      const player = context.players?.find(({ id }) => id === event.playerId);
      const card = player?.cards.find(({ id }) => id === event.cardId);
      if (!player || !card || !context.players) return {};

      // update table and players cards
      return {
        players: context.players.map((currentPlayer) =>
          currentPlayer.id === player.id
            ? {
                ...currentPlayer,
                cards: currentPlayer.cards.filter(({ id }) => id !== card.id),
              }
            : currentPlayer,
        ),
        tableHand: [...context.tableHand, { ...card, playerId: player.id }],
      };
    }),
    advanceTurn: assign(({ context }) => {
      const players = context.players ?? [];
      const currentIndex = players.findIndex(({ id }) => id === context.currentPlayerId);
      const nextIndex = (currentIndex + 1) % players.length;

      return { currentPlayerId: players[nextIndex]?.id ?? null };
    }),
    resolveHand: assign(({ context }) => {
      if (context.tableHand.length === 0 || context.gameSuitId === null) return {};

      const winnerId = getHandWinner(context.tableHand, context.gameSuitId);
      const players = (context.players ?? []).map((player) =>
        player.id === winnerId
          ? { ...player, wonCards: [...player.wonCards, ...context.tableHand] }
          : player,
      );

      return {
        currentPlayerId: winnerId,
        handWinnerId: winnerId,
        handWinningCardId:
          context.tableHand.find((card) => card.playerId === winnerId)?.id ?? null,
        players: setPlayersTurn(winnerId, players),
      };
    }),
    clearResolvedHand: assign({
      tableHand: [],
      handWinnerId: null,
      handWinningCardId: null,
    }),
    dealNextHand: assign(({ context }) => {
      const currentPlayers = context.players ?? [];
      if (currentPlayers.length === 0) return {};

      const players = currentPlayers.map((player) => ({
        ...player,
        wonCards: [...player.wonCards],
        cards: [...player.cards],
      }));
      let gameSuit = context.gameSuit;

      const [remainingDeck, dealtPlayers] = dealCards(context.deck, players);

      if (remainingDeck.length === 0 && context.deck.length < players.length && gameSuit) {
        // The exposed game-suit card is drawn last, so give it to the last player in deal order.
        const lastPlayerIndex = dealtPlayers.length - 1;
        const lastPlayer = dealtPlayers[lastPlayerIndex];

        if (lastPlayer) {
          dealtPlayers[lastPlayerIndex] = {
            ...lastPlayer,
            cards: [...lastPlayer.cards, gameSuit],
          };
          gameSuit = null;
        }
      }

      return { deck: remainingDeck, gameSuit, players: dealtPlayers };
    }),
    setGameWinners: assign(({ context }) => ({
      winners: findWinner(context.players ?? []),
    })),
  },

}).createMachine(
  /** @xstate-layout N4IgpgJg5mDOIC5QCEBOBLWBjAhgWRywAt0A7MAOgGUAVAQQCUaB9AcTrwFEBiAB1TC8cA1jgC2YANoAGALqJQvAPax0AF3RLSCkAA9EAWgCMAVgAsFEwA4ATNIDMRmyYA0IAJ6GbNoxQBs9n4A7EZWQSYAvhFuaJi4BMRklOxczAAKDJxp3FDiYGkCvADCSmK8ADZgapAy8kggyqoaWjr6CMa2FE5WAJzSfs5unu3mFDb20mZ+YZFRbqRKEHA6sdj4hCTkOo3qmtr1bQbj0l02vf2DHob2Yf7OcyCr8RtJ1PRMbByc2yq7LQeGUxWMZWEymAauK7tCYnJyzGIYNYJTbJL7pTJpH5NPatQEmez+Kz2Ew9ezhIaAm4UMwXeGPRHPRLkCgpTjMWiMGicAAiWL++1AhyMZh6FB6QT8JghFIQfhONh603CUSiQA */
  {
  /** @xstate-layout N4IgpgJg5mDOIC5QCEBOBLWBjAhgWRywAt0A7MAOgGUAVAQQCUaB9AcTrwFEBiAB1TC8cA1jgC2YANoAGALqJQvAPax0AF3RLSCkAA9EARgCcRikYCsAZgMAmcwBoQAT0OWA7BXMAOS77--rAF9AxzRMXAJiMkp2LmYABQZOeO4ILUoyADclAGtKMOx8QhJyCljOBKT4hCylXA0tGVkmnWVVBu0kPUQANmkeijdLABZ3B2dEHwobIdG3c2DQjELIkpiOCsTk7jBUVCVUCl4AGxw1ADMDsQoCiOLoso3K5JrSbPrNUiaWrrb1T50+gQxlMFmsdkcLgQRmkFGkPgCiOCIRApCUEDgOluRSi5FaKn+WkBiAAtD1IaSeosQNjVg9aIwWOV8e0AV0gcMbBTocMKD1+QLBQK3NTafdSuVnvEWYTOqAgZYjAY+eYehCJggvMqFiixbj1nEGUxOAARGUdYkINwmQZa9VQgzSHXBIA */
  id: "BriscaMachine",
  initial: "START_GAME",
  context: {
    deck: [] as BriscaCard[],
    tableHand: [] as PlayedCard[],
    currentPlayerId: null as number | null,
    handWinnerId: null as number | null,
    handWinningCardId: null as BriscaCard["id"] | null,
    gameSuit: null as BriscaCard | null,
    gameSuitId: null as Card["suit"] | null,
    players: null as Player[] | null,
    winners: [] as Player[],
  },

  states: {
    START_GAME: {
      on: {
        prepareGame: {
          target: "GAME_PREP",
          actions: assign({ players: ({ event }) => event.players }),
        },
      },
    },

    GAME_PREP: {
      invoke: {
        src: "prepareGame",
        input: ({ context }) => ({ players: context.players ?? [] }),
        onDone: {
          target: "PLAYING_GAME",
          actions: [
            assign(({ event }) => ({
              deck: event.output.deck,
              gameSuit: event.output.gameSuit,
              gameSuitId: event.output.gameSuit.suit,
              players: event.output.players,
              currentPlayerId: event.output.players[0]?.id ?? null,
              handWinnerId: null,
              handWinningCardId: null,
              tableHand: [],
              winners: [],
            })),
            "consoleLogDeck",
          ],
        },
        onError: {
          target: "START_GAME",
        },
      },
    },

    PLAYING_GAME: {
      initial: "PLAYING_HAND",
      states: {
        PLAYING_HAND: {
          on: {
            playCard: [
              {
                guard: "isFinalPlay",
                target: "ANNOUNCING_HAND_WINNER",
                actions: "playCard",
              },
              {
                guard: "isValidPlay",
                actions: ["playCard", "advanceTurn"],
              },
            ],
          },
        },
        ANNOUNCING_HAND_WINNER: {
          entry: "resolveHand",
          after: {
            1000: [
              {
                guard: "isGameOver",
                target: "GAME_OVER",
                actions: ["setGameWinners", "clearResolvedHand"],
              },
              {
                guard: "hasCardsToDeal",
                target: "PLAYING_HAND",
                actions: ["clearResolvedHand", "dealNextHand"],
              },
              { target: "PLAYING_HAND", actions: "clearResolvedHand" },
            ],
          },
        },
        GAME_OVER: {},
      },
    },
  },
});
