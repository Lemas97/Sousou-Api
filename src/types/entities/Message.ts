import {
  Collection,
  Enum,
  ManyToMany,
  ManyToOne,
  PrimaryKey,
  Property
} from '@mikro-orm/core'
import { Field, ObjectType } from 'type-graphql'
import { v4 } from 'uuid'
import { MessageStateType } from '../enums/MessageStateType'
import { User } from './User'

@ObjectType()
export class Message {
  @PrimaryKey()
  @Field()
    id: string = v4()

  @Property()
  @Field()
    createdAt: Date = new Date()

  @Property()
  @Field()
    text: string

  @Property({ nullable: true })
  @Field({ nullable: true })
    deleteForAll?: boolean

  @Enum(() => MessageStateType)
  @Field(() => MessageStateType)
    state: MessageStateType

  @Property({ nullable: true })
  @Field({ nullable: true })
    file?: string

  @ManyToOne(() => User)
  @Field(() => User)
    from: User

  @ManyToMany(() => User)
  @Field(() => [User])
    deletedFromUsers = new Collection<User>(this)
}
