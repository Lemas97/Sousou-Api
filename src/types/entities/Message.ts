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
    createdAt: Date

  @Property()
  @Field()
    text: string

  @ManyToOne(() => User)
  @Field(() => User)
    fromUser: User

  @ManyToMany(() => User)
  @Field(() => [User])
    readBy = new Collection<User>(this)

  @ManyToOne(() => TextChannel)
  @Field(() => TextChannel)
    textChannel: TextChannel
}
