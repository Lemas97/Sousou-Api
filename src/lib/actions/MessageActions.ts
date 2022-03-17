import { EntityManager } from '@mikro-orm/core'
import { DeleteMessageInputData } from 'src/types/classes/input-data/DeleteMessageInputData'
import { SendMessageInputData } from 'src/types/classes/input-data/SendMessageInputData'
import { Message } from 'src/types/entities/Message'
import { TextChannel } from 'src/types/entities/TextChannel'
import { User } from 'src/types/entities/User'

export async function sendMessageToTextChannelAction (data: SendMessageInputData, currentUser: User, em: EntityManager): Promise<boolean> {
  const channel = await em.findOneOrFail(TextChannel, {
    $and: [
      { id: data.textChannelId },
      { group: { members: { $in: currentUser } } }
    ]
  }, [
    'group',
    'group.members'
  ])

  const message = em.create(Message, {
    fromUser: currentUser,
    text: data.text,
    textChannel: channel
  })

  await em.persistAndFlush(message)

  return true
}

// if deleteForAll = false handle on front to print message like "This message delete for you"
export async function deleteMessageAction (id: string, data: DeleteMessageInputData, currentUser: User, em: EntityManager): Promise<boolean> {
  const message = await em.findOneOrFail(Message, id, ['textChannel', 'textChannel.group'])

  if (message.fromUser.id !== currentUser.id && message.textChannel.group.owner !== currentUser) {
    message.deletedFromUsers.add(currentUser)
    await em.flush()
    return true
  }

  if (data.deleteForAll) {
    message.text = 'This message has been deleted.'
    // todo message.state = MessageStateType.deleted
  }

  await em.flush()

  return true
}
