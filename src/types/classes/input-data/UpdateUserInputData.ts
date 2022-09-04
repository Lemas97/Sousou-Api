import { IsOptional, IsString } from 'class-validator'
import { Field, InputType } from 'type-graphql'

@InputType()
export class UpdateUserInputData {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
    username?: string
}
