import { EntityManager } from '@mikro-orm/core'
import jwt from 'jsonwebtoken'
import { Server } from 'socket.io'
import { PRIVATE_KEY } from '../../dependencies/config'
import { DeleteMessageInputData } from '../../types/classes/input-data/DeleteMessageInputData'
import { SendMessageInputData } from '../../types/classes/input-data/PersonalMessageInputData'
import { ReadMessageInputData } from '../../types/classes/input-data/ReadMessageInputData'
import { User } from '../../types/entities/User'
import { VoiceChannel } from '../../types/entities/VoiceChannel'
import { deleteMessageFromPersonalConversationAction, deleteTextChannelMessageAction, readMessageAction, sendMessageToFriendAction, sendMessageToTextChannelAction, SocketMessageRooms } from '../actions/MessageActions'

export async function initSocketEvents (io: Server, em: EntityManager): Promise<void> {
  io.on('connection', async (socket) => {
    let user: User
    try {
      user = jwt.verify(socket.handshake.query.token as string, PRIVATE_KEY) as User
      user = await em.findOneOrFail(User, user.id, { populate: ['groups', 'friendList'] })
    } catch (e) {
      console.log(e)
      socket.emit('authorization', 'failed')
      socket.disconnect()
      return
    }

    socket.emit('authorization', 'success')
    console.log(`User ${user.username} logged in`)

    await socket.join(`user:${user.id}`)
    const groupsRooms = user.groups.getItems().map(group => `group:${group.id}`)
    await socket.join(groupsRooms)
    const personalChatRooms = user.personalChats.getItems().map(personalChat => `personal-chat:${personalChat.personalChat.id}`)
    await socket.join(personalChatRooms)

    io.to([...user.friendList.getItems().map(fr => `user:${fr.id}`), ...groupsRooms]).emit('log-in')

    socket.on('message-send', async (data: SendMessageInputData) => {
      let socketMessageRooms: SocketMessageRooms
      if (data.personal) {
        socketMessageRooms = await sendMessageToFriendAction(data, user, em)
      } else {
        socketMessageRooms = await sendMessageToTextChannelAction(data, user, em)
      }
      io.to(socketMessageRooms.rooms).emit('message-receive', socketMessageRooms.message)
    })

    socket.on('message-read', async (data: ReadMessageInputData) => {
      const result = await readMessageAction(data, user, em)

      io.to(result.rooms).emit('message-read', result.channel)
    })

    socket.on('message-delete', async (data: DeleteMessageInputData) => {
      let result: SocketMessageRooms
      if (data.personal) {
        result = await deleteMessageFromPersonalConversationAction(data, user, em)
      } else {
        result = await deleteTextChannelMessageAction(data, user, em)
      }
      emitMessageEvents(io, 'message-deleted', result)
    })

    socket.on('profile-update', async () => {
      const roomsToSeeTheChange = [...user.friendList.getItems().map(friend => `user:${friend.id}`, ...user.groups.getItems().map(group => `group:${group.id}`))]

      io.to(roomsToSeeTheChange).emit('profile-updated', user)
    })

    socket.on('disconnect', () => {
      console.log(`User ${user.username} logged out`)
      io.to([...user.friendList.getItems().map(fr => `user:${fr.id}`), ...groupsRooms]).emit('log-out')
    })
  })
}

export function updateUserEvent (user: User, io: Server): void {
  const roomsToSeeTheChange = [...user.friendList.getItems().map(friend => `user:${friend.id}`, ...user.groups.getItems().map(group => `group:${group.id}`))]

  io.to(roomsToSeeTheChange).emit('somethingChanged', user)
}

export function emitMessageEvents (io: Server, event: string, data: SocketMessageRooms): void {
  io.to(data.rooms).emit(event, data.message)
}

export function connectedUserInVoiceChannel (voiceChannel: VoiceChannel, io: Server): void {
  io.to([`group:${voiceChannel.group.id}`]).emit('connectedUserInVoiceChannel', voiceChannel)
}

export function disconnectUserInVoiceChannel (voiceChannel: VoiceChannel, io: Server): void {
  io.to([`group:${voiceChannel.group.id}`]).emit('disconnectUserInVoiceChannel', voiceChannel)
}
