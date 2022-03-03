import { Embeddable, Property } from '@mikro-orm/core'

@Embeddable()
export class UserPreferences {
  @Property()
    inputVolume = 100

  @Property()
    masterOutputVolume = 100

  @Property()
    muteInput = false

  @Property()
    muteOutput = false
}
