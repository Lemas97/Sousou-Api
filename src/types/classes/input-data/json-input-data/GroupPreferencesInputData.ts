import { Field, InputType } from 'type-graphql'

@InputType()
export class GroupPreferencesInputData {
  @Field()
    approveInvites: boolean
}
