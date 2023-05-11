/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { EntityManager } from '@mikro-orm/core'
import jwt from 'jsonwebtoken'
import { Server } from 'socket.io'
import { PRIVATE_KEY, SECONDS_FOR_LOGOUT } from '../../dependencies/config'
import { DeleteMessageInputData } from '../../types/classes/input-data/DeleteMessageInputData'
import { SendMessageInputData } from '../../types/classes/input-data/PersonalMessageInputData'
import { ReadMessageInputData } from '../../types/classes/input-data/ReadMessageInputData'
import { FriendRequest } from '../../types/entities/FriendRequest'
import { Group } from '../../types/entities/Group'
import { GroupInvite } from '../../types/entities/GroupInvite'
import { PersonalChat } from '../../types/entities/PersonalChat'
import { User } from '../../types/entities/User'
import { VoiceChannel } from '../../types/entities/VoiceChannel'
import { deleteMessageFromPersonalConversationAction, deleteTextChannelMessageAction, readMessageAction, sendMessageToFriendAction, sendMessageToTextChannelAction, SocketMessageRooms } from '../actions/MessageActions'

export async function initSocketEvents (io: Server, em: EntityManager): Promise<void> {
  let disconnectAction: undefined | ReturnType<typeof setTimeout>
  io.on('connection', async (socket) => {
    let user: User
    try {
      user = jwt.verify(socket.handshake.auth.token as string, PRIVATE_KEY) as User
      user = await em.findOneOrFail(User, user.id, { populate: ['groups', 'friendList', 'personalChats'] })
      disconnectAction && clearTimeout(disconnectAction)
      user.isLoggedIn && em.assign(user, { isLoggedIn: true })
    } catch (e) {
      console.log(e)
      socket.emit('authorization', 'failed')
      socket.disconnect()
      return
    }

    socket.emit('authorization', 'succeeded')
    console.log(`User ${user.username} logged in`)

    await socket.join(`user:${user.id}`)
    const groupsRooms = user.groups.getItems().map(group => `group:${group.id}`)
    await socket.join(groupsRooms)
    const personalChatRooms = user.personalChats.getItems().map(personalChat => `personal-chat:${personalChat.id}`)
    await socket.join(personalChatRooms)

    console.log('rooms', socket.rooms)

    io.to([...user.friendList.getItems().map(fr => `user:${fr.id}`), ...groupsRooms]).emit('log-in')

    socket.on('message-send', async (data: SendMessageInputData) => {
      try {
        let socketMessageRooms: SocketMessageRooms
        if (data.personal) {
          socketMessageRooms = await sendMessageToFriendAction(data, user, em)
        } else {
          socketMessageRooms = await sendMessageToTextChannelAction(data, user, em)
        }
        io.to(socketMessageRooms.rooms).emit('message-receive', socketMessageRooms.message)
      } catch (e) {
        console.log(e)
      }
    })

    socket.on('message-read', async (data: ReadMessageInputData) => {
      try {
        const result = await readMessageAction(data, user, em)

        io.to(result.rooms).emit('message-read', result.channel)
      } catch (e) {
        console.log(e)
      }
    })

    socket.on('message-delete', async (data: DeleteMessageInputData) => {
      try {
        let result: SocketMessageRooms
        if (data.personal) {
          result = await deleteMessageFromPersonalConversationAction(data, user, em)
        } else {
          result = await deleteTextChannelMessageAction(data, user, em)
        }
        emitMessageEvents(io, 'message-deleted', result)
      } catch (e) {
        console.log(e)
      }
    })

    socket.on('1st-send-voice-one-to-one', async (data: { toUserId: string, description: RTCSessionDescriptionInit }) => {
      io.to(`user:${data.toUserId}`).emit('answer-call-one-to-one', { fromUserId: user.id, description: data.description })
    })

    socket.on('answered-one-to-one', async (data: { toUserId: string, description: RTCSessionDescriptionInit }) => {
      io.to(`user:${data.toUserId}`).emit('call-accepted-one-to-one', { fromUserId: user.id, description: data.description })
    })

    socket.on('send-candidate', async (data: { toUserId: string, candidate: RTCIceCandidate }) => {
      io.to(`user:${data.toUserId}`).emit('receive-candidate', { fromUserId: user.id, candidate: data.candidate })
    })

    socket.on('end-call-one-to-one', async (data: { toUserId: string }) => {
      io.to(`user:${data.toUserId}`).emit('end-call-one-to-one')
    })

    socket.on('disconnect', async () => {
      try {
        const secondsOfTimeout = SECONDS_FOR_LOGOUT
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        disconnectAction = setTimeout(async () => {
          console.log(`User ${user.username} logged out`)
          io.to([...user.friendList.getItems().map(fr => `user:${fr.id}`), ...groupsRooms]).emit('log-out', user)
          em.assign(user, { isLoggedIn: false, lastLoggedInDate: new Date(new Date().valueOf() - secondsOfTimeout) })
          await em.flush()
        }, secondsOfTimeout)
      } catch (e) {
        console.log(e)
      }
    })
  })
}

