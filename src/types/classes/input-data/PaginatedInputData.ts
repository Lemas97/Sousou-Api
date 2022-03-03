import { Field, InputType } from 'type-graphql'

@InputType()
export class PaginatedInputData {
  @Field()
    page: number

  @Field()
    limit: number

  @Field({ nullable: true })
    filter?: string
}
