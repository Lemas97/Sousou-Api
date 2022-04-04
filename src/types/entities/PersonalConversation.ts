import { Collection, Entity, ManyToMany, OneToMany, PrimaryKey } from '@mikro-orm/core'
import { Field, ObjectType } from 'type-graphql'
import { v4 } from 'uuid'

import { PersonalMessage } from './PersonalMessage'
import { User } from './User'

@Entity()
@ObjectType()
export class PersonalConversation {
  @PrimaryKey()
  @Field()
    id: string = v4()

  @ManyToMany(() => User)
  @Field(() => [User])
    users = new Collection<User>(this)

  @OneToMany(() => PersonalMessage, message => message.conversation)
  @Field(() => [PersonalMessage])
    messages = new Collection<PersonalMessage>(this)
}
