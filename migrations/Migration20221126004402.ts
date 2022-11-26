import { Migration } from '@mikro-orm/migrations'

export class Migration20221126004402 extends Migration {
  async up (): Promise<void> {
    this.addSql('create table `personal_chat_users_pivot_users` (`personal_chat_users_pivot_personal_chat_id` varchar(255) not null, `user_id` varchar(255) not null, primary key (`personal_chat_users_pivot_personal_chat_id`, `user_id`)) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `personal_chat_users_pivot_users` add index `personal_chat_users_pivot_users_personal_chat_users_45449_index`(`personal_chat_users_pivot_personal_chat_id`);')
    this.addSql('alter table `personal_chat_users_pivot_users` add index `personal_chat_users_pivot_users_user_id_index`(`user_id`);')

    this.addSql('alter table `personal_chat_users_pivot_users` add constraint `personal_chat_users_pivot_users_personal_chat_use_af7cb_foreign` foreign key (`personal_chat_users_pivot_personal_chat_id`) references `personal_chat_users_pivot` (`personal_chat_id`) on update cascade on delete cascade;')
    this.addSql('alter table `personal_chat_users_pivot_users` add constraint `personal_chat_users_pivot_users_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;')

    this.addSql('alter table `personal_chat_users_pivot` drop foreign key `personal_chat_users_pivot_user_id_foreign`;')
    this.addSql('alter table `personal_chat_users_pivot` drop foreign key `personal_chat_users_pivot_personal_chat_id_foreign`;')

    this.addSql('alter table `personal_chat_users_pivot` drop index `personal_chat_users_pivot_user_id_index`;')
    this.addSql('alter table `personal_chat_users_pivot` drop primary key;')
    this.addSql('alter table `personal_chat_users_pivot` change `user_id` `users` varchar(255) not null;')
    this.addSql('alter table `personal_chat_users_pivot` add constraint `personal_chat_users_pivot_personal_chat_id_foreign` foreign key (`personal_chat_id`) references `personal_chat` (`id`) on update cascade on delete cascade;')
    this.addSql('alter table `personal_chat_users_pivot` add primary key `personal_chat_users_pivot_pkey`(`personal_chat_id`);')
  }

  async down (): Promise<void> {
    this.addSql('drop table if exists `personal_chat_users_pivot_users`;')

    this.addSql('alter table `personal_chat_users_pivot` drop foreign key `personal_chat_users_pivot_personal_chat_id_foreign`;')

    this.addSql('alter table `personal_chat_users_pivot` drop primary key;')
    this.addSql('alter table `personal_chat_users_pivot` change `users` `user_id` varchar(255) not null;')
    this.addSql('alter table `personal_chat_users_pivot` add constraint `personal_chat_users_pivot_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete no action;')
    this.addSql('alter table `personal_chat_users_pivot` add constraint `personal_chat_users_pivot_personal_chat_id_foreign` foreign key (`personal_chat_id`) references `personal_chat` (`id`) on update cascade on delete no action;')
    this.addSql('alter table `personal_chat_users_pivot` add index `personal_chat_users_pivot_user_id_index`(`user_id`);')
    this.addSql('alter table `personal_chat_users_pivot` add primary key `personal_chat_users_pivot_pkey`(`personal_chat_id`, `user_id`);')
  }
}
