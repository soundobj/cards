
import { joinRoom } from 'trystero'
import { useCallback, useEffect, useRef, useState } from 'react'

type Player = {
  userId: string
  name: string
  isHost: boolean
}

export function useGetGameRoom(appId: string, maxUsers = 4) {
  const [roomId, setRoomId] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [players, setPlayers] = useState<Player[]>([])

  const [isHost] = useState(
    () => !new URL(window.location.href).searchParams.has('room')
  )

  const [invitedRoomId] = useState(
    () => new URL(window.location.href).searchParams.get('room')
  )

  const roomRef = useRef<ReturnType<typeof joinRoom> | null>(null)
  const connectingRef = useRef(false)
  const unsubscribePlayersRef = useRef<(() => void) | null>(null)

  // Centralised room cleanup.
  // Pass false during component unmount to avoid unnecessary state updates.
  const cleanupRoom = useCallback((updateState = true) => {
    unsubscribePlayersRef.current?.()
    unsubscribePlayersRef.current = null

    const room = roomRef.current
    roomRef.current = null

    if (room) {
      void room.leave()
    }

    if (updateState) {
      setRoomId(null)
      setInviteLink(null)
      setPlayers([])
    }
  }, [])

  const connect = useCallback(async (displayName: string) => {
    if (roomRef.current || connectingRef.current) return

    const cleanName = displayName.trim().slice(0, 24)

    if (!cleanName) {
      setError(new Error('Please enter your name before connecting.'))
      return
    }

    connectingRef.current = true
    setLoading(true)
    setError(null)

    const url = new URL(window.location.href)

    const password = isHost
      ? crypto.randomUUID()
      : url.hash.slice(1)

    const newRoomId = isHost
      ? `party-${crypto.randomUUID().slice(0, 8)}`
      : invitedRoomId

    try {
      if (!Number.isInteger(maxUsers) || maxUsers < 1) {
        throw new Error('Maximum players must be at least 1.')
      }

      if (!newRoomId) {
        throw new Error('Invite link is missing its room ID.')
      }

      if (!password) {
        throw new Error('Invite link is missing its password.')
      }

      console.log('Connecting to room:', newRoomId)
      console.log('App ID:', appId)
      console.log('Host:', isHost)
      console.log('Maximum players:', maxUsers)
      console.log('Display name:', cleanName)

      const room = joinRoom(
        {
          appId,
          password,
          maxUsers,
        },
        newRoomId
      )

      roomRef.current = room

      room.onError(err => {
        console.error(
          'TRYSTERO ERROR:',
          err.code,
          err.message,
          err
        )

        const alone = Object.keys(room.getPeers()).length === 0

        if (err.code === 'room-full' && alone) {
          const message = `This room is full. Maximum players: ${maxUsers}.`
          cleanupRoom()
          setError(new Error(message))
        }

        if (err.code === 'decrypt-failed' && alone) {
          const message =
            'The invite link is invalid or has the wrong password.'
          setError(new Error(message))
        }
      })

      room.onPeerJoin(peerId => {
        console.log('PEER CONNECTED:', peerId)
        console.log('CURRENT PEERS:', room.getPeers())
        console.log('CURRENT USERS:', room.getUsers())
      })

      room.onPeerLeave(peerId => {
        console.log('PEER LEFT:', peerId)
        console.log('CURRENT PEERS:', room.getPeers())
      })

      room.onUserJoin(user => {
        console.log('USER JOINED:', user)
        console.log('ALL USERS:', room.getUsers())
      })

      room.onUserLeave(user => {
        console.log('USER LEFT:', user)
        console.log('ALL USERS:', room.getUsers())
      })

      const self = await room.getSelf()

      console.log('MY IDENTITY:', self)

      // Create shared player profile state.
      const playerState = room.makeUserState('player-profile', {
        name: cleanName,
        isHost,
      })

      // Update the local player list.
      const updatePlayers = () => {
        const allPlayers = playerState.getAll()

        const updatedPlayers = Object.entries(allPlayers).map(
          ([userId, profile]) => ({
            userId,
            name: profile.name,
            isHost: profile.isHost,
          })
        )

        updatedPlayers.sort(
          (a, b) => Number(b.isHost) - Number(a.isHost)
        )

        setPlayers(updatedPlayers)
      }

      // Subscribe to existing and future player profiles.
      unsubscribePlayersRef.current = playerState.onChange(
        updatePlayers,
        { replay: true }
      )

      // Publish this player's profile.
      playerState.set({
        name: cleanName,
        isHost,
      })

      updatePlayers()

      console.log('ROOM USERS:', room.getUsers())
      console.log('ROOM PEERS:', room.getPeers())

      setRoomId(newRoomId)

      if (isHost) {
        url.searchParams.set('room', newRoomId)
        url.hash = password

        setInviteLink(url.href)
      }
    } catch (err) {
      console.error('CONNECTION SETUP FAILED:', err)

      cleanupRoom()

      setError(
        err instanceof Error
          ? err
          : new Error(String(err))
      )
    } finally {
      connectingRef.current = false
      setLoading(false)
    }
  }, [appId, maxUsers, isHost, invitedRoomId, cleanupRoom])

  const disconnect = useCallback(() => {
    cleanupRoom()
    setError(null)
  }, [cleanupRoom])

  // Clean up when the component unmounts.
  useEffect(() => {
    return () => {
      cleanupRoom(false)
    }
  }, [cleanupRoom])

  return {
    connect,
    disconnect,
    roomId,
    inviteLink,
    isHost,
    invitedRoomId,
    loading,
    error,
    room: roomRef.current,
    players,
  }
}
