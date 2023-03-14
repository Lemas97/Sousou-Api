import { Entity, ManyToOne } from '@mikro-orm/core'
import { Field, ObjectType } from 'type-graphql'
import { PersonalChat } from './PersonalChat'
import { PersonalMessage } from './PersonalMessage'
import { User } from './User'

@Entity({ tableName: 'personal_chat_users_pivot_users' })
@ObjectType()
export class PersonalChatUserPivot {
  @ManyToOne({ entity: () => User, primary: true })
  @Field(() => User)
    user: User

  @ManyToOne({ entity: () => PersonalChat, primary: true })
  @Field(() => PersonalChat)
    personalChat: PersonalChat

  @ManyToOne(() => PersonalMessage, { nullable: true })
  @Field(() => PersonalMessage)
    lastReadMessage: PersonalMessage
}
