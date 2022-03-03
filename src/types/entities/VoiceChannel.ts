import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property
} from '@mikro-orm/core'
import { Field, ObjectType } from 'type-graphql'
import { v4 } from 'uuid'
import { Group } from './Group'
import { User } from './User'

@Entity()
@ObjectType()
export class VoiceChannel {
  @PrimaryKey()
  @Field()
    id: string = v4()

  @Property()
  @Field()
    name: string

  @Property({ nullable: true })
  @Field({ nullable: true })
    maxUsers?: number

  @ManyToOne(() => Group)
  @Field(() => Group)
    group: Group

  @OneToMany(() => User, user => user.connectedVoiceChannel)
  @Field(() => [User])
    users = new Collection<User>(this)
}
