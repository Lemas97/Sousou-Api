import { IsEmail, Length } from 'class-validator'
import { Field, InputType } from 'type-graphql'

@InputType()
export class UserRegisterInputData {
  @Field()
    username: string

  @Field()
  @IsEmail()
    email: string

  @Field({ nullable: true })
    displayName?: string

  @Field()
  @Length(6)
    password: string
}
