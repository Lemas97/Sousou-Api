import { Collection, Entity, ManyToOne } from '@mikro-orm/core'
import { Field, ObjectType } from 'type-graphql'
import { PersonalChatUsersPivot } from './PersonalChatUserPivot'
import { PersonalMessage } from './PersonalMessage'
import { User } from './User'

@Entity({ tableName: 'personal_chat_users_pivot_users' })
@ObjectType()
export class LastReadMessagePivot {
  @ManyToOne({ entity: () => User, primary: true })
  @Field(() => User)
    user: User

  @ManyToOne({ entity: () => PersonalChatUsersPivot, primary: true })
  @Field(() => PersonalChatUsersPivot)
    personalChat: PersonalChatUsersPivot

  @ManyToOne(() => PersonalMessage, { nullable: true })
  @Field(() => PersonalMessage)
    lastReadMessage = new Collection<PersonalMessage>(this)
}
