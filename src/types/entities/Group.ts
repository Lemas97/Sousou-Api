import {
  Collection,
  Embedded,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property
} from '@mikro-orm/core'

import { GraphQLJSONObject } from 'graphql-type-json'
import { Field, ObjectType } from 'type-graphql'

import { v4 } from 'uuid'

import { GroupPreferences } from '../embeddables/GroupPreferences'
import { TextChannel } from './TextChannel'
import { User } from './User'
import { VoiceChannel } from './VoiceChannel'

@Entity()
@ObjectType()
export class Group {
  @PrimaryKey()
  @Field()
    id: string = v4()

  @Property()
  @Field()
    name: string

  @ManyToMany(() => User)
  @Field(() => [User])
    invitationPermissionUsers = new Collection<User>(this)

  @Property()
  @Field()
    icon: string

  @Property()
  @Field()
    color: string

  @Property()
  @Field()
    createdAt: Date

  @Embedded(() => GroupPreferences, { object: true })
  @Field(() => GraphQLJSONObject)
    preferences: GroupPreferences

  @ManyToOne(() => User)
  @Field(() => User)
    owner: User

  @ManyToMany(() => User)
  @Field(() => [User])
    members = new Collection<User>(this)

  @OneToMany(() => TextChannel, textChannel => textChannel.group)
  @Field(() => [TextChannel])
    textChannels = new Collection<TextChannel>(this)

  @OneToMany(() => VoiceChannel, voiceChannel => voiceChannel.group)
  @Field(() => [VoiceChannel])
    voiceChannels = new Collection<VoiceChannel>(this)
}
