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

    D) DEALING A ROUND
    - for each player a card is distributed until the stack is consumed
    - whoever won the last hand gets the first card, all other players follow in a clockwise direction
    - when the last hand is reached, the visible card is also dealt

    E) WINNING THE GAME
    - each players cards with points are summed up. the highest score wins, draws can also happen.
*/
const points = [
    { '1': 11 },
    { '3': 10 },
    { '12': 4 },
    { '11': 3 },
    { '10': 2 },
];

