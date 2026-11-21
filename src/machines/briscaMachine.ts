
import { setup, fromPromise } from "xstate";

export const briscaMachine = setup({
  actors: {
    prepareGame: fromPromise(async () => {
      console.log("Preparing Brisca game...");

      // Put your game preparation logic here:
      // Shuffle cards
      // Deal cards
      // Choose trump card

      return { success: true };
    }),
  },

  actions: {
    consoleLogDeck: ({ event }) => {
      console.log("Game preparation completed!", event);
    },
  },
}).createMachine({
  id: "BriscaMachine",
  initial: "START_GAME",

  states: {
    START_GAME: {
      on: {
        prepareGame: "GAME_PREP",
      },
    },

    GAME_PREP: {
      invoke: {
        src: "prepareGame",
        onDone: {
          target: "GAME_STARTED",
          actions: "consoleLogDeck",
        },
        onError: {
          target: "START_GAME",
        },
      },
    },

    GAME_STARTED: {},
  },
});
