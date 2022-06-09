import { Field, ObjectType } from 'type-graphql'

import { GroupInvite } from 'src/types/entities/GroupInvite'

@ObjectType()
export class PaginatedGroupInvites {
  @Field(() => [GroupInvite])
    data: GroupInvite[]

  @Field()
    total: number
}
