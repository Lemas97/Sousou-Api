import { Field, InputType } from 'type-graphql'

import { FriendRequestInputData } from './FriendRequestInputData'

@InputType()
export class GroupInviteInputData extends FriendRequestInputData {
  @Field()
    groupId: string
}
