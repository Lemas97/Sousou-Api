import { Collection, Entity, OneToMany, OneToOne, PrimaryKey } from '@mikro-orm/core'
import { Field, ObjectType } from 'type-graphql'
import { v4 } from 'uuid'
import { PersonalChatUsersPivot } from './PersonalChatUserPivot'

import { PersonalMessage } from './PersonalMessage'

@Entity()
@ObjectType()
export class PersonalChat {
  @PrimaryKey()
  @Field()
    id: string = v4()

  @OneToOne({ entity: () => PersonalChatUsersPivot, nullable: true })
  @Field(() => PersonalChatUsersPivot, { nullable: true })
    pivot?: PersonalChatUsersPivot

  @OneToMany(() => PersonalMessage, message => message.personalChat)
  @Field(() => [PersonalMessage])
    messages = new Collection<PersonalMessage>(this)

  // @Field(() => Number, { nullable: true })
  // unreadMessages (
  //   @Ctx('ctx') ctx: AuthCustomContext
  // ): number | undefined {
  //   if (this.id !== ctx.user.id) {
  //     return undefined
  //   }
  //   const index = this.messages.getItems().findIndex(msg => msg.readBy.getItems().map(user => user.id).includes(ctx.user.id))
  //   return index + 1
  // }
}
