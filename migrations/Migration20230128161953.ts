import { Migration } from '@mikro-orm/migrations'

export class Migration20230128161953 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table `personal_chat_users_pivot` modify `mute` tinyint(1) not null default false;')

    this.addSql('alter table `user` add `last_logged_in_date` datetime null;')

    this.addSql('alter table `text_channel_user_pivot` modify `mute` tinyint(1) not null default false;')
  }

  async down (): Promise<void> {
    this.addSql('alter table `personal_chat_users_pivot` modify `mute` tinyint(1) not null;')

    this.addSql('alter table `text_channel_user_pivot` modify `mute` tinyint(1) not null;')

    this.addSql('alter table `user` drop `last_logged_in_date`;')
  }
}
