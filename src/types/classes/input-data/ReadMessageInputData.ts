import { Field, InputType } from 'type-graphql'

@InputType()
export class ReadMessageInputData {
  @Field()
    messageId: string

  @Field()
    personalChatId: string

  @Field()
    personal: boolean
}
