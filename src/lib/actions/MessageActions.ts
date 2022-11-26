import { EntityManager } from '@mikro-orm/core'
import { ForbiddenError } from 'apollo-server-koa'
import { DeleteMessageInputData } from 'src/types/classes/input-data/DeleteMessageInputData'
import { SendMessageInputData } from 'src/types/classes/input-data/PersonalMessageInputData'
import { ReadMessageInputData } from 'src/types/classes/input-data/ReadMessageInputData'
import { PersonalChat } from 'src/types/entities/PersonalChat'
import { PersonalChatUsersPivot } from 'src/types/entities/PersonalChatUserPivot'
import { PersonalMessage } from 'src/types/entities/PersonalMessage'
import { TextChannel } from 'src/types/entities/TextChannel'
import { TextChannelMessage } from 'src/types/entities/TextChannelMessage'
import { TextChannelUserPivot } from 'src/types/entities/TextChannelUserPivot'
import { User } from 'src/types/entities/User'
import { MessageStateType } from 'src/types/enums/MessageStateType'

// todo check on resolver type of message
export async function sendMessageToTextChannelAction (data: SendMessageInputData, currentUser: User, em: EntityManager): Promise<SocketMessageRooms> {
  const channel = await em.findOneOrFail(TextChannel, {
    $and: [
      { id: data.identifier },
      { group: { members: { id: currentUser.id } } }
    ]
  }, {
    populate: [
      'group',
      'group.members'
    ]
  })

  const message = em.create(TextChannelMessage, {
    createdAt: new Date(),
    from: currentUser,
    text: data.text,
    textChannel: channel,
    state: MessageStateType.SENDED
  })

  await em.persistAndFlush(message)

  return { message, rooms: [`group:${channel.group.id}`] }
}

// if deleteForAll = false handle on front to print message like "This message delete for you"
export async function deleteTextChannelMessageAction (data: DeleteMessageInputData, currentUser: User, em: EntityManager): Promise<SocketMessageRooms> {
  const message = await em.findOneOrFail(TextChannelMessage, data.id, { populate: ['textChannel', 'textChannel.group'] })

  if (message.from.id !== currentUser.id && message.textChannel.group.owner !== currentUser) {
    message.deletedFromUsers.add(currentUser)
    await em.flush()
    return { message, rooms: [`user:${currentUser.id}`] }
  }

  if (data.deleteForAll) {
    message.text = 'This message has been deleted.'
    message.state = MessageStateType.DELETED_FOR_ALL
  } else {
    message.state = MessageStateType.DELETED_FOR_ME
  }

  await em.flush()

  return { message, rooms: [`group:${message.textChannel.group.id}`] }
}

export async function sendMessageToFriendAction (messageInputData: SendMessageInputData, currentUser: User, em: EntityManager): Promise<SocketMessageRooms> {
  const personalChat = await em.findOneOrFail(PersonalChat, messageInputData.identifier, {
    populate: ['pivot.users'],
    populateWhere: {
      pivot: { users: { id: { $ne: currentUser.id } } }
    }
  })

  const message = em.create(PersonalMessage, {
    createdAt: new Date(),
    personalChat: personalChat,
    from: currentUser,
    text: messageInputData.text,
    file: messageInputData.file,
    state: MessageStateType.SENDED
  })

  return { message, rooms: message.personalChat.pivot ? message.personalChat?.pivot.users.getItems().map(pm => `user:${pm.id}`) : [] }
}

export async function deleteMessageFromPersonalConversationAction (data: DeleteMessageInputData, currentUser: User, em: EntityManager): Promise<SocketMessageRooms> {
  const message = await em.findOneOrFail(PersonalMessage, data.id, { populate: ['personalChat.pivot.users'] })

  if (message.personalChat.pivot && !message.personalChat.pivot.users.contains(currentUser)) {
    throw new ForbiddenError('NO_ACCESS')
  }

  if (currentUser !== message.from && data.deleteForAll) {
    throw new ForbiddenError('NO_ACCESS')
  }

  if (data.deleteForAll) {
    message.text = 'This message has been deleted.'
    message.state = MessageStateType.DELETED_FOR_ALL
  } else {
    message.deletedFromUsers.add(currentUser)
    message.state = MessageStateType.DELETED_FOR_ME

    await em.flush()
  }

  return { message, rooms: message.personalChat.pivot ? message.personalChat.pivot.users.getItems().map(user => `user:${user.id}`) : [] }
}

export async function readMessageAction (data: ReadMessageInputData, currentUser: User, em: EntityManager): Promise<SocketReadMessageRooms> {
  let message: TextChannelMessage | PersonalMessage
  let rooms: string[]
  let returnValue: PersonalChat | TextChannel
  if (data.personal) {
    message = await em.findOneOrFail(PersonalMessage, data.messageId, {
      populate: ['personalChat.pivot'],
      populateWhere: { personalChat: { pivot: { users: { id: { $ne: currentUser.id } } } } }
    })

    const personalChatUserPivot = await em.findOneOrFail(PersonalChatUsersPivot, {
      personalChat: message.personalChat.id
    })

    em.assign(personalChatUserPivot, { lastReadMessage: message })

    returnValue = message.personalChat

    rooms = [`personal-chat:${message.personalChat.id}`]
  } else {
    message = await em.findOneOrFail(TextChannelMessage, data.messageId, {
      populate: ['textChannel', 'textChannel.group']
    })
    if (message.textChannel.users.contains(currentUser)) {
      message.textChannel.users.add(currentUser)
      await em.flush()
    }

    const textChannelUserPivot = await em.findOneOrFail(TextChannelUserPivot, {
      user: currentUser.id,
      textChannel: message.textChannel
    })

    em.assign(textChannelUserPivot, {
      lastReadMessage: message
    })

    returnValue = message.textChannel

    rooms = [`group:${message.textChannel.group.id}`]
  }
  await em.flush()

  return { rooms, channel: returnValue }
}

export class SocketReadMessageRooms {
  rooms: string[]
  channel: TextChannel | PersonalChat
}

export class SocketMessageRooms {
  rooms: string[]
  message: TextChannelMessage | PersonalMessage
}
