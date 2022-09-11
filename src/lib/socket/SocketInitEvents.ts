import { EntityManager } from '@mikro-orm/core'
import jwt from 'jsonwebtoken'
import { Server } from 'socket.io'
import { PRIVATE_KEY } from 'src/dependencies/config'
import { PersonalMessageInputData } from 'src/types/classes/input-data/PersonalMessageInputData'
import { ReadMessageInputData } from 'src/types/classes/input-data/ReadMessageInputData'
import { User } from 'src/types/entities/User'
import { readMessageAction, sendMessageToFriendAction } from '../actions/MessageActions'

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
    await socket.join(user.groups.getItems().map(group => `group:${group.id}`))

    socket.on('sendMessage', async (data: PersonalMessageInputData) => {
      const message = await sendMessageToFriendAction(data, user, em)
      io.to(message.personalChat.users.getItems().map(pm => `user:${pm.id}`)).emit('messageReceive', message)
    })

    socket.on('readMessage', async (data: ReadMessageInputData) => {
      const result = await readMessageAction(data, user, em)

      io.to(result.rooms).emit('readMessage', result.message)
    })

    socket.on('dataChange', async () => {
      const roomsToSeeTheChange = [...user.friendList.getItems().map(friend => `user:${friend.id}`, ...user.groups.getItems().map(group => `group:${group.id}`))]

      io.to(roomsToSeeTheChange).emit('somethingChanged', user)
    })

    socket.on('disconnect', () => {
      console.log(`User ${user.username} logged out`)
    })
  })
}

export function updateUserEvent (user: User, io: Server): void {
  const roomsToSeeTheChange = [...user.friendList.getItems().map(friend => `user:${friend.id}`, ...user.groups.getItems().map(group => `group:${group.id}`))]

  io.to(roomsToSeeTheChange).emit('somethingChanged', user)
}
