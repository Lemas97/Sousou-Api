import { Migration } from '@mikro-orm/migrations'

export class Migration20230205184824 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table `personal_chat` drop foreign key `personal_chat_pivot_id_foreign`;')

    this.addSql('alter table `personal_chat_users_pivot_users` drop foreign key `personal_chat_users_pivot_users_personal_chat_id_foreign`;')

    this.addSql('drop table if exists `personal_chat_users_pivot`;')

    this.addSql('alter table `personal_chat` add `mute` tinyint(1) not null default false;')
    this.addSql('alter table `personal_chat` drop index `personal_chat_pivot_id_unique`;')
    this.addSql('alter table `personal_chat` drop `pivot_id`;')

    this.addSql('alter table `personal_chat_users_pivot_users` add constraint `personal_chat_users_pivot_users_personal_chat_id_foreign` foreign key (`personal_chat_id`) references `personal_chat` (`id`) on update cascade;')
  }

  async down (): Promise<void> {
    this.addSql('create table `personal_chat_users_pivot` (`id` varchar(255) not null, `mute` tinyint(1) not null default 0, primary key (`id`)) default character set utf8mb4 engine = InnoDB;')

    this.addSql('alter table `personal_chat_users_pivot_users` drop foreign key `personal_chat_users_pivot_users_personal_chat_id_foreign`;')

    this.addSql('alter table `personal_chat` add `pivot_id` varchar(255) null;')
    this.addSql('alter table `personal_chat` add constraint `personal_chat_pivot_id_foreign` foreign key (`pivot_id`) references `personal_chat_users_pivot` (`id`) on update cascade on delete set null;')
    this.addSql('alter table `personal_chat` drop `mute`;')
    this.addSql('alter table `personal_chat` add unique `personal_chat_pivot_id_unique`(`pivot_id`);')

    this.addSql('alter table `personal_chat_users_pivot_users` add constraint `personal_chat_users_pivot_users_personal_chat_id_foreign` foreign key (`personal_chat_id`) references `personal_chat_users_pivot` (`id`) on update cascade on delete no action;')
  }
}
