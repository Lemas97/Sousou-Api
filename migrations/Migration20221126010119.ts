import { Migration } from '@mikro-orm/migrations';

export class Migration20221126010119 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `personal_chat_users_pivot` drop index `personal_chat_users_pivot_personal_chat_id_index`;');
    this.addSql('alter table `personal_chat_users_pivot` drop primary key;');
    this.addSql('alter table `personal_chat_users_pivot` change `personal_chat_id` `id` varchar(255) not null;');
    this.addSql('alter table `personal_chat_users_pivot` add primary key `personal_chat_users_pivot_pkey`(`id`);');

    this.addSql('alter table `personal_chat` add constraint `personal_chat_pivot_id_foreign` foreign key (`pivot_id`) references `personal_chat_users_pivot` (`id`) on update cascade on delete set null;');
    this.addSql('alter table `personal_chat` add unique `personal_chat_pivot_id_unique`(`pivot_id`);');

    this.addSql('alter table `personal_chat_users_pivot_users` drop index `personal_chat_users_pivot_users_personal_chat_users_45449_index`;');
    this.addSql('alter table `personal_chat_users_pivot_users` drop primary key;');
    this.addSql('alter table `personal_chat_users_pivot_users` change `personal_chat_users_pivot_personal_chat_id` `personal_chat_users_pivot_id` varchar(255) not null;');
    this.addSql('alter table `personal_chat_users_pivot_users` add constraint `personal_chat_users_pivot_users_personal_chat_use_3478e_foreign` foreign key (`personal_chat_users_pivot_id`) references `personal_chat_users_pivot` (`id`) on update cascade on delete cascade;');
    this.addSql('alter table `personal_chat_users_pivot_users` add index `personal_chat_users_pivot_users_personal_chat_users_1b62c_index`(`personal_chat_users_pivot_id`);');
    this.addSql('alter table `personal_chat_users_pivot_users` add primary key `personal_chat_users_pivot_users_pkey`(`personal_chat_users_pivot_id`, `user_id`);');
  }

  async down(): Promise<void> {
    this.addSql('alter table `personal_chat` drop foreign key `personal_chat_pivot_id_foreign`;');

    this.addSql('alter table `personal_chat_users_pivot_users` drop foreign key `personal_chat_users_pivot_users_personal_chat_use_3478e_foreign`;');

    this.addSql('alter table `personal_chat` drop index `personal_chat_pivot_id_unique`;');

    this.addSql('alter table `personal_chat_users_pivot` drop primary key;');
    this.addSql('alter table `personal_chat_users_pivot` change `id` `personal_chat_id` varchar(255) not null;');
    this.addSql('alter table `personal_chat_users_pivot` add index `personal_chat_users_pivot_personal_chat_id_index`(`personal_chat_id`);');
    this.addSql('alter table `personal_chat_users_pivot` add primary key `personal_chat_users_pivot_pkey`(`personal_chat_id`);');

    this.addSql('alter table `personal_chat_users_pivot_users` drop index `personal_chat_users_pivot_users_personal_chat_users_1b62c_index`;');
    this.addSql('alter table `personal_chat_users_pivot_users` drop primary key;');
    this.addSql('alter table `personal_chat_users_pivot_users` change `personal_chat_users_pivot_id` `personal_chat_users_pivot_personal_chat_id` varchar(255) not null;');
    this.addSql('alter table `personal_chat_users_pivot_users` add index `personal_chat_users_pivot_users_personal_chat_users_45449_index`(`personal_chat_users_pivot_personal_chat_id`);');
    this.addSql('alter table `personal_chat_users_pivot_users` add primary key `personal_chat_users_pivot_users_pkey`(`personal_chat_users_pivot_personal_chat_id`, `user_id`);');
  }

}
