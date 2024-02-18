/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
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
import { PersonalMessage } from '../../types/entities/PersonalMessage'
import { User } from '../../types/entities/User'
import { VoiceChannel } from '../../types/entities/VoiceChannel'
import { MessageStateType } from '../../types/enums/MessageStateType'
import {
  deleteMessageFromPersonalConversationAction,
  deleteTextChannelMessageAction,
  readMessageAction,
  sendMessageToFriendAction,
  sendMessageToTextChannelAction,
  SocketMessageRooms
} from '../actions/MessageActions'

export async function initSocketEvents (io: Server, em: EntityManager): Promise<void> {
  try {
    let disconnectAction: undefined | ReturnType<typeof setTimeout>
    io.on('connection', async (socket) => {
      let currentUser: User
      try {
        currentUser = jwt.verify(socket.handshake.auth.token as string, PRIVATE_KEY) as User
        currentUser = await em.findOneOrFail(User, currentUser.id, { populate: ['groups', 'friendList', 'personalChats'] })
        disconnectAction && clearTimeout(disconnectAction)
        currentUser.isLoggedIn && em.assign(currentUser, { isLoggedIn: true })
      } catch (e) {
        console.log(e)
        socket.emit('authorization', 'failed')
        socket.disconnect()
        return
      }

      socket.emit('authorization', 'succeeded')
      console.log(`User ${currentUser.username} logged in`)

      await em.flush()
      await socket.join(`user:${currentUser.id}`)
      const groupsRooms = currentUser.groups.getItems().map(group => `group:${group.id}`)
      await socket.join(groupsRooms)
      const personalChatRooms = currentUser.personalChats.getItems().map(personalChat => `personal-chat:${personalChat.id}`)
      await socket.join(personalChatRooms)

      console.log('rooms', socket.rooms)

      io.to([...currentUser.friendList.getItems().map(fr => `user:${fr.id}`), ...groupsRooms]).emit('log-in')

      socket.on('message-send', async (data: SendMessageInputData) => {
        try {
          let socketMessageRooms: SocketMessageRooms
          if (data.personal) {
            socketMessageRooms = await sendMessageToFriendAction(data, currentUser, em)
          } else {
            socketMessageRooms = await sendMessageToTextChannelAction(data, currentUser, em)
          }
          io.to(socketMessageRooms.rooms).emit('message-receive', socketMessageRooms.message)
        } catch (e) {
          console.error(e)
        }
        em.clear()
      })

      socket.on('message-read', async (data: ReadMessageInputData) => {
        try {
          const result = await readMessageAction(data, currentUser, em)

          io.to(result.rooms).emit('message-read', result.channel)
        } catch (e) {
          console.error(e)
        }
        em.clear()
      })

      socket.on('message-delete', async (data: DeleteMessageInputData) => {
        try {
          let result: SocketMessageRooms
          if (data.personal) {
            result = await deleteMessageFromPersonalConversationAction(data, currentUser, em)
          } else {
            result = await deleteTextChannelMessageAction(data, currentUser, em)
          }
          emitMessageEvents(io, 'message-deleted', result)
        } catch (e) {
          console.error(e)
        }
        em.clear()
      })

      socket.on('send-voice-one-to-one', async (data: { personalChatId: string, description: RTCSessionDescriptionInit }, fn) => {
        try {
          if (!data.personalChatId?.length) return

          const personalChat = await em.findOne(PersonalChat, data.personalChatId, { populate: ['users'] })

          if (!personalChat) {
            socket.emit('answer-call-one-to-one', { err: 'User not found' })
            return
          }

          const callMessage = em.create(PersonalMessage, {
            from: currentUser,
            personalChat,
            isCall: true,
            text: '',
            state: MessageStateType.SENDED,
            callData: {},
            createdAt: new Date()
          })

          await em.persistAndFlush(callMessage)

          io.to(`user:${personalChat.users.getItems().find(u => u.id !== currentUser.id)!.id}`).emit('receive-call-one-to-one', {
            callMessage,
            description: data.description
          })
          fn({ callMessageId: callMessage.id })
        } catch (e) {
          console.error(e)
        }
        em.clear()
      })

      socket.on('answer-call-one-to-one', async (data: { callMessageId: string, description?: RTCSessionDescriptionInit, answer: boolean }) => {
        try {
          if (!data.callMessageId?.length) return
          const callMessage = await em.findOne(PersonalMessage, data.callMessageId, { populate: ['personalChat.users'] })

          if (!callMessage || callMessage.callData?.endTimestamp || callMessage.callData?.endTimestamp) {
            io.to(`user:${currentUser.id}`).emit('answer-call-one-to-one', {
              err: !callMessage ? 'This call message does not exist' : 'This call has ended'
            })
            return
          }

          em.assign(callMessage, {
            callData: {
              answer: data.answer,
              endCallingTimestamp: new Date(),
              startTimestamp: data.answer ? new Date() : undefined
            }
          })

          await em.flush()

          const to = `user:${callMessage.personalChat.users.getItems().find(u => u.id !== currentUser.id)!.id}`
          io.to(to).emit('answer-call-one-to-one', { callMessage, answer: data.answer, description: data.answer ? data.description : undefined })
        } catch (e) {
          console.error(e)
        }
        em.clear()
      })

      socket.on('send-candidate', async (data: { personalChatId: string, candidate: RTCIceCandidate }) => {
        em.clear()
        try {
          if (!data.personalChatId?.length) return
          const personalChat = await em.findOne(PersonalChat, data.personalChatId, { populate: ['users'] })

          if (!personalChat) {
            io.to(`user:${currentUser.id}`).emit('receive-candidate', { err: 'This call message does not exit' })
            return
          }

          const to = `user:${personalChat.users.getItems().find(u => u.id !== currentUser.id)!.id}`

          io.to(to).emit('receive-candidate', { personalChat, candidate: data.candidate })
        } catch (e) {
          console.error(e)
        }
      })

      socket.on('end-call-one-to-one', async (data: { callMessageId: string }) => {
        try {
          if (!data.callMessageId?.length) return
          const callMessage = await em.findOneOrFail(PersonalMessage, data.callMessageId, {
            populate: ['personalChat.users']
          })

          // if (!callMessage || callMessage.callData?.endTimestamp || callMessage.callData?.endCallingTimestamp) {
          //   if (!callMessage || !callMessage?.isCall || callMessage.callData?.endCallingTimestamp || callMessage.callData?.endTimestamp) {
          //     return
          //   }
          // }

          em.assign(callMessage, {
            callData: {
              ...callMessage,
              endTimestamp: new Date()
            }
          })

          await em.flush()

          const to = callMessage.personalChat.users.getItems().map(u => `user:${u.id}`)

          io.to(to).emit('end-call-one-to-one', { callMessage })
          em.clear()
        } catch (e) {
          console.error(e)
        }
      })

      socket.on('signal', async (data: { voiceChannelId: string, signal: any }) => {
        try {
          const voiceChannel = await em.findOne(VoiceChannel, data.voiceChannelId, { populate: ['users'] }) // todo check if user is member of group
          console.log(voiceChannel)
          if (!voiceChannel) return
          await socket.join(`voice-channel:${voiceChannel.id}`)

          if (!voiceChannel.users.getItems().find(u => u.id === currentUser.id)) {
            const user = await em.findOneOrFail(User, currentUser.id)
            voiceChannel.users.add(user)

            await em.flush()
          }

          console.log(voiceChannel.users.getItems().filter(u => u.id !== currentUser.id).map(u => `user:${u.id}`))

          io.to(voiceChannel.users.getItems().filter(u => u.id !== currentUser.id).map(u => `user:${u.id}`))
            .emit('signal', { voiceChannel, source: currentUser.id, signal: data.signal })
        } catch (e) {
          console.error(e)
        }
        em.clear()
      })

      socket.on('disconnect', async () => {
        try {
          const secondsOfTimeout = SECONDS_FOR_LOGOUT
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          disconnectAction = setTimeout(async () => {
            console.log(`User ${currentUser.username} logged out`)
            io.to([...currentUser.friendList.getItems().map(fr => `user:${fr.id}`), ...groupsRooms]).emit('log-out', currentUser)
            em.assign(currentUser, { isLoggedIn: false, lastLoggedInDate: new Date(new Date().valueOf() - secondsOfTimeout) })
            await em.flush()
          }, secondsOfTimeout)
        } catch (e) {
          console.error(e)
        }
        em.clear()
      })
    })
  } catch (e) {
    console.error(e)
  }
}

