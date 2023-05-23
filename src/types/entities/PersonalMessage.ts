import { Collection, Embedded, Entity, ManyToOne, OneToMany, Property } from '@mikro-orm/core'
import { GraphQLJSONObject } from 'graphql-type-json'
import { Field, ObjectType } from 'type-graphql'
import { CallMetadata } from '../embeddables/CallMetadata'
import { PersonalChatUserPivot } from './LastReadMessagePivot'
import { Message } from './Message'
import { PersonalChat } from './PersonalChat'

@Entity()
@ObjectType()
export class PersonalMessage extends Message {
  @ManyToOne(() => PersonalChat)
  @Field(() => PersonalChat)
    personalChat: PersonalChat

  @OneToMany(() => PersonalChatUserPivot, pivot => pivot.lastReadMessage)
  @Field(() => PersonalChatUserPivot)
    readBy = new Collection<PersonalChatUserPivot>(this)

  @Property({ default: false })
  @Field()
    isCall: boolean

  @Embedded(() => CallMetadata, { nullable: true })
  @Field(() => GraphQLJSONObject, { nullable: true })
    callData?: CallMetadata
}
