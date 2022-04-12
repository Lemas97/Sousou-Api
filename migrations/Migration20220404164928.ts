import { Migration } from '@mikro-orm/migrations'

export class Migration20220404164928 extends Migration {
  async up (): Promise<void> {
    this.addSql('create table `personal_conversation` (`id` varchar(255) not null) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `personal_conversation` add primary key `personal_conversation_pkey`(`id`);')

    this.addSql('alter table `group` modify `preferences` json not null;')

    this.addSql('alter table `user` modify `preferences` json not null;')

    this.addSql('create table `personal_message` (`id` varchar(255) not null, `text` varchar(255) not null, `created_at` datetime not null, `file` varchar(255) null, `from_id` varchar(255) not null, `conversation_id` varchar(255) not null) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `personal_message` add primary key `personal_message_pkey`(`id`);')
    this.addSql('alter table `personal_message` add index `personal_message_from_id_index`(`from_id`);')
    this.addSql('alter table `personal_message` add unique `personal_message_from_id_unique`(`from_id`);')
    this.addSql('alter table `personal_message` add index `personal_message_conversation_id_index`(`conversation_id`);')

    this.addSql('create table `personal_conversation_users` (`personal_conversation_id` varchar(255) not null, `user_id` varchar(255) not null) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `personal_conversation_users` add index `personal_conversation_users_personal_conversation_id_index`(`personal_conversation_id`);')
    this.addSql('alter table `personal_conversation_users` add index `personal_conversation_users_user_id_index`(`user_id`);')
    this.addSql('alter table `personal_conversation_users` add primary key `personal_conversation_users_pkey`(`personal_conversation_id`, `user_id`);')

    this.addSql('alter table `personal_message` add constraint `personal_message_from_id_foreign` foreign key (`from_id`) references `user` (`id`) on update cascade;')
    this.addSql('alter table `personal_message` add constraint `personal_message_conversation_id_foreign` foreign key (`conversation_id`) references `personal_conversation` (`id`) on update cascade;')

    this.addSql('alter table `personal_conversation_users` add constraint `personal_conversation_users_personal_conversation_id_foreign` foreign key (`personal_conversation_id`) references `personal_conversation` (`id`) on update cascade on delete cascade;')
    this.addSql('alter table `personal_conversation_users` add constraint `personal_conversation_users_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;')
  }
}
