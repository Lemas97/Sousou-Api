import { MikroORM } from '@mikro-orm/mariadb'
import { Migration } from '@mikro-orm/migrations'
import { Group } from '../src/types/entities/Group'
import { TextChannel } from '../src/types/entities/TextChannel'

export class Migration20230313194025 extends Migration {
  async up (): Promise<void> {
    const connection = await MikroORM.init()

    const em = connection.em.fork()

    const groups = await em.find(Group, {}, { populate: ['owner'] })

    for (const group of groups) {
      const textChannels = await em.find(TextChannel, { group }, { populate: ['users'] })
      for (const textChannel of textChannels) {
        if (!textChannel.users.getItems().find(user => user.id === group.owner.id)) {
          textChannel.users.add(group.owner)
        }
      }
    }

    await em.flush()
  }
}
