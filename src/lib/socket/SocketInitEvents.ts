import { EntityManager } from '@mikro-orm/core'
import { Server } from 'socket.io'
import { MessageInputData } from 'src/types/classes/input-data/MessageInputData'
import { User } from 'src/types/entities/User'
import { sendMessageToTextChannelAction } from '../actions/MessageActions'

export async function initSocketEvents (io: Server, em: EntityManager): Promise<void> {
  io.on('connection', async (socket) => {
    // auth here
    // else socket.disconnect()
    const user = new User() // get user from auth
    await socket.join(`user:${user.id}`)
    await socket.join(user.groups.getItems().map(group => `group:${group.id}`))

    socket.emit('mpikes', 'message')

    socket.on('sendMessage', async (data: MessageInputData) => {
      const message = await sendMessageToTextChannelAction(data, user, em)
      io.to(`user:${data.fromUserId}`).emit('messageReceive', message)
    })

    socket.on('dataChange', async () => {
      const roomsToSeeTheChange = [...user.friendList.getItems().map(friend => `user:${friend.id}`, ...user.groups.getItems().map(group => `group:${group.id}`))]

      io.to(roomsToSeeTheChange).emit('somethingChanged', user)
    })
  })
}

export function updateUserEvent (user: User, io: Server): void {
  const roomsToSeeTheChange = [...user.friendList.getItems().map(friend => `user:${friend.id}`, ...user.groups.getItems().map(group => `group:${group.id}`))]

  io.to(roomsToSeeTheChange).emit('somethingChanged', user)
}
