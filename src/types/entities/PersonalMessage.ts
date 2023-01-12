import { Collection, Entity, ManyToOne, OneToMany } from '@mikro-orm/core'
import { Field, ObjectType } from 'type-graphql'
import { LastReadMessagePivot } from './LastReadMessagePivot'
import { Message } from './Message'
import { PersonalChat } from './PersonalChat'

@Entity()
@ObjectType()
export class PersonalMessage extends Message {
  @ManyToOne(() => PersonalChat)
  @Field(() => PersonalChat)
    personalChat: PersonalChat

  @OneToMany(() => LastReadMessagePivot, pivot => pivot.lastReadMessage)
  @Field(() => LastReadMessagePivot)
    readBy = new Collection<LastReadMessagePivot>(this)
}
