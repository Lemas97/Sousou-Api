import { Field, ObjectType } from 'type-graphql'

import { PersonalMessage } from '../../entities/PersonalMessage'

@ObjectType()
export class PaginatedPersonalMessages {
  @Field(() => [PersonalMessage])
    data: PersonalMessage[]

  @Field()
    total: number
}
