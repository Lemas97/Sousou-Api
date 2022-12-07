import { Field, ObjectType } from 'type-graphql'

import { GroupInvite } from '../../../types/entities/GroupInvite'

@ObjectType()
export class PaginatedGroupInvites {
  @Field(() => [GroupInvite])
    data: GroupInvite[]

  @Field()
    total: number
}
