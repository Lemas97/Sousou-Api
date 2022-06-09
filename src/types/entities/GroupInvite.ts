import { Entity, ManyToOne } from '@mikro-orm/core'

import { Field, ObjectType } from 'type-graphql'
import { Group } from './Group'
import { FriendRequest } from './FriendRequest'

@Entity()
@ObjectType()
export class GroupInvite extends FriendRequest {
  @ManyToOne(() => Group)
  @Field(() => Group)
    group: Group
}
