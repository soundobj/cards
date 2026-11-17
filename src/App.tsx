import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

import { useGetGameRoom } from './hooks/useGetGameRoom'
import { useEffect } from 'react'
function App() {
  // const [count, setCount] = useState(0)
  const base = import.meta.env.BASE_URL
  const { connect, roomId, isHost, invitedRoomId, inviteLink } = useGetGameRoom('github.soundobj/cards')

  useEffect(() => {
    connect()
  }, [connect])

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>isHost: {isHost ? 'true' : 'false'}</h1>
          <h4>invitedRoomId: {invitedRoomId}</h4>
          <h4>roomId: {roomId}</h4>
        </div>
        {inviteLink && (
  <div>
    <input readOnly value={inviteLink} />

    <button
      onClick={() => navigator.clipboard.writeText(inviteLink)}
    >
      Copy invite link
    </button>
  </div>
)}
      </section>
  </>
  )
}

export default App
