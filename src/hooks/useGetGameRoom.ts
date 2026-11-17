import {joinRoom, roles} from 'trystero'
import { useCallback, useState } from 'react'

export const showInviteLink = (url: string) => {
  console.log('Invite link:', url)
}

export const showBanner = (message: string) => {
  console.log('Banner:', message)
}

export function useGetGameRoom (appId: string, maxUsers: number = 4) {
  const url = new URL(location.href)
  const invitedRoomId = url.searchParams.get('room')
  const isHost = !invitedRoomId
  
  // Store the password in the URL hash so it is never sent in HTTP requests
  const password = isHost ? crypto.randomUUID() : url.hash.slice(1)

  const [roomId, setRoomId] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  // const [hostId, setHostId] = useState<string | null>(null)

  const connect = useCallback(async () => {
  
  const room = joinRoom(
    {
      appId,
      password,
      maxUsers,
      use: [isHost ? roles({selfAsAdmin: true}) : roles()]
    },
    isHost ? `party-${crypto.randomUUID().slice(0, 4)}` : invitedRoomId
  )

    const {userId: myId, roomId} = await room.getSelf()

  // selfAsAdmin formats roomId as "party-3f9a~<22-char host userId>"
  setRoomId(roomId.slice(roomId.lastIndexOf('~') + 1))
  
  if (isHost) {
    url.searchParams.set('room', roomId)
    url.hash = password
    setInviteLink(url.href)
    // showInviteLink(url.href)
  }
  
  room.onError(err => {
    const alone = Object.keys(room.getPeers()).length === 0
    if (err.code === 'room-full' && alone) {
      showBanner('All four seats are taken.')
    } else if (err.code === 'decrypt-failed' && alone) {
      showBanner('Invite link is missing or has an invalid key.')
    }
  })

}, [appId, password, isHost, invitedRoomId])
  
  return {
    connect,
    roomId,
    isHost,
    invitedRoomId,
    inviteLink,
  }
}