export function sendReceiveFriendRequest (io: Server, friendRequest?: FriendRequest, groupInvite?: GroupInvite): void {
  io.to(`user:${friendRequest?.toUser.id ?? groupInvite?.toUser.id}`).emit('invitation-receive', { friendRequest, groupInvite, type: friendRequest ? 'FRIEND_REQUEST' : 'GROUP_INVITE' })
}

export function sendReceiveAnswerFriendRequest (io: Server, friendRequest?: FriendRequest, personalChat?: PersonalChat, groupInvite?: GroupInvite, group?: Group): void {
  io.to(`user:${friendRequest?.toUser.id ?? groupInvite?.toUser.id}`).emit('invitation-answer-receive', {
    identifier: friendRequest?.id ?? groupInvite?.id,
    personalChat,
    group,
    type: personalChat ? 'PERSONAL_CHAT' : 'GROUP'
  })

  io.to(`user:${friendRequest?.toUser.id ?? groupInvite?.toUser.id}`).emit('invitation-answer-receive', {
    identifier: friendRequest?.id ?? groupInvite?.id,
    personalChat,
    group,
    type: personalChat ? 'PERSONAL_CHAT' : 'GROUP'
  })
}

export function updateUserEvent (user: User, io: Server): void {
  const roomsToSeeTheChange = [...user.friendList.getItems().map(friend => `user:${friend.id}`, ...user.groups.getItems().map(group => `group:${group.id}`))]

  io.to(roomsToSeeTheChange).emit('something-changed', user)
}

export function emitMessageEvents (io: Server, event: string, data: SocketMessageRooms): void {
  io.to(data.rooms).emit(event, data.message)
}

export function connectedUserInVoiceChannel (voiceChannel: VoiceChannel, io: Server): void {
  io.to([`group:${voiceChannel.group.id}`]).emit('connected-user-in-voice-channel', voiceChannel)
}

export function disconnectUserFromVoiceChannel (voiceChannel: VoiceChannel, io: Server): void {
  io.to([`group:${voiceChannel.group.id}`]).emit('disconnect-user-from-voice-channel', voiceChannel)
}

export function updateGroup (user: User, group: Group, io: Server): void {
  io.to([`user:${user.id}`, `group:${group.id}`]).emit('update-group', group)
}

export function newInviteOnCreateGroupInvite (user: User, groupInvite: GroupInvite, io: Server): void {
  io.to([`user:${user.id}`]).emit('new-invite', groupInvite)
}

export function updatePersonalChatEvent (usersIds: string[], personalChat: PersonalChat, io: Server): void {
  io.to(usersIds.map(userId => `user:${userId}`)).emit('update-personal-chat', personalChat)
}

export function kickFromVoiceChannel (voiceChannel: VoiceChannel, user: User, io: Server): void {
  io.to([`group:${voiceChannel.group.id}`]).emit('kick-user-from-voice-channel', {
    user,
    voiceChannel
  })
}
