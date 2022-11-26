import { Collection, Entity, ManyToOne, OneToMany } from '@mikro-orm/core'
import { Field, ObjectType } from 'type-graphql'
import { Message } from './Message'
import { PersonalChat } from './PersonalChat'
import { PersonalChatUsersPivot } from './PersonalChatUserPivot'

@Entity()
@ObjectType()
export class PersonalMessage extends Message {
  @ManyToOne(() => PersonalChat)
  @Field(() => PersonalChat)
    personalChat: PersonalChat

  @OneToMany(() => PersonalChatUsersPivot, pivot => pivot.lastReadMessage)
  @Field(() => PersonalChatUsersPivot)
    readBy = new Collection<PersonalChatUsersPivot>(this)
}
