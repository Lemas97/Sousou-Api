import { Field, InputType } from 'type-graphql'

@InputType()
export class LoginUserInputData {
  @Field()
    email: string

  @Field()
    password: string
}
