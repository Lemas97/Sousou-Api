import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import { TextChannel } from './TextChannel'
import { TextChannelMessage } from './TextChannelMessage'
import { User } from './User'

@Entity()
export class TextChannelUserPivot {
  @ManyToOne(() => TextChannel, { primary: true })
    textChannel: TextChannel

  @ManyToOne(() => User, { primary: true })
    user: User

  @ManyToOne(() => TextChannelMessage)
    lastReadMessage: TextChannelMessage

  @Property() // can place properties into pivot
    mute: boolean
}
