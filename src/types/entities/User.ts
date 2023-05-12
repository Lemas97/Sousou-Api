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
import { Arg, Ctx, Field, ObjectType } from 'type-graphql'
import { v4 } from 'uuid'

import { UserPreferences } from '../embeddables/UserPreferences'
import { AuthCustomContext } from '../interfaces/CustomContext'

import { FriendRequest } from './FriendRequest'
import { Group } from './Group'
import { GroupInvite } from './GroupInvite'
import { PersonalChatUserPivot } from './LastReadMessagePivot'
import { PersonalChat } from './PersonalChat'
import { VoiceChannel } from './VoiceChannel'

@Entity()
@Unique({ properties: ['username', 'code'] })
@ObjectType()
export class User {
  @PrimaryKey()
  @Field()
    id: string = v4()

  @Property()
  @Field()
    username: string

  @Property()
  @Field()
    displayName: string

  @Property({ unique: true })
  @Field()
    email: string

  @Property()
  @Field()
    code: string

  @Property({ hidden: true })
  @Field()
    password: string

  @Property()
  @Field()
    icon: string

  @Property()
  @Field()
    createdAt: Date

  @Property()
  @Field()
    confirmEmailToken: string

  @Property({ nullable: true })
  @Field()
    resetPasswordToken?: string

  @Property({ type: Boolean })
  @Field(() => Boolean)
    emailConfirm: boolean

  @Property({ type: 'text', nullable: true })
  @Field({ nullable: true })
    jwtToken?: string

  @Property({ type: Boolean })
  @Field(() => Boolean)
    isLoggedIn: boolean

  @Property({ type: Date, nullable: true })
  @Field(() => Date, { nullable: true })
    lastLoggedInDate?: Date

  @Embedded({ entity: () => UserPreferences, object: true })
  @Field(() => GraphQLJSONObject)
    preferences: UserPreferences

  @ManyToOne(() => VoiceChannel, { nullable: true })
  @Field(() => VoiceChannel, { nullable: true })
    connectedVoiceChannel?: VoiceChannel

  @ManyToMany(() => Group, 'members')
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

  @OneToMany(() => GroupInvite, group => group.toUser)
  @Field(() => [GroupInvite])
    groupInvites = new Collection<GroupInvite>(this)

  @OneToMany(() => GroupInvite, group => group.fromUser)
  @Field(() => [GroupInvite])
    myGroupInvites = new Collection<GroupInvite>(this)

  @ManyToMany({ entity: () => PersonalChat, mappedBy: 'users', pivotEntity: () => PersonalChatUserPivot })
  @Field(() => [PersonalChat])
    personalChats = new Collection<PersonalChat>(this)

  @Field(() => String, { nullable: true })
  pending (
    @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('groupId', { nullable: true }) groupId?: string
  ): string | null {
    if (groupId) {
      const inviteIndex = this.groupInvites.getItems().findIndex(grI => grI.group.id === groupId)
      return inviteIndex >= 0 ? this.groupInvites.getItems()[inviteIndex].id : null
    } else {
      const friendRequest = this.friendRequests.getItems().filter(frR => frR.fromUser.id === ctx.user.id && frR.answer === null && frR.canceled === null)
      if (friendRequest.length) {
        return friendRequest[0].id
      }
      return null
    }
  }

  @Property({ persist: false })
  @Field()
    lastReadMessage: string
}
