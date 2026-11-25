
import { assign, setup, fromPromise } from "xstate";
import {
  type BriscaCard,
  type Player,
  briscaDeck,
  dealCards,
} from "../spanishDeck/games/brisca/brisca";
import { shuffleDeck } from "../spanishDeck/spanishDeck";

export const briscaMachine = setup({
  actors: {
    prepareGame: fromPromise(
      async ({ input }: { input: { players: Player[] } }) => {
        let deck: BriscaCard[] = shuffleDeck(briscaDeck);
        let players: Player[] = [];

        for (let hand = 0; hand < 3; hand += 1) {
          [deck, players] = dealCards(deck, input.players);
        }

        return { deck, players };
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
            assign({ deck: ({ event }) => event.output.deck }),
            assign({ players: ({ event }) => event.output.players }),
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
