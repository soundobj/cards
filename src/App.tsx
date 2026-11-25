
import { useState, useEffect } from 'react'
import './App.css'

import { useGetGameRoom } from './hooks/useGetGameRoom'
import { briscaMachine } from './machines/briscaMachine'
import { useMachine } from '@xstate/react'
import type { Player } from './spanishDeck/games/brisca/brisca'

const playerO: Player = {
  id: 0,
  name: 'papi',
  wonCards: [],
  cards: [],
}

const player1 : Player = {
  id: 1,
  name: 'pichi',
  wonCards: [],
  cards: []
};

function App() {
  const [displayName, setDisplayName] = useState('')

  const {
    connect,
    disconnect,
    room,
    isHost,
    inviteLink,
    loading,
    error,
    players,
  } = useGetGameRoom('github.soundobj/cards', 2)

  const [state, send, actorRef] = useMachine(briscaMachine);

  useEffect(() => {
    console.log("🎮 Initial state:", actorRef.getSnapshot().value);
  
    const subscription = actorRef.subscribe((snapshot) => {
      console.log("🎮 STATE:", snapshot.value);
      console.log("📦 CONTEXT:", snapshot.context);
    });
  
    return () => subscription.unsubscribe();
  }, [actorRef]);

  const connected = !!room

  return (
    <>
      <section id="center">
        <div>
        <div id="player0">
              <h3>player 0: {playerO.name}</h3>
            </div>
            <div id="player1">
            <h3>player 1: {player1.name}</h3>
              </div>
        </div>
        <h1>Make sure your VPN is off!!</h1>
        <h1>{isHost ? 'Create a game' : 'Join a game'}</h1>
        <button
          onClick={() => send({ type: 'prepareGame', players: [playerO, player1] })}
        >
          startGame
        </button>

        {!connected && (
          <>
            <p>
              {isHost
                ? 'Enter your name to create a game.'
                : 'Enter your name to join the game.'}
            </p>

            <input
              type="text"
              placeholder="Your display name"
              value={displayName}
              onChange={event => setDisplayName(event.target.value)}
              maxLength={24}
              disabled={loading}
            />

            <button
              onClick={() => connect(displayName)}
              disabled={loading || !displayName.trim()}
            >
              {loading
                ? 'Connecting...'
                : isHost
                  ? 'Create game'
                  : 'Join game'}
            </button>
          </>
        )}

        {error && <p role="alert">{error.message}</p>}

        {connected && (
          <>
            <h2>Game connected!</h2>

            <h3>Players ({players.length})</h3>

            <ul>
              {players.map(player => (
                <li key={player.userId}>
                  {player.name}
                  {player.isHost ? ' (Host)' : ''}
                </li>
              ))}
            </ul>

            {inviteLink && (
              <div>
                <p>Share this link with your guests:</p>

                <button
                  onClick={() =>
                    navigator.clipboard.writeText(inviteLink)
                  }
                >
                  Copy invite link
                </button>
              </div>
            )}

            <button onClick={disconnect}>
              Leave game
            </button>
          </>
        )}
      </section>
    </>
  )
}

export default App
