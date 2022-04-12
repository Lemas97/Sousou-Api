import { Migration } from '@mikro-orm/migrations'

export class Migration20220404170143 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table `group` modify `preferences` json;')

    this.addSql('alter table `user` modify `preferences` json;')

    this.addSql('alter table `personal_message` change `from_id` `from_user_id` varchar(255) not null;')

    this.addSql('alter table `personal_message` add `delete_for_all` tinyint(1) null;')
    this.addSql('alter table `personal_message` drop `file`;')

    this.addSql('create table `text_channel_message` (`id` varchar(255) not null, `created_at` datetime not null, `text` varchar(255) not null, `delete_for_all` tinyint(1) null, `from_user_id` varchar(255) not null, `text_channel_id` varchar(255) not null) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `text_channel_message` add primary key `text_channel_message_pkey`(`id`);')
    this.addSql('alter table `text_channel_message` add index `text_channel_message_from_user_id_index`(`from_user_id`);')
    this.addSql('alter table `text_channel_message` add index `text_channel_message_text_channel_id_index`(`text_channel_id`);')

    this.addSql('create table `personal_message_read_by` (`personal_message_id` varchar(255) not null, `user_id` varchar(255) not null) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `personal_message_read_by` add index `personal_message_read_by_personal_message_id_index`(`personal_message_id`);')
    this.addSql('alter table `personal_message_read_by` add index `personal_message_read_by_user_id_index`(`user_id`);')
    this.addSql('alter table `personal_message_read_by` add primary key `personal_message_read_by_pkey`(`personal_message_id`, `user_id`);')

    this.addSql('create table `personal_message_deleted_from_users` (`personal_message_id` varchar(255) not null, `user_id` varchar(255) not null) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `personal_message_deleted_from_users` add index `personal_message_deleted_from_users_personal_message_id_index`(`personal_message_id`);')
    this.addSql('alter table `personal_message_deleted_from_users` add index `personal_message_deleted_from_users_user_id_index`(`user_id`);')
    this.addSql('alter table `personal_message_deleted_from_users` add primary key `personal_message_deleted_from_users_pkey`(`personal_message_id`, `user_id`);')

    this.addSql('create table `text_channel_message_read_by` (`text_channel_message_id` varchar(255) not null, `user_id` varchar(255) not null) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `text_channel_message_read_by` add index `text_channel_message_read_by_text_channel_message_id_index`(`text_channel_message_id`);')
    this.addSql('alter table `text_channel_message_read_by` add index `text_channel_message_read_by_user_id_index`(`user_id`);')
    this.addSql('alter table `text_channel_message_read_by` add primary key `text_channel_message_read_by_pkey`(`text_channel_message_id`, `user_id`);')

    this.addSql('create table `text_channel_message_deleted_from_users` (`text_channel_message_id` varchar(255) not null, `user_id` varchar(255) not null) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `text_channel_message_deleted_from_users` add index `text_channel_message_deleted_from_users_text_channel_220d0_index`(`text_channel_message_id`);')
    this.addSql('alter table `text_channel_message_deleted_from_users` add index `text_channel_message_deleted_from_users_user_id_index`(`user_id`);')
    this.addSql('alter table `text_channel_message_deleted_from_users` add primary key `text_channel_message_deleted_from_users_pkey`(`text_channel_message_id`, `user_id`);')

    this.addSql('alter table `text_channel_message` add constraint `text_channel_message_from_user_id_foreign` foreign key (`from_user_id`) references `user` (`id`) on update cascade;')
    this.addSql('alter table `text_channel_message` add constraint `text_channel_message_text_channel_id_foreign` foreign key (`text_channel_id`) references `text_channel` (`id`) on update cascade;')

    this.addSql('alter table `personal_message_read_by` add constraint `personal_message_read_by_personal_message_id_foreign` foreign key (`personal_message_id`) references `personal_message` (`id`) on update cascade on delete cascade;')
    this.addSql('alter table `personal_message_read_by` add constraint `personal_message_read_by_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;')

    this.addSql('alter table `personal_message_deleted_from_users` add constraint `personal_message_deleted_from_users_personal_message_id_foreign` foreign key (`personal_message_id`) references `personal_message` (`id`) on update cascade on delete cascade;')
    this.addSql('alter table `personal_message_deleted_from_users` add constraint `personal_message_deleted_from_users_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;')

    this.addSql('alter table `text_channel_message_read_by` add constraint `text_channel_message_read_by_text_channel_message_id_foreign` foreign key (`text_channel_message_id`) references `text_channel_message` (`id`) on update cascade on delete cascade;')
    this.addSql('alter table `text_channel_message_read_by` add constraint `text_channel_message_read_by_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;')

    this.addSql('alter table `text_channel_message_deleted_from_users` add constraint `text_channel_message_deleted_from_users_text_chann_f294f_foreign` foreign key (`text_channel_message_id`) references `text_channel_message` (`id`) on update cascade on delete cascade;')
    this.addSql('alter table `text_channel_message_deleted_from_users` add constraint `text_channel_message_deleted_from_users_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;')

    this.addSql('drop table if exists `message`;')

    this.addSql('drop table if exists `message_deleted_from_users`;')

    this.addSql('drop table if exists `message_read_by`;')
  }
}
