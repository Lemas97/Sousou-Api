import { Collection, Entity, ManyToMany, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { ObjectType, Field } from 'type-graphql'
import { v4 } from 'uuid'
import { PersonalChat } from './PersonalChat'
import { PersonalMessage } from './PersonalMessage'
import { User } from './User'

@Entity()
@ObjectType()
export class PersonalChatUsersPivot {
  @PrimaryKey()
  @Field()
    id: string = v4()

  @OneToOne(() => PersonalChat, 'pivot')
  @Field(() => PersonalChat)
    personalChat: PersonalChat

  @ManyToMany(() => User)
  @Field(() => [User])
    users = new Collection<User>(this)

  @ManyToOne(() => PersonalMessage, { nullable: true })
  @Field(() => PersonalMessage, { nullable: true })
    lastReadMessage?: PersonalMessage

  @Property() // can place properties into pivot
  @Field()
    mute: boolean
}
