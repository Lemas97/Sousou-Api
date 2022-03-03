import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property
} from '@mikro-orm/core'
import { Field, ObjectType } from 'type-graphql'
import { v4 } from 'uuid'
import { Group } from './Group'

@Entity()
@ObjectType()
export class TextChannel {
  @PrimaryKey()
  @Field()
    id: string = v4()

  @Property()
  @Field()
    name: string

  @Property({ nullable: true })
  @Field({ nullable: true })
    slowMode?: number

  @ManyToOne(() => Group)
  @Field(() => Group)
    group: Group
}
