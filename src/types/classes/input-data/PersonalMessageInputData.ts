import { Field, InputType } from 'type-graphql'

@InputType()
export class SendMessageInputData {
  @Field()
    identifier: string

  @Field()
    personal: boolean

  @Field()
    text: string

  @Field({ nullable: true })
    file?: string
}
