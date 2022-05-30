import { Field, ObjectType } from 'type-graphql'

import { FriendRequest } from 'src/types/entities/FriendRequest'

@ObjectType()
export class PaginatedFriendRequests {
  @Field(() => [FriendRequest])
    data: FriendRequest[]

  @Field()
    total: number
}
