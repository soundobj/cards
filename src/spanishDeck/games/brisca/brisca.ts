import { spanishDeck, type Card } from "../../spanishDeck";

const points: Partial<Record<Card["rank"], number>> = {
    "1": 11,
    "3": 10,
    "12": 4,
    "11": 3,
    "10": 2,
  };
  
  export type BriscaCard = Card & { points: number };

  export type PlayedCard = BriscaCard & { playerId: number };

  export type Player = {
    id: number,
    name: string,
    wonCards: BriscaCard[],
    cards: BriscaCard[],
  } 
  
  export const briscaDeck: BriscaCard[] = spanishDeck.map((card) => ({
    ...card,
    points: points[card.rank] ?? 0,
  }));

  export const getHandCards = <T extends Card>(
    cards: T[],
    playersLength: number,
  ): [T[], T[]] => {
    const dealtCards = cards.slice(0, playersLength);
    const remainingDeckCards = cards.slice(playersLength);

    return [remainingDeckCards, dealtCards];
  };

  export const getHandSuit = (hand: PlayedCard[], gameSuitId: Card["suit"]): string => {
    const cardsWithGameSuit = hand.filter((card) => card.suit === gameSuitId);
    return cardsWithGameSuit.length > 0 ? gameSuitId : hand[0].suit;
  }

  export const setPlayersTurn = (lastHandWinnerId: number, players: Player[]): Player[] => {
    /* move the winner to the beginning and keep the clockwise direction
      winner is 0 then order is 0 1 2 3
      winner is 2 then  order is 2 3 0 1
      winner is 1 then order is 1 2 3 0
    */
    const winnerIndex = players.findIndex((player) => player.id === lastHandWinnerId);

    if (winnerIndex === -1) return [...players];

    return [...players.slice(winnerIndex), ...players.slice(0, winnerIndex)];
  };

  export const handCardsToPlayers = <T extends Card>(
    cards: T[],
    playersLength: number,
  ): [T[], T[]] => {
    const dealtCards = cards.slice(0, playersLength);
    const remainingDeckCards = cards.slice(playersLength);
    return [dealtCards, remainingDeckCards];
  };

  export const getHandWinner = (hand: PlayedCard[], gameSuitId: Card["suit"]): number => {
    const handSuit = getHandSuit(hand, gameSuitId);
    const suitCards = hand.filter((card) => card.suit === handSuit);
    const pointCards = suitCards.filter((card) => card.points > 0);
    const cardsToRank = pointCards.length > 0 ? pointCards : suitCards;

    return cardsToRank.sort((first, second) =>
      pointCards.length > 0
        ? second.points - first.points
        : Number(second.rank) - Number(first.rank),
    )[0].playerId;
  };

/*
    RULES:

    A) GAME PREP
    - all cards are shuffled
    - three cards are dealt to each player 
    - a card is picked from the remaining stack and made visble beneath the remaining stack, this is the game's suit
    - if the number of players is odd the 2 of spades is removed from the stack so all the number of cards and the players are rounded 

    B) PLAYING A HAND
    - at start of the game the starting player is chosen by random.
    - whoever won the last round throws one card, all other players follow in a clockwise direction.

    C) WINNING A HAND
    - the card with more points of the game's suit wins the round. If no cards with points are thrown then the highest number card of the game's suit wins.
    - if no cards of the game's suit is thrown, whichever first card suit was thrown is the round's suit,
    - the card with more points of the round's suit wins the round. if no cards with points are thrown then the highest number card of the round's suit wins

    D) DEALING A HAND
    - for each player a card is distributed until the stack is consumed
    - whoever won the last hand gets the first card, all other players follow in a clockwise direction
    - when the last hand is reached, the visible card is also dealt

    E) WINNING THE GAME
    - each players cards with points are summed up. the highest score wins, draws can also happen.
*/

/*

Player
    - id
    - name
    - playingCards
    - wonCards
    - isWinner

Deck
    - cards

Actions:

    startGame
        - shuffleDeck
        - dealCards(players[], deck)
        - selectNextPlayer

    playHand
        - throwCard(playerId, cardId)
        - selectNextPlayer

    assesHandWinner
        - awardCardsToWinner(playerId)
        - dealCards(players[], deck)
        - selectNextPlayer

    endGame
        countPlayersPoints(players[])
        setWinner(players[], id)
*/
