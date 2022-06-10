import { EntityManager } from '@mikro-orm/core'
import { PayloadGeneric } from 'src/types/classes/generics/PayloadGeneric'
import { GroupInviteInputData } from 'src/types/classes/input-data/GroupInviteInputData'
import { PaginatedInputData } from 'src/types/classes/input-data/PaginatedInputData'
import { PaginatedGroupInvites } from 'src/types/classes/pagination/GroupInvitePagination'
import { GroupInviteSubscription } from 'src/types/classes/subscriptions/GroupInviteSubscription'
import { GroupInvite } from 'src/types/entities/GroupInvite'
import { AuthCustomContext } from 'src/types/interfaces/CustomContext'
import { Arg, Ctx, Mutation, Publisher, PubSub, Query, Resolver, Root, Subscription } from 'type-graphql'
import { answerGroupInviteAction, cancelGroupInviteAction, createGroupInviteAction, getGroupInviteActions } from '../actions/GroupInvitesActions'

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
    @PubSub('GROUP_INVITE_CREATE') publish: Publisher<PayloadGeneric<GroupInvite>>,
      @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('data') data: GroupInviteInputData
  ): Promise<boolean> {
    const groupInvite = await createGroupInviteAction(data, ctx.user, em)
    await publish({ data: groupInvite, event: 'create' })
    return true
  }

  @Mutation(() => Boolean)
  async cancelGroupInvite (
    @PubSub('GROUP_INVITE_UPDATE') publish: Publisher<PayloadGeneric<GroupInvite>>,
      @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string
  ): Promise<boolean> {
    const groupInvite = await cancelGroupInviteAction(id, ctx.user, em)
    await publish({ data: groupInvite, event: 'cancel' })
    return true
  }

  @Mutation(() => Boolean)
  async answerGroupInvite (
    @PubSub('GROUP_INVITE_ANSWER') publish: Publisher<PayloadGeneric<GroupInvite>>,
      @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string,
      @Arg('answer') answer: boolean
  ): Promise<boolean> {
    const groupInvite = await answerGroupInviteAction(id, answer, ctx.user, em)
    await publish({ data: groupInvite, event: 'answer' })
    return true
  }

  @Subscription(() => GroupInviteSubscription, {
    topics: ['GROUP_INVITE_CREATE', 'GROUP_INVITE_UPDATE', 'GROUP_INVITE_ANSWER'],
    filter: ({ payload, args }) => {
      console.log(args)
      return (args.userId === (payload.data as GroupInvite).fromUser.id || (payload.data as GroupInvite).toUser.id === args.userId)
    }
  })
  onGroupInviteActions (@Root() payload: PayloadGeneric<GroupInvite>, @Arg('userId') _: string): GroupInviteSubscription {
    return { group: payload.data, event: payload.event }
  }
}
