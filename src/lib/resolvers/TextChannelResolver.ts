import { EntityManager } from '@mikro-orm/core'
import { TextChannelInputData } from '../../types/classes/input-data/TextChannelInputData'
import { AuthCustomContext } from '../../types/interfaces/CustomContext'
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { createTextChannelAction, deleteTextChannelAction, getTextChannelByIdAction, getPaginatedTextChannelMessagesByTextChannelIdAction, updateTextChannelAction } from '../actions/TextChannelActions'
import { TextChannel } from '../../types/entities/TextChannel'
import { PaginatedInputData } from '../../types/classes/input-data/PaginatedInputData'
import { PaginatedTextChannelMessages } from '../../types/classes/pagination/PaginatedTextChannelMessages'

@Resolver()
export class TextChannelResolver {
  @Query(() => TextChannel)
  async getTextChannelById (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string
  ): Promise<TextChannel> {
    return await getTextChannelByIdAction(id, ctx.user, em)
  }

  @Query(() => PaginatedTextChannelMessages)
  async getPaginatedTextChannelMessagesByTextChannelId (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('paginationInputData') paginationInputData: PaginatedInputData,
      @Arg('id') id: string
  ): Promise<PaginatedTextChannelMessages> {
    return await getPaginatedTextChannelMessagesByTextChannelIdAction(id, paginationInputData, ctx.user, em)
  }

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
