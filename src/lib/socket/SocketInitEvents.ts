import { EntityManager } from '@mikro-orm/core'
import jwt from 'jsonwebtoken'
import { Server } from 'socket.io'
import { PRIVATE_KEY } from '../../dependencies/config'
import { DeleteMessageInputData } from '../../types/classes/input-data/DeleteMessageInputData'
import { SendMessageInputData } from '../../types/classes/input-data/PersonalMessageInputData'
import { ReadMessageInputData } from '../../types/classes/input-data/ReadMessageInputData'
import { Group } from '../../types/entities/Group'
import { GroupInvite } from '../../types/entities/GroupInvite'
import { User } from '../../types/entities/User'
import { VoiceChannel } from '../../types/entities/VoiceChannel'
import { deleteMessageFromPersonalConversationAction, deleteTextChannelMessageAction, readMessageAction, sendMessageToFriendAction, sendMessageToTextChannelAction, SocketMessageRooms } from '../actions/MessageActions'

export async function initSocketEvents (io: Server, em: EntityManager): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  let disconnectAction: undefined | number
  io.on('connection', async (socket) => {
    let user: User
    try {
      user = jwt.verify(socket.handshake.auth.token as string, PRIVATE_KEY) as User
      user = await em.findOneOrFail(User, user.id, { populate: ['groups', 'friendList', 'personalChats.personalChat'] })
      disconnectAction && clearTimeout(disconnectAction)
      user.isLoggedIn && em.assign(user, { isLoggedIn: true })
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

        io.to(result.rooms).except(result.except).emit('message-read', result.channel)
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

    socket.on('disconnect', async () => {
      try {
        console.log(`User ${user.username} logged out`)
        em.assign(user, { isLoggedIn: false, lastLoggedInDate: new Date() })
        io.to([...user.friendList.getItems().map(fr => `user:${fr.id}`), ...groupsRooms]).emit('log-out', user)

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        disconnectAction = setTimeout(async (user: User, em: EntityManager) => {
          em.assign(user, { isLoggedIn: false, lastLoggedInDate: new Date() })
          await em.flush()
        }, 5000)
      } catch (e) {
        console.log(e)
      }
    })
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

export function deletedUserFromFriendList (deletedUser: User, io: Server): void {
  io.to([`user:${deletedUser.id}`]).emit('update-friend-list', deletedUser.friendList.getItems())
}

export function kickFromVoiceChannel (voiceChannel: VoiceChannel, user: User, io: Server): void {
  io.to([`group:${voiceChannel.group.id}`]).emit('kick-user-from-voice-channel', {
    user,
    voiceChannel
  })
}
