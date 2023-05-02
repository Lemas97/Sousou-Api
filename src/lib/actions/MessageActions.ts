import { EntityManager } from '@mikro-orm/core'
import { ForbiddenError } from 'apollo-server-koa'
import { DeleteMessageInputData } from '../../types/classes/input-data/DeleteMessageInputData'
import { SendMessageInputData } from '../../types/classes/input-data/PersonalMessageInputData'
import { ReadMessageInputData } from '../../types/classes/input-data/ReadMessageInputData'
import { PersonalChat } from '../../types/entities/PersonalChat'
import { PersonalMessage } from '../../types/entities/PersonalMessage'
import { TextChannel } from '../../types/entities/TextChannel'
import { TextChannelMessage } from '../../types/entities/TextChannelMessage'
import { TextChannelUserPivot } from '../../types/entities/TextChannelUserPivot'
import { User } from '../../types/entities/User'
import { MessageStateType } from '../../types/enums/MessageStateType'
import { PersonalChatUserPivot } from '../../types/entities/LastReadMessagePivot'

// todo check on resolver type of message
export async function sendMessageToTextChannelAction (data: SendMessageInputData, currentUser: User, em: EntityManager): Promise<SocketMessageRooms> {
  em.clear()
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

  await em.populate(channel.group, ['members'], {
    where: {
      members: { id: { $ne: currentUser.id } }
    }
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
  console.log(currentUser.id)
  em.clear()
  const personalChat = await em.findOneOrFail(PersonalChat, messageInputData.identifier, {
    populate: []
  })

  if (personalChat) {
    await em.populate(personalChat, ['users'])
  }
  const message = em.create(PersonalMessage, {
    createdAt: new Date(),
    personalChat: personalChat,
    from: currentUser,
    text: messageInputData.text,
    file: messageInputData.file,
    state: MessageStateType.SENDED
  })
  await em.persistAndFlush(message)

  return { message, rooms: message.personalChat ? [`personal-chat:${message.personalChat.id}`] : [] }
}

export async function deleteMessageFromPersonalConversationAction (data: DeleteMessageInputData, currentUser: User, em: EntityManager): Promise<SocketMessageRooms> {
  const message = await em.findOneOrFail(PersonalMessage, data.id, { populate: ['personalChat.users'] })

  if (message.personalChat && !message.personalChat.users.contains(currentUser)) {
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

  return { message, rooms: message.personalChat ? message.personalChat.users.getItems().map(user => `user:${user.id}`) : [] }
}

export async function readMessageAction (data: ReadMessageInputData, currentUser: User, em: EntityManager): Promise<SocketReadMessageRooms> {
  let message: TextChannelMessage | PersonalMessage
  let rooms: string[]
  let returnValue: PersonalChatUserPivot | TextChannelUserPivot
  if (data.personal) {
    message = await em.findOneOrFail(PersonalMessage, data.messageId, {
      populate: ['personalChat'],
      populateWhere: { personalChat: { users: { id: { $ne: currentUser.id } } } },
      orderBy: { createdAt: 'DESC' }
    })

    const lastReadPivot = await em.findOneOrFail(PersonalChatUserPivot, {
      user: currentUser.id,
      personalChat: message.personalChat.id ?? ''
    }, {
      populate: ['user']
    })

    em.assign(lastReadPivot, { lastReadMessage: message })

    returnValue = lastReadPivot

    rooms = [`personal-chat:${message.personalChat.id}`]
  } else {
    message = await em.findOneOrFail(TextChannelMessage, data.messageId, {
      populate: ['textChannel.group', 'textChannel.users'],
      orderBy: { createdAt: 'DESC' }
    })
    if (message.textChannel.users.contains(currentUser)) {
      message.textChannel.users.add(currentUser)
      await em.flush()
    }

    const textChannelUserPivot = await em.findOneOrFail(TextChannelUserPivot, {
      user: currentUser.id,
      textChannel: message.textChannel
    }, {
      populate: ['textChannel.group', 'user']
    })

    em.assign(textChannelUserPivot, {
      lastReadMessage: message
    })

    returnValue = textChannelUserPivot

    rooms = [`group:${message.textChannel.group.id}`]
  }
  await em.flush()

  return { rooms, except: [`user:${currentUser.id}`], channel: returnValue }
}

export class SocketReadMessageRooms {
  rooms: string[]
  except: string[]
  channel: PersonalChatUserPivot | TextChannelUserPivot
}

export class SocketMessageRooms {
  rooms: string[]
  message: TextChannelMessage | PersonalMessage
}
