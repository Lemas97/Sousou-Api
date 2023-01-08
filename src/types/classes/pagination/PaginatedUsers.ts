import { Field, ObjectType } from 'type-graphql'

import { User } from '../../entities/User'

@ObjectType()
export class PaginatedUsers {
  @Field(() => [User])
    data: User[]

  @Field()
    total: number
}
