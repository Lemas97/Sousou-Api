import { Collection, Entity, ManyToMany, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { Field, ObjectType } from 'type-graphql'
import { v4 } from 'uuid'
import { LastReadMessagePivot } from './LastReadMessagePivot'

import { PersonalMessage } from './PersonalMessage'
import { User } from './User'

@Entity()
@ObjectType()
export class PersonalChat {
  @PrimaryKey()
  @Field()
    id: string = v4()

  @ManyToMany({ entity: () => User, pivotEntity: () => LastReadMessagePivot })
  @Field(() => [User])
    users = new Collection<User>(this)

  @Property({ default: false })
  @Field()
    mute: boolean

  @Property({ default: false })
  @Field()
    disabled?: boolean

  @Property({ default: false })
  @Field()
    isGroupPersonalChat?: boolean

  @OneToMany(() => PersonalMessage, message => message.personalChat)
  @Field(() => [PersonalMessage])
    messages = new Collection<PersonalMessage>(this)

  @Property({ persist: false, nullable: true })
    sortMessageValue?: number

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
