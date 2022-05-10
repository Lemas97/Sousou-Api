import { EntityManager } from '@mikro-orm/core'
import { DeleteMessageInputData } from 'src/types/classes/input-data/DeleteMessageInputData'
import { MessageInputData } from 'src/types/classes/input-data/MessageInputData'
import { AuthCustomContext } from 'src/types/interfaces/CustomContext'
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import { deleteMessageAction, sendMessageToTextChannelAction } from '../actions/MessageActions'

@Resolver()
export class MessageResolver {
  @Mutation(() => Boolean)
  async sendMessageToTextChannel (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('data') data: MessageInputData
  ): Promise<boolean> {
    return await sendMessageToTextChannelAction(data, ctx.user, em)
  }

  @Mutation(() => Boolean)
  async deleteMessage (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string,
      @Arg('data') data: DeleteMessageInputData
  ): Promise<boolean> {
    return await deleteMessageAction(id, data, ctx.user, em)
  }
}
