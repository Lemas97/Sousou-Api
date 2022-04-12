import { Migration } from '@mikro-orm/migrations'

export class Migration20220404183204 extends Migration {
  async up (): Promise<void> {
    this.addSql('create table `personal_chat` (`id` varchar(255) not null) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `personal_chat` add primary key `personal_chat_pkey`(`id`);')

    this.addSql('alter table `group` modify `preferences` json;')

    this.addSql('alter table `user` modify `preferences` json;')

    this.addSql('alter table `personal_message` add `state` enum(\'sended\', \'deleted_for_all\', \'deleted_for_me\') not null;')
    this.addSql('alter table `personal_message` drop foreign key `personal_message_conversation_id_foreign`;')
    this.addSql('alter table `personal_message` drop index `personal_message_conversation_id_index`;')
    this.addSql('alter table `personal_message` add constraint `personal_message_conversation_id_foreign` foreign key (`conversation_id`) references `personal_chat` (`id`) on update cascade;')

    this.addSql('alter table `text_channel_message` add `state` enum(\'sended\', \'deleted_for_all\', \'deleted_for_me\') not null;')

    this.addSql('create table `personal_chat_users` (`personal_chat_id` varchar(255) not null, `user_id` varchar(255) not null) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `personal_chat_users` add index `personal_chat_users_personal_chat_id_index`(`personal_chat_id`);')
    this.addSql('alter table `personal_chat_users` add index `personal_chat_users_user_id_index`(`user_id`);')
    this.addSql('alter table `personal_chat_users` add primary key `personal_chat_users_pkey`(`personal_chat_id`, `user_id`);')

    this.addSql('alter table `personal_chat_users` add constraint `personal_chat_users_personal_chat_id_foreign` foreign key (`personal_chat_id`) references `personal_chat` (`id`) on update cascade on delete cascade;')
    this.addSql('alter table `personal_chat_users` add constraint `personal_chat_users_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;')

    this.addSql('alter table `personal_message` drop index `personal_message_from_id_unique`;')

    this.addSql('alter table `text_channel_message` drop index `text_channel_message_from_user_id_index`;')

    this.addSql('drop table if exists `personal_conversation`;')

    this.addSql('drop table if exists `personal_conversation_users`;')
  }
}
