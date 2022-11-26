import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { Field, InputType } from 'type-graphql'

@InputType()
export class TextChannelInputData {
  @Field()
  @IsString()
    name: string

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
    slowMode?: number

  @Field()
  @IsUUID()
    groupId: string
}
