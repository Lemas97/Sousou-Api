import {
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryKey,
  Property
} from '@mikro-orm/core'
import { Field, ObjectType } from 'type-graphql'
import { v4 } from 'uuid'
import { TextChannel } from './TextChannel'
import { User } from './User'

@Entity()
@ObjectType()
export class Message {
  @PrimaryKey()
  @Field()
    id: string = v4()

  @Property()
  @Field()
    createdAt = new Date()

  @Property()
  @Field()
    text: string

  @Property({ nullable: true })
  @Field({ nullable: true })
    deleteForAll?: boolean

  // todo
  // @Enum(() => MessageStateType)
  // @Field(() => MessageStateType)
  //   state: MessageStateType

  @ManyToOne(() => User)
  @Field(() => User)
    fromUser: User

  @ManyToMany(() => User)
  @Field(() => [User])
    readBy = new Collection<User>(this)

  @ManyToOne(() => TextChannel)
  @Field(() => TextChannel)
    textChannel: TextChannel

  @ManyToMany(() => User)
  @Field(() => [User])
    deletedFromUsers = new Collection<User>(this)
}
