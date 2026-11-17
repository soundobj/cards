import './App.css'

import { useGetGameRoom } from './hooks/useGetGameRoom'
function App() {
  // const base = import.meta.env.BASE_URL
  const {
    connect,
    disconnect,
    room,
    isHost,
    inviteLink,
    loading,
    error,
  } = useGetGameRoom('github.soundobj/cards', 2)

  return (
    <>
      <section id="center">
        <div>
          <h1>isHost: {isHost ? 'true' : 'false'}</h1>
        </div>
        <h1>{isHost ? 'Create a game' : 'Join a game'}</h1>

<button onClick={connect} disabled={loading || !!room}>
  {loading ? 'Connecting...' : 'Connect'}
</button>

{inviteLink && (
  <button onClick={() => navigator.clipboard.writeText(inviteLink)}>
    Copy invite link
  </button>
)}

{error && <p>{error.message}</p>}

{room && <p>Connected!</p>}

<button onClick={disconnect}>Leave game</button>

      </section>
  </>
  )
}

export default App
