import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import { PersonalChat } from './PersonalChat'
import { PersonalMessage } from './PersonalMessage'
import { User } from './User'

@Entity()
export class PersonalChatUsersPivot {
  @ManyToOne(() => PersonalChat, { primary: true })
    personalChat: PersonalChat

  @ManyToOne(() => User, { primary: true })
    user: User

  @ManyToOne(() => PersonalMessage)
    lastReadMessage: PersonalMessage

  @Property() // can place properties into pivot
    mute: boolean
}
