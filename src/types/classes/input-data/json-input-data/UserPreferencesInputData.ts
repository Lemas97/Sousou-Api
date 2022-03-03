import { Field, InputType } from 'type-graphql'

@InputType()
export class UserPreferencesInputData {
  @Field(() => Number)
    inputVolume = 100

  @Field(() => Number)
    masterOutputVolume = 100

  @Field(() => Boolean)
    muteInput = false

  @Field(() => Boolean)
    muteOutput = false
}
