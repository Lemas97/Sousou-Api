import { Migration } from '@mikro-orm/migrations'

export class Migration20230127221227 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table `text_channel_user_pivot` drop foreign key `text_channel_user_pivot_last_read_message_id_foreign`;')

    this.addSql('alter table `text_channel_user_pivot` modify `last_read_message_id` varchar(255) null;')
    this.addSql('alter table `text_channel_user_pivot` add constraint `text_channel_user_pivot_last_read_message_id_foreign` foreign key (`last_read_message_id`) references `text_channel_message` (`id`) on update cascade on delete set null;')
  }

  async down (): Promise<void> {
    this.addSql('alter table `text_channel_user_pivot` drop foreign key `text_channel_user_pivot_last_read_message_id_foreign`;')

    this.addSql('alter table `text_channel_user_pivot` modify `last_read_message_id` varchar(255) not null;')
    this.addSql('alter table `text_channel_user_pivot` add constraint `text_channel_user_pivot_last_read_message_id_foreign` foreign key (`last_read_message_id`) references `text_channel_message` (`id`) on update cascade on delete no action;')
  }
}
