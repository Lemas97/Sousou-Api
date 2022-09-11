import { Field, InputType } from 'type-graphql'

@InputType()
export class PersonalMessageInputData {
  @Field()
    personalChatId: string

  @Field()
    text: string

  @Field({ nullable: true })
    file?: string
}
