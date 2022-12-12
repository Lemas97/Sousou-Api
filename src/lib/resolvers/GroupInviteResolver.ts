import { GroupInviteInputData } from '../../types/classes/input-data/GroupInviteInputData'
import { PaginatedInputData } from '../../types/classes/input-data/PaginatedInputData'
import { PaginatedGroupInvites } from '../../types/classes/pagination/GroupInvitePagination'
import { AuthCustomContext } from '../../types/interfaces/CustomContext'
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { answerGroupInviteAction, cancelGroupInviteAction, createGroupInviteAction, getGroupInviteActions } from '../actions/GroupInvitesActions'
import { EntityManager } from '@mikro-orm/core'
import { Server } from 'socket.io'

@Resolver()
export class GroupInviteResolver {
  @Query(() => PaginatedGroupInvites)
  async getGroupInvites (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('paginationInputData') paginationInputData: PaginatedInputData,
      @Arg('forMe') forMe: boolean
  ): Promise<PaginatedGroupInvites> {
    return await getGroupInviteActions(paginationInputData, forMe, ctx.user, em)
  }

  @Mutation(() => Boolean)
  async createGroupInvite (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Ctx('io') io: Server,
      @Arg('data') data: GroupInviteInputData
  ): Promise<boolean> {
    await createGroupInviteAction(data, ctx.user, io, em)
    return true
  }

  @Mutation(() => Boolean)
  async cancelGroupInvite (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string
  ): Promise<boolean> {
    await cancelGroupInviteAction(id, ctx.user, em)
    return true
  }

  @Mutation(() => Boolean)
  async answerGroupInvite (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Ctx('io') io: Server,
      @Arg('id') id: string,
      @Arg('answer') answer: boolean
  ): Promise<boolean> {
    await answerGroupInviteAction(id, answer, ctx.user, io, em)
    return true
  }
}
