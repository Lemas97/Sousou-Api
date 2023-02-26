import { MikroORM } from '@mikro-orm/core';
import { Migration } from '@mikro-orm/migrations';
import { LastReadMessagePivot } from '../src/types/entities/LastReadMessagePivot';
import { PersonalChat } from '../src/types/entities/PersonalChat';
import { PersonalMessage } from '../src/types/entities/PersonalMessage';
import { User } from '../src/types/entities/User';

export class Migration20230226170035 extends Migration {

  async up(): Promise<void> {
    const connection = await MikroORM.init()

    const em = connection.em.fork()

    const users = await em.find(User, {}, { populate: ['friendList'] })


    await em.nativeDelete(PersonalMessage, {})
    await em.nativeDelete(LastReadMessagePivot, {})
    await em.nativeDelete(PersonalChat, {})

    for (const user of users) {
      for (const friend of user.friendList) {
        const personalChatExists = await em.find(PersonalChat, {
          $and: [
            {
              users: user
            },
            {
              users: friend
            }
          ]
        })
        if (personalChatExists.length) continue

        const personalChat = em.create(PersonalChat, {
          mute: false
        })
        em.persist(personalChat)

        personalChat.users.add(user)
        personalChat.users.add(friend)
        await em.flush()
      }
    }
  }

}