export function sendReceiveFriendRequest (io: Server, friendRequest?: FriendRequest, groupInvite?: GroupInvite): void {
  try {
    const toSockets = []
    toSockets.push(`user:${friendRequest?.toUser.id ?? groupInvite!.toUser.id}`)
    io.to(toSockets).emit('invitation-receive', { friendRequest, groupInvite, type: friendRequest ? 'FRIEND_REQUEST' : 'GROUP_INVITE' })
  } catch (e) {
    console.error(e)
  }
}

export function sendReceiveAnswerFriendRequest (
  io: Server,
  friendRequest?: FriendRequest,
  personalChat?: PersonalChat,
  groupInvite?: GroupInvite,
  group?: Group
): void {
  try {
    const toSockets = group ? group.members.getItems().map(m => `user:${m.id}`) : []
    toSockets.push(`user:${friendRequest?.fromUser.id ?? groupInvite!.toUser.id}`)
    io.to(toSockets).except(`user:${friendRequest?.toUser.id ?? groupInvite!.toUser.id}`).emit('invitation-answer-receive', {
      identifier: friendRequest?.id ?? groupInvite?.id,
      personalChat,
      group,
      type: personalChat ? 'PERSONAL_CHAT' : 'GROUP'
    })
  } catch (e) {
    console.error(e)
  }
}

