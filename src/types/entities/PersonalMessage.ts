import { Entity, ManyToOne } from '@mikro-orm/core'
import { Field, ObjectType } from 'type-graphql'
import { Message } from './Message'
import { PersonalChat } from './PersonalChat'

@Entity()
@ObjectType()
export class PersonalMessage extends Message {
  @ManyToOne(() => PersonalChat)
  @Field(() => PersonalChat)
    personalChat: PersonalChat
}
