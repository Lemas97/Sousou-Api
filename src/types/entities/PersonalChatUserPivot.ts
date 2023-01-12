import { Collection, Entity, ManyToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { ObjectType, Field } from 'type-graphql'
import { v4 } from 'uuid'
import { LastReadMessagePivot } from './LastReadMessagePivot'
import { PersonalChat } from './PersonalChat'
import { User } from './User'

@Entity()
@ObjectType()
export class PersonalChatUsersPivot {
  @PrimaryKey()
  @Field()
    id: string = v4()

  @OneToOne({ entity: () => PersonalChat, mappedBy: 'pivot' })
  @Field(() => PersonalChat)
    personalChat: PersonalChat

  @ManyToMany({ entity: () => User, pivotEntity: () => LastReadMessagePivot })
  @Field(() => [User])
    users = new Collection<User>(this)

  @Property()
  @Field()
    mute: boolean
}
