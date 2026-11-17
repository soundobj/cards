import { joinRoom } from 'trystero'
import { useCallback, useEffect, useRef, useState } from 'react'

export const showInviteLink = (url: string) => {
  console.log('Invite link:', url)
}

export const showBanner = (message: string) => {
  console.log('Banner:', message)
}

export function useGetGameRoom(appId: string, maxUsers = 4) {
  const [roomId, setRoomId] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const [isHost] = useState(
    () => !new URL(window.location.href).searchParams.has('room')
  )

  const [invitedRoomId] = useState(
    () => new URL(window.location.href).searchParams.get('room')
  )

  const roomRef = useRef<ReturnType<typeof joinRoom> | null>(null)
  const connectingRef = useRef(false)

  const connect = useCallback(async () => {
    if (roomRef.current || connectingRef.current) return

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
          showBanner(message)
          setError(new Error(message))

          void room.leave()

          if (roomRef.current === room) {
            roomRef.current = null
            setRoomId(null)
          }
        }

        if (err.code === 'decrypt-failed' && alone) {
          const message = 'The invite link is invalid or has the wrong password.'
          showBanner(message)
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
      console.log('ROOM USERS:', room.getUsers())
      console.log('ROOM PEERS:', room.getPeers())

      setRoomId(newRoomId)

      if (isHost) {
        url.searchParams.set('room', newRoomId)
        url.hash = password

        setInviteLink(url.href)
        showInviteLink(url.href)
      }
    } catch (err) {
      console.error('CONNECTION SETUP FAILED:', err)

      if (roomRef.current) {
        void roomRef.current.leave()
        roomRef.current = null
      }

      setError(
        err instanceof Error
          ? err
          : new Error(String(err))
      )
    } finally {
      connectingRef.current = false
      setLoading(false)
    }
  }, [appId, maxUsers, isHost, invitedRoomId])

  const disconnect = useCallback(() => {
    const room = roomRef.current

    roomRef.current = null

    if (room) {
      void room.leave()
    }

    setRoomId(null)
    setInviteLink(null)
    setError(null)
  }, [])

  useEffect(() => {
    return () => {
      const room = roomRef.current
      roomRef.current = null

      if (room) {
        void room.leave()
      }
    }
  }, [])

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
  }
}
