import { EntityManager } from '@mikro-orm/core'
import { DeleteMessageInputData } from 'src/types/classes/input-data/DeleteMessageInputData'
import { MessageInputData } from 'src/types/classes/input-data/MessageInputData'
import { Message } from 'src/types/entities/Message'
import { AuthCustomContext } from 'src/types/interfaces/CustomContext'
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import { deleteTextChannelMessageAction, sendMessageToTextChannelAction } from '../actions/MessageActions'

@Resolver()
export class MessageResolver {
  @Mutation(() => Message)
  async sendMessageToTextChannel (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('data') data: MessageInputData
  ): Promise<Message> {
    return await sendMessageToTextChannelAction(data, ctx.user, em)
  }

  @Mutation(() => Boolean)
  async deleteMessage (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string,
      @Arg('data') data: DeleteMessageInputData
  ): Promise<boolean> {
    return await deleteTextChannelMessageAction(id, data, ctx.user, em)
  }
}
