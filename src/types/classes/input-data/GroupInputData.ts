import { Field, InputType } from 'type-graphql'

@InputType()
export class GroupInputData {
  @Field()
    name: string

  @Field()
    icon: string

  @Field()
    color: string

  @Field()
    ownerId: string
}
