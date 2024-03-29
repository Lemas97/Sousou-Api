import { Group } from '../../entities/Group'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class GroupSubscription {
  @Field(() => Group)
    group: Group

  @Field()
    event: string
}
