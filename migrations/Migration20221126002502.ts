import { Migration } from '@mikro-orm/migrations';

export class Migration20221126002502 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `personal_chat_users_pivot` drop foreign key `personal_chat_users_pivot_last_read_message_id_foreign`;');

    this.addSql('alter table `personal_chat_users_pivot` modify `last_read_message_id` varchar(255) null;');
    this.addSql('alter table `personal_chat_users_pivot` add constraint `personal_chat_users_pivot_last_read_message_id_foreign` foreign key (`last_read_message_id`) references `personal_message` (`id`) on update cascade on delete set null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `personal_chat_users_pivot` drop foreign key `personal_chat_users_pivot_last_read_message_id_foreign`;');

    this.addSql('alter table `personal_chat_users_pivot` modify `last_read_message_id` varchar(255) not null;');
    this.addSql('alter table `personal_chat_users_pivot` add constraint `personal_chat_users_pivot_last_read_message_id_foreign` foreign key (`last_read_message_id`) references `personal_message` (`id`) on update cascade on delete no action;');
  }

}
