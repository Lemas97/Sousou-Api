import { Group } from 'src/types/entities/Group'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class PaginatedGroups {
  @Field(() => [Group])
    data: Group[]

  @Field()
    total: number
}
