import { Field, ObjectType } from 'type-graphql'
import { TextChannelMessage } from '../../entities/TextChannelMessage'

@ObjectType()
export class PaginatedTextChannelMessages {
  @Field(() => [TextChannelMessage])
    data: TextChannelMessage[]

  @Field()
    total: number
}
