import { Field, InputType } from 'type-graphql'

@InputType()
export class ReadMessageInputData {
  @Field()
    messageId: string

  @Field()
    identifier: string

  @Field()
    personal: boolean
}
