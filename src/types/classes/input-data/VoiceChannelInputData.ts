import { IsInt, IsString, IsUUID } from 'class-validator'
import { Field, InputType } from 'type-graphql'

@InputType()
export class VoiceChannelInputData {
  @Field()
  @IsString()
    name: string

  @Field({ nullable: true })
  @IsInt()
    maxUsers?: number

  @Field()
  @IsUUID()
    groupId: string
}
