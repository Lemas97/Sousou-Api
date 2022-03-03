import { Field, InputType } from 'type-graphql'

@InputType()
export class FriendRequestInputData {
  @Field()
    toUserId: string

  @Field()
    message: string
}
