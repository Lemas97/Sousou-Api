import { GroupInvite } from 'src/types/entities/GroupInvite'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class GroupInviteSubscription {
  @Field(() => GroupInvite)
    group: GroupInvite

  @Field()
    event: string
}
