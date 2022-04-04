import { Entity, ManyToOne } from '@mikro-orm/core'
import { Field } from 'type-graphql'
import { Message } from './Message'
import { TextChannel } from './TextChannel'

@Entity()
export class TextChannelMessage extends Message {
  @ManyToOne(() => TextChannel)
  @Field(() => TextChannel)
    textChannel: TextChannel
}
