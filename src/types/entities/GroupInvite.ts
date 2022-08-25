import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'

import { Field, ObjectType } from 'type-graphql'
import { v4 } from 'uuid'
import { Group } from './Group'
import { User } from './User'

@Entity()
@ObjectType()
export class GroupInvite {
  @PrimaryKey()
  @Field()
    id: string = v4()

  @Property()
  @Field()
    message: string

  @Property()
  @Field()
    createdAt: Date

  @Property({ nullable: true })
  @Field({ nullable: true })
    updatedAt?: Date

  @Property({ nullable: true })
  @Field({ nullable: true })
    answer?: boolean

  @Property({ nullable: true })
  @Field({ nullable: true })
    canceled?: boolean

  @ManyToOne(() => User)
  @Field(() => User)
    fromUser: User

  @ManyToOne(() => User)
  @Field(() => User)
    toUser: User

  @ManyToOne(() => Group)
  @Field(() => Group)
    group: Group
}
