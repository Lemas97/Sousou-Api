import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import { Field, ObjectType } from 'type-graphql'
import { TextChannel } from './TextChannel'
import { TextChannelMessage } from './TextChannelMessage'
import { User } from './User'

@Entity()
@ObjectType()
export class TextChannelUserPivot {
  @ManyToOne(() => TextChannel, { primary: true })
  @Field(() => TextChannel)
    textChannel: TextChannel

  @ManyToOne(() => User, { primary: true })
  @Field(() => User)
    user: User

  @ManyToOne(() => TextChannelMessage)
  @Field(() => TextChannelMessage)
    lastReadMessage: TextChannelMessage

  @Property() // can place properties into pivot
  @Field()
    mute: boolean
}
