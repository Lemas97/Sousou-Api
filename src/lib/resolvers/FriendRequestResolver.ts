import { EntityManager } from '@mikro-orm/core'
import { FriendRequestInputData } from 'src/types/classes/input-data/FriendRequestInputData'
import { FriendRequest } from 'src/types/entities/FriendRequest'
import { AuthCustomContext } from 'src/types/interfaces/CustomContext'
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql'
import { answerFriendRequestAction, cancelFriendRequestAction, sendFriendRequestAction } from '../actions/FriendRequestActions'

@Resolver()
export class FriendRequestResolver {
  @Mutation(() => FriendRequest)
  @UseMiddleware()
  async createFriendRequest (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('data') data: FriendRequestInputData
  ): Promise<FriendRequest> {
    return await sendFriendRequestAction(data, ctx.user, em)
  }

  @Mutation(() => FriendRequest)
  async cancelFriendRequest (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string
  ): Promise<FriendRequest> {
    return await cancelFriendRequestAction(id, ctx.user, em)
  }

  @Mutation(() => FriendRequest)
  async answerFriendRequest (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string,
      @Arg('answer') answer: boolean
  ): Promise<FriendRequest> {
    return await answerFriendRequestAction(id, answer, ctx.user, em)
  }
}
