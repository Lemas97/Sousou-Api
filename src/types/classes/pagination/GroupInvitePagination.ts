import { Field, ObjectType } from 'type-graphql'

import { GroupInvite } from '../../entities/GroupInvite'

@ObjectType()
export class PaginatedGroupInvites {
  @Field(() => [GroupInvite])
    data: GroupInvite[]

  @Field()
    total: number
}
