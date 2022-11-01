import { EntityManager } from '@mikro-orm/core'
import { TextChannelInputData } from 'src/types/classes/input-data/TextChannelInputData'
import { AuthCustomContext } from 'src/types/interfaces/CustomContext'
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import { createTextChannelAction, deleteTextChannelAction, updateTextChannelAction } from '../actions/TextChannelActions'

@Resolver()
export class TextChannelResolver {
  @Mutation(() => Boolean)
  async createTextChannel (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('data') data: TextChannelInputData
  ): Promise<boolean> {
    return await createTextChannelAction(data, ctx.user, em)
  }

  @Mutation(() => Boolean)
  async updateTextChannel (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string,
      @Arg('data') data: TextChannelInputData
  ): Promise<boolean> {
    return await updateTextChannelAction(id, data, ctx.user, em)
  }

  @Mutation(() => Boolean)
  async deleteTextChannel (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string
  ): Promise<boolean> {
    return await deleteTextChannelAction(id, ctx.user, em)
  }
}
