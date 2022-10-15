import { Collection, Entity, ManyToOne, OneToMany } from '@mikro-orm/core'
import { Field } from 'type-graphql'
import { Message } from './Message'
import { TextChannel } from './TextChannel'
import { TextChannelUserPivot } from './TextChannelUserPivot'

@Entity()
export class TextChannelMessage extends Message {
  @ManyToOne(() => TextChannel)
  @Field(() => TextChannel)
    textChannel: TextChannel

  @OneToMany(() => TextChannelUserPivot, pivot => pivot.lastReadMessage)
  @Field(() => [TextChannelUserPivot])
    readBy = new Collection<TextChannelUserPivot>(this)
}