export function updateUserEvent (user: User, io: Server): void {
  try {
    const roomsToSeeTheChange = [...user.friendList.getItems().map(friend => `user:${friend.id}`, ...user.groups.getItems().map(group => `group:${group.id}`))]

    io.to(roomsToSeeTheChange).emit('something-changed', user)
  } catch (e) {
    console.error(e)
  }
}

export function emitMessageEvents (io: Server, event: string, data: SocketMessageRooms): void {
  try {
    io.to(data.rooms).emit(event, data.message)
  } catch (e) {
    console.error(e)
  }
}

export function connectedUserInVoiceChannel (voiceChannel: VoiceChannel, io: Server): void {
  try {
    io.to([`group:${voiceChannel.group.id}`]).emit('connected-user-in-voice-channel', voiceChannel)
  } catch (e) {
    console.error(e)
  }
}

export function disconnectUserFromVoiceChannel (voiceChannel: VoiceChannel, io: Server): void {
  try {
    io.to([`group:${voiceChannel.group.id}`]).emit('disconnect-user-from-voice-channel', voiceChannel)
  } catch (e) {
    console.error(e)
  }
}

export function updateGroup (user: User, group: Group, io: Server): void {
  try {
    io.to([`user:${user.id}`, `group:${group.id}`]).emit('update-group', group)
  } catch (e) {
    console.error(e)
  }
}

export function newInviteOnCreateGroupInvite (user: User, groupInvite: GroupInvite, io: Server): void {
  try {
    io.to([`user:${user.id}`]).emit('new-invite', groupInvite)
  } catch (e) {
    console.error(e)
  }
}

export function updatePersonalChatEvent (usersIds: string[], personalChat: PersonalChat, io: Server): void {
  try {
    io.to(usersIds.map(userId => `user:${userId}`)).emit('update-personal-chat', personalChat)
  } catch (e) {
    console.error(e)
  }
}

export function kickFromVoiceChannel (voiceChannel: VoiceChannel, user: User, io: Server): void {
  try {
    io.to([`group:${voiceChannel.group.id}`]).emit('kick-user-from-voice-channel', {
      user,
      voiceChannel
    })
  } catch (e) {
    console.error(e)
  }
}
