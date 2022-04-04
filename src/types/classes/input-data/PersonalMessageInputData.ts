import { Field, InputType } from 'type-graphql'

@InputType()
export class PersonalMessageInputData {
  @Field()
    text: string

  @Field({ nullable: true })
    file?: string
}
