import { Embeddable, Property } from '@mikro-orm/core'

@Embeddable()
export class GroupPreferences {
  @Property()
    approveInvites = false
}
