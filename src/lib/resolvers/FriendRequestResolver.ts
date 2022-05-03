import { EntityManager } from '@mikro-orm/core'
import { FriendRequestInputData } from 'src/types/classes/input-data/FriendRequestInputData'
import { FriendRequest } from 'src/types/entities/FriendRequest'
import { User } from 'src/types/entities/User'
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql'
import { answerFriendRequestAction, cancelFriendRequestAction, sendFriendRequestAction } from '../actions/FriendRequestActions'

@Resolver()
export class FriendRequestResolver {
  @Mutation(() => Boolean)
  @UseMiddleware()
  async createFriendRequest (
    @Ctx('em') em: EntityManager,
      @Ctx('user') currentUser: User,
      @Arg('data') data: FriendRequestInputData
  ): Promise<boolean> {
    return await sendFriendRequestAction(data, currentUser, em)
  }

  @Mutation(() => FriendRequest)
  async cancelFriendRequest (
    @Ctx('em') em: EntityManager,
      @Ctx('user') currentUser: User,
      @Arg('id') id: string
  ): Promise<FriendRequest> {
    return await cancelFriendRequestAction(id, currentUser, em)
  }

  @Mutation(() => FriendRequest)
  async answerFriendRequest (
    @Ctx('em') em: EntityManager,
      @Ctx('user') currentUser: User,
      @Arg('id') id: string,
      @Arg('answer') answer: boolean
  ): Promise<FriendRequest> {
    return await answerFriendRequestAction(id, answer, currentUser, em)
  }
}
