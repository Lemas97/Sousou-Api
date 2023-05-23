import { Embeddable, Property } from '@mikro-orm/core'
import { Field } from 'type-graphql'

@Embeddable()
export class CallMetadata {
  @Property({ nullable: true })
  @Field({ nullable: true })
    answer?: boolean

  @Property({ nullable: true })
  @Field({ nullable: true })
    startTimestamp?: Date

  @Property({ nullable: true })
  @Field({ nullable: true })
    endTimestamp?: Date

  @Property({ nullable: true })
  @Field({ nullable: true })
    endCallingTimestamp?: Date
}
