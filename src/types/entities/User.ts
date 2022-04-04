import {
  Collection,
  Embedded,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Unique
} from '@mikro-orm/core'

import { GraphQLJSONObject } from 'graphql-type-json'
import { Field, ObjectType } from 'type-graphql'
import { v4 } from 'uuid'

import { UserPreferences } from '../embeddables/UserPreferences'

import { FriendRequest } from './FriendRequest'
import { Group } from './Group'
import { PersonalChat } from './PersonalChat'
import { VoiceChannel } from './VoiceChannel'

@Entity()
@ObjectType()
export class User {
  @PrimaryKey()
  @Field()
    id: string = v4()

  @Property()
  @Unique()
  @Field()
    username: string

  @Property()
  @Field()
    displayName: string

  @Property()
  @Unique()
  @Field()
    email: string

  @Property()
  @Field()
    code: string

  @Property()
    password: string

  @Property()
  @Field()
    icon: string

  @Property()
  @Field()
    createdAt: Date = new Date()

  @Embedded({ entity: () => UserPreferences, object: true })
  @Field(() => GraphQLJSONObject)
    preferences: UserPreferences

  @ManyToOne(() => VoiceChannel, { nullable: true })
  @Field(() => VoiceChannel, { nullable: true })
    connectedVoiceChannel?: VoiceChannel

  @ManyToMany(() => Group)
  @Field(() => [Group])
    groups = new Collection<Group>(this)

  @OneToMany(() => Group, ownedGroup => ownedGroup.owner)
  @Field(() => [Group])
    ownedGroups = new Collection<Group>(this)

  @OneToMany(() => FriendRequest, friendRequest => friendRequest.toUser)
  @Field(() => [FriendRequest])
    friendRequests = new Collection<FriendRequest>(this)

  @OneToMany(() => FriendRequest, myFriendRequest => myFriendRequest.fromUser)
  @Field(() => [FriendRequest])
    myFriendRequests = new Collection<FriendRequest>(this)

  @ManyToMany(() => User)
  @Field(() => [User])
    friendList = new Collection<User>(this)

  @ManyToMany(() => PersonalChat, personalConversation => personalConversation.users)
  @Field(() => [PersonalChat])
    personalConversations = new Collection<PersonalChat>(this)
}
