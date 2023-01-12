import { Migration } from '@mikro-orm/migrations'

export class Migration20230112201243 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table `personal_chat_users_pivot` drop foreign key `personal_chat_users_pivot_last_read_message_id_foreign`;')

    this.addSql('alter table `personal_chat_users_pivot_users` drop foreign key `personal_chat_users_pivot_users_personal_chat_use_3478e_foreign`;')
    this.addSql('alter table `personal_chat_users_pivot_users` drop foreign key `personal_chat_users_pivot_users_user_id_foreign`;')

    this.addSql('alter table `personal_chat_users_pivot` drop index `personal_chat_users_pivot_last_read_message_id_index`;')
    this.addSql('alter table `personal_chat_users_pivot` drop `last_read_message_id`;')

    this.addSql('alter table `personal_chat_users_pivot_users` add `last_read_message_id` varchar(255) not null;')
    this.addSql('alter table `personal_chat_users_pivot_users` drop index `personal_chat_users_pivot_users_personal_chat_users_1b62c_index`;')
    this.addSql('alter table `personal_chat_users_pivot_users` drop primary key;')
    this.addSql('alter table `personal_chat_users_pivot_users` add constraint `personal_chat_users_pivot_users_last_read_message_id_foreign` foreign key (`last_read_message_id`) references `personal_message` (`id`) on update cascade;')
    this.addSql('alter table `personal_chat_users_pivot_users` change `personal_chat_users_pivot_id` `personal_chat_id` varchar(255) not null;')
    this.addSql('alter table `personal_chat_users_pivot_users` add constraint `personal_chat_users_pivot_users_personal_chat_id_foreign` foreign key (`personal_chat_id`) references `personal_chat_users_pivot` (`id`) on update cascade;')
    this.addSql('alter table `personal_chat_users_pivot_users` add constraint `personal_chat_users_pivot_users_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade;')
    this.addSql('alter table `personal_chat_users_pivot_users` add index `personal_chat_users_pivot_users_personal_chat_id_index`(`personal_chat_id`);')
    this.addSql('alter table `personal_chat_users_pivot_users` add index `personal_chat_users_pivot_users_last_read_message_id_index`(`last_read_message_id`);')
    this.addSql('alter table `personal_chat_users_pivot_users` add primary key `personal_chat_users_pivot_users_pkey`(`personal_chat_id`, `user_id`);')
  }

  async down (): Promise<void> {
    this.addSql('alter table `personal_chat_users_pivot_users` drop foreign key `personal_chat_users_pivot_users_personal_chat_id_foreign`;')
    this.addSql('alter table `personal_chat_users_pivot_users` drop foreign key `personal_chat_users_pivot_users_last_read_message_id_foreign`;')
    this.addSql('alter table `personal_chat_users_pivot_users` drop foreign key `personal_chat_users_pivot_users_user_id_foreign`;')

    this.addSql('alter table `personal_chat_users_pivot` add `last_read_message_id` varchar(255) null;')
    this.addSql('alter table `personal_chat_users_pivot` add constraint `personal_chat_users_pivot_last_read_message_id_foreign` foreign key (`last_read_message_id`) references `personal_message` (`id`) on update cascade on delete set null;')
    this.addSql('alter table `personal_chat_users_pivot` add index `personal_chat_users_pivot_last_read_message_id_index`(`last_read_message_id`);')

    this.addSql('alter table `personal_chat_users_pivot_users` add `personal_chat_users_pivot_id` varchar(255) not null;')
    this.addSql('alter table `personal_chat_users_pivot_users` drop index `personal_chat_users_pivot_users_personal_chat_id_index`;')
    this.addSql('alter table `personal_chat_users_pivot_users` drop index `personal_chat_users_pivot_users_last_read_message_id_index`;')
    this.addSql('alter table `personal_chat_users_pivot_users` drop primary key;')
    this.addSql('alter table `personal_chat_users_pivot_users` add constraint `personal_chat_users_pivot_users_personal_chat_use_3478e_foreign` foreign key (`personal_chat_users_pivot_id`) references `personal_chat_users_pivot` (`id`) on update cascade on delete cascade;')
    this.addSql('alter table `personal_chat_users_pivot_users` drop `personal_chat_id`;')
    this.addSql('alter table `personal_chat_users_pivot_users` drop `last_read_message_id`;')
    this.addSql('alter table `personal_chat_users_pivot_users` add constraint `personal_chat_users_pivot_users_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;')
    this.addSql('alter table `personal_chat_users_pivot_users` add index `personal_chat_users_pivot_users_personal_chat_users_1b62c_index`(`personal_chat_users_pivot_id`);')
    this.addSql('alter table `personal_chat_users_pivot_users` add primary key `personal_chat_users_pivot_users_pkey`(`personal_chat_users_pivot_id`, `user_id`);')
  }
}
