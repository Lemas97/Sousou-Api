import { Field, ObjectType } from 'type-graphql'

import { FriendRequest } from '../../../types/entities/FriendRequest'

@ObjectType()
export class PaginatedFriendRequests {
  @Field(() => [FriendRequest])
    data: FriendRequest[]

  @Field()
    total: number
}
