import { IsUUID } from 'class-validator'
import { Field, InputType } from 'type-graphql'

@InputType()
export class MessageInputData {
  @Field()
    text: string

  @Field({ nullable: true })
    file?: string

  @Field()
  @IsUUID()
    fromUserId: string

  @Field()
  @IsUUID()
    textChannelId: string
}
