import { IsBoolean, IsString, IsUUID } from 'class-validator'
import { Field, InputType } from 'type-graphql'

@InputType()
export class TextChannelInputData {
  @Field()
  @IsString()
    name: string

  @Field()
  @IsBoolean()
    slowMode?: boolean

  @Field()
  @IsUUID()
    groupId: string
}
