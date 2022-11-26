import { Migration } from '@mikro-orm/migrations';

export class Migration20221126004833 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `personal_chat_users` (`personal_chat_id` varchar(255) not null, `personal_chat_users_pivot_personal_chat_id` varchar(255) not null, primary key (`personal_chat_id`, `personal_chat_users_pivot_personal_chat_id`)) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `personal_chat_users` add index `personal_chat_users_personal_chat_id_index`(`personal_chat_id`);');
    this.addSql('alter table `personal_chat_users` add index `personal_chat_users_personal_chat_users_pivot_perso_2829f_index`(`personal_chat_users_pivot_personal_chat_id`);');

    this.addSql('alter table `personal_chat_users` add constraint `personal_chat_users_personal_chat_id_foreign` foreign key (`personal_chat_id`) references `personal_chat` (`id`) on update cascade on delete cascade;');
    this.addSql('alter table `personal_chat_users` add constraint `personal_chat_users_personal_chat_users_pivot_per_6e690_foreign` foreign key (`personal_chat_users_pivot_personal_chat_id`) references `personal_chat_users_pivot` (`personal_chat_id`) on update cascade on delete cascade;');

    this.addSql('alter table `personal_chat_users_pivot` drop `users`;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists `personal_chat_users`;');

    this.addSql('alter table `personal_chat_users_pivot` add `users` varchar(255) not null;');
  }

}
