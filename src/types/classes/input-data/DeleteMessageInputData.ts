import { Field, InputType } from 'type-graphql'

@InputType()
export class DeleteMessageInputData {
  @Field()
    deleteForAll: boolean
}
