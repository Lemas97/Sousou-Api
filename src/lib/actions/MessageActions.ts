import { EntityManager } from '@mikro-orm/core'
import { ForbiddenError } from 'apollo-server-koa'
import { DeleteMessageInputData } from 'src/types/classes/input-data/DeleteMessageInputData'
import { PersonalMessageInputData } from 'src/types/classes/input-data/PersonalMessageInputData'
import { SendMessageInputData } from 'src/types/classes/input-data/SendMessageInputData'
import { Message } from 'src/types/entities/Message'
import { PersonalChat } from 'src/types/entities/PersonalChat'
import { PersonalMessage } from 'src/types/entities/PersonalMessage'
import { TextChannel } from 'src/types/entities/TextChannel'
import { TextChannelMessage } from 'src/types/entities/TextChannelMessage'
import { User } from 'src/types/entities/User'
import { MessageStateType } from 'src/types/enums/MessageStateType'

// todo check on resolver type of message
export async function sendMessageToTextChannelAction (data: SendMessageInputData, currentUser: User, em: EntityManager): Promise<Message> {
  const channel = await em.findOneOrFail(TextChannel, {
    $and: [
      { id: data.textChannelId },
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

  return message
}

// if deleteForAll = false handle on front to print message like "This message delete for you"
export async function deleteMessageAction (id: string, data: DeleteMessageInputData, currentUser: User, em: EntityManager): Promise<boolean> {
  const message = await em.findOneOrFail(TextChannelMessage, id, { populate: ['textChannel', 'textChannel.group'] })

  if (message.from.id !== currentUser.id && message.textChannel.group.owner !== currentUser) {
    message.deletedFromUsers.add(currentUser)
    await em.flush()
    return true
  }

  if (data.deleteForAll) {
    message.text = 'This message has been deleted.'
    message.state = MessageStateType.DELETED_FOR_ALL
  } else {
    message.state = MessageStateType.DELETED_FOR_ME
  }

  await em.flush()

  return true
}

export async function sendMessageToFriendAction (personalChatId: string, messageInputData: PersonalMessageInputData, currentUser: User, em: EntityManager): Promise<boolean> {
  const personalChat = await em.findOneOrFail(PersonalChat, personalChatId)

  const message = em.create(PersonalMessage, {
    createdAt: new Date(),
    personalChat: personalChat,
    from: currentUser,
    text: messageInputData.text,
    file: messageInputData.file,
    state: MessageStateType.SENDED
  })

  await em.persistAndFlush(message)

  return true
}

export async function deleteMessageFromPersonalConversationAction (personalMessageId: string, data: DeleteMessageInputData, currentUser: User, em: EntityManager): Promise<boolean> {
  const message = await em.findOneOrFail(PersonalMessage, personalMessageId)

  if (!message.personalChat.users.contains(currentUser)) {
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

  return true
}
