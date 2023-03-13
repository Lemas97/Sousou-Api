import { Collection, Entity, ManyToOne, OneToMany } from '@mikro-orm/core'
import { Field, ObjectType } from 'type-graphql'
import { PersonalChatUserPivot } from './LastReadMessagePivot'
import { Message } from './Message'
import { PersonalChat } from './PersonalChat'

@Entity()
@ObjectType()
export class PersonalMessage extends Message {
  @ManyToOne(() => PersonalChat)
  @Field(() => PersonalChat)
    personalChat: PersonalChat

  @OneToMany(() => PersonalChatUserPivot, pivot => pivot.lastReadMessage)
  @Field(() => PersonalChatUserPivot)
    readBy = new Collection<PersonalChatUserPivot>(this)
}
