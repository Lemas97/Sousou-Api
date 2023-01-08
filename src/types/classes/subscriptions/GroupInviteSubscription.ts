import { GroupInvite } from '../../entities/GroupInvite'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class GroupInviteSubscription {
  @Field(() => GroupInvite)
    group: GroupInvite

  @Field()
    event: string
}
