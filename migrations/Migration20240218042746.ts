import { MikroORM } from '@mikro-orm/mariadb'
import { Migration } from '@mikro-orm/migrations'
import { Group } from '../src/types/entities/Group'
import { TextChannel } from '../src/types/entities/TextChannel'

export class Migration20240218042746 extends Migration {
  async up (): Promise<void> {
    const em = (await MikroORM.init()).em.fork()

    const groups = await em.find(Group, {}, { populate: ['members', 'owner'] })

    for (const group of groups) {
      if (!group.members.getItems().map(m => m.id).includes(group.owner.id)) {
        group.members.add(group.owner)
      }
      const textChannels = await em.find(TextChannel, {}, { populate: ['users'] })
      for (const textChannel of textChannels) {
        textChannel.users.removeAll()
        for (const member of group.members.getItems()) {
          textChannel.users.add(member)
        }
      }
      await em.flush()
    }
  }
}
