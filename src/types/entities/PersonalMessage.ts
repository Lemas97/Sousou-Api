import { Entity, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Field, ObjectType } from 'type-graphql'
import { v4 } from 'uuid'
import { PersonalConversation } from './PersonalConversation'
import { User } from './User'

@Entity()
@ObjectType()
export class PersonalMessage {
  @PrimaryKey()
  @Field()
    id: string = v4()

  @Property()
  @Field()
    text: string

  @Property()
  @Field()
    createdAt: Date = new Date()

  @Property({ nullable: true })
  @Field({ nullable: true })
    file?: string

  @OneToOne(() => User)
  @Field(() => User)
    from: User

  @ManyToOne(() => PersonalConversation)
  @Field(() => PersonalConversation)
    conversation: PersonalConversation
}
