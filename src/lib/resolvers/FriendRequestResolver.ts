import { EntityManager } from '@mikro-orm/core'
import { Server } from 'socket.io'

import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql'
import { FriendRequestInputData } from '../../types/classes/input-data/FriendRequestInputData'
import { FriendRequest } from '../../types/entities/FriendRequest'
import { AuthCustomContext } from '../../types/interfaces/CustomContext'
import { answerFriendRequestAction, cancelFriendRequestAction, sendFriendRequestAction } from '../actions/FriendRequestActions'

@Resolver()
export class FriendRequestResolver {
  @Mutation(() => FriendRequest)
  @UseMiddleware()
  async createFriendRequest (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Ctx('io') io: Server,
      @Arg('data') data: FriendRequestInputData
  ): Promise<FriendRequest> {
    return await sendFriendRequestAction(data, ctx.user, io, em)
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
      @Ctx('io') io: Server,
      @Arg('id') id: string,
      @Arg('answer') answer: boolean
  ): Promise<FriendRequest> {
    return await answerFriendRequestAction(id, answer, ctx.user, io, em)
  }
}
