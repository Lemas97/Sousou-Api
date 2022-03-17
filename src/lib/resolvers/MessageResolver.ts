import { EntityManager } from '@mikro-orm/core'
import { DeleteMessageInputData } from 'src/types/classes/input-data/DeleteMessageInputData'
import { MessageInputData } from 'src/types/classes/input-data/MessageInputData'
import { User } from 'src/types/entities/User'
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import { deleteMessageAction, sendMessageToTextChannelAction } from '../actions/MessageActions'

@Resolver()
export class MessageResolver {
  @Mutation(() => Boolean)
  async sendMessageToTextChannel (
    @Ctx('em') em: EntityManager,
      @Ctx('user') currentUser: User,
      @Arg('data') data: MessageInputData
  ): Promise<boolean> {
    return await sendMessageToTextChannelAction(data, currentUser, em)
  }

  @Mutation(() => Boolean)
  async deleteMessage (
    @Ctx('em') em: EntityManager,
      @Ctx('user') currentUser: User,
      @Arg('id') id: string,
      @Arg('data') data: DeleteMessageInputData
  ): Promise<boolean> {
    return await deleteMessageAction(id, data, currentUser, em)
  }
}
