
import { assign, setup, fromPromise } from "xstate";
import {
  type BriscaCard,
  type PlayedCard,
  type Player,
  briscaDeck,
  dealCards,
} from "../spanishDeck/games/brisca/brisca";
import { shuffleDeck } from "../spanishDeck/spanishDeck";
import type { Card } from "../spanishDeck/spanishDeck";

export const briscaMachine = setup({
  actors: {
    prepareGame: fromPromise(
      async ({ input }: { input: { players: Player[] } }) => {
        const shuffledDeck = shuffleDeck(briscaDeck);
        const gameSuit = shuffledDeck[0];
        let deck = shuffledDeck.slice(1);
        let players = input.players.map((player) => ({
          ...player,
          wonCards: [...player.wonCards],
          cards: [...player.cards],
        }));

        for (let hand = 0; hand < 3; hand += 1) {
          [deck, players] = dealCards(deck, players);
        }

        return { deck, gameSuit, players };
      },
    ),
  },

  actions: {
    consoleLogDeck: ({ event }) => {
      console.log("Game preparation completed!", event);
    },
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
    gameSuit: null as BriscaCard | null,
    gameSuitId: null as Card["suit"] | null,
    players: null as Player[] | null,
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
            })),
            "consoleLogDeck",
          ],
        },
        onError: {
          target: "START_GAME",
        },
      },
    },

    PLAYING_GAME: {},
  },
});
