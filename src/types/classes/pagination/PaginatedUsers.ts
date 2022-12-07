import { User } from '../../../types/entities/User'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class PaginatedUsers {
  @Field(() => [User])
    data: User[]

  @Field()
    total: number
}
