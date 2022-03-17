import { Field, InputType } from 'type-graphql'

@InputType()
export class SendMessageInputData {
  @Field()
    textChannelId: string

  @Field()
    text: string
}
