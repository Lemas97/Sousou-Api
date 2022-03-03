import { Migration } from '@mikro-orm/migrations';

export class Migration20220215215327 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `group` (`id` varchar(255) not null, `name` varchar(255) not null, `icon` varchar(255) not null, `color` varchar(255) not null, `created_at` datetime not null, `preferences` json not null, `owner_id` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `group` add primary key `group_pkey`(`id`);');
    this.addSql('alter table `group` add index `group_owner_id_index`(`owner_id`);');

    this.addSql('create table `text_channel` (`id` varchar(255) not null, `name` varchar(255) not null, `slow_mode` int(11) null, `group_id` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `text_channel` add primary key `text_channel_pkey`(`id`);');
    this.addSql('alter table `text_channel` add index `text_channel_group_id_index`(`group_id`);');

    this.addSql('create table `voice_channel` (`id` varchar(255) not null, `name` varchar(255) not null, `max_users` int(11) null, `group_id` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `voice_channel` add primary key `voice_channel_pkey`(`id`);');
    this.addSql('alter table `voice_channel` add index `voice_channel_group_id_index`(`group_id`);');

    this.addSql('create table `user` (`id` varchar(255) not null, `username` varchar(255) not null, `display_name` varchar(255) not null, `email` varchar(255) not null, `code` varchar(255) not null, `password` varchar(255) not null, `icon` varchar(255) not null, `created_at` datetime not null, `preferences` json not null, `connected_voice_channel_id` varchar(255) null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `user` add primary key `user_pkey`(`id`);');
    this.addSql('alter table `user` add unique `user_username_unique`(`username`);');
    this.addSql('alter table `user` add unique `user_email_unique`(`email`);');
    this.addSql('alter table `user` add index `user_connected_voice_channel_id_index`(`connected_voice_channel_id`);');

    this.addSql('create table `message` (`id` varchar(255) not null, `created_at` datetime not null, `text` varchar(255) not null, `from_user_id` varchar(255) not null, `text_channel_id` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `message` add primary key `message_pkey`(`id`);');
    this.addSql('alter table `message` add index `message_from_user_id_index`(`from_user_id`);');
    this.addSql('alter table `message` add index `message_text_channel_id_index`(`text_channel_id`);');

    this.addSql('create table `message_read_by` (`message_id` varchar(255) not null, `user_id` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `message_read_by` add index `message_read_by_message_id_index`(`message_id`);');
    this.addSql('alter table `message_read_by` add index `message_read_by_user_id_index`(`user_id`);');
    this.addSql('alter table `message_read_by` add primary key `message_read_by_pkey`(`message_id`, `user_id`);');

    this.addSql('create table `user_friend_list` (`user_1_id` varchar(255) not null, `user_2_id` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `user_friend_list` add index `user_friend_list_user_1_id_index`(`user_1_id`);');
    this.addSql('alter table `user_friend_list` add index `user_friend_list_user_2_id_index`(`user_2_id`);');
    this.addSql('alter table `user_friend_list` add primary key `user_friend_list_pkey`(`user_1_id`, `user_2_id`);');

    this.addSql('create table `group_invitation_permission_users` (`group_id` varchar(255) not null, `user_id` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `group_invitation_permission_users` add index `group_invitation_permission_users_group_id_index`(`group_id`);');
    this.addSql('alter table `group_invitation_permission_users` add index `group_invitation_permission_users_user_id_index`(`user_id`);');
    this.addSql('alter table `group_invitation_permission_users` add primary key `group_invitation_permission_users_pkey`(`group_id`, `user_id`);');

    this.addSql('create table `group_users` (`group_id` varchar(255) not null, `user_id` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `group_users` add index `group_users_group_id_index`(`group_id`);');
    this.addSql('alter table `group_users` add index `group_users_user_id_index`(`user_id`);');
    this.addSql('alter table `group_users` add primary key `group_users_pkey`(`group_id`, `user_id`);');

    this.addSql('create table `user_groups` (`user_id` varchar(255) not null, `group_id` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `user_groups` add index `user_groups_user_id_index`(`user_id`);');
    this.addSql('alter table `user_groups` add index `user_groups_group_id_index`(`group_id`);');
    this.addSql('alter table `user_groups` add primary key `user_groups_pkey`(`user_id`, `group_id`);');

    this.addSql('create table `friend_request` (`id` varchar(255) not null, `message` varchar(255) not null, `created_at` datetime not null, `updated_at` datetime not null, `answer` tinyint(1) null, `canceled` tinyint(1) null, `from_user_id` varchar(255) not null, `to_user_id` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `friend_request` add primary key `friend_request_pkey`(`id`);');
    this.addSql('alter table `friend_request` add index `friend_request_from_user_id_index`(`from_user_id`);');
    this.addSql('alter table `friend_request` add index `friend_request_to_user_id_index`(`to_user_id`);');

    this.addSql('alter table `group` add constraint `group_owner_id_foreign` foreign key (`owner_id`) references `user` (`id`) on update cascade;');

    this.addSql('alter table `text_channel` add constraint `text_channel_group_id_foreign` foreign key (`group_id`) references `group` (`id`) on update cascade;');

    this.addSql('alter table `voice_channel` add constraint `voice_channel_group_id_foreign` foreign key (`group_id`) references `group` (`id`) on update cascade;');

    this.addSql('alter table `user` add constraint `user_connected_voice_channel_id_foreign` foreign key (`connected_voice_channel_id`) references `voice_channel` (`id`) on update cascade on delete set null;');

    this.addSql('alter table `message` add constraint `message_from_user_id_foreign` foreign key (`from_user_id`) references `user` (`id`) on update cascade;');
    this.addSql('alter table `message` add constraint `message_text_channel_id_foreign` foreign key (`text_channel_id`) references `text_channel` (`id`) on update cascade;');

    this.addSql('alter table `message_read_by` add constraint `message_read_by_message_id_foreign` foreign key (`message_id`) references `message` (`id`) on update cascade on delete cascade;');
    this.addSql('alter table `message_read_by` add constraint `message_read_by_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;');

    this.addSql('alter table `user_friend_list` add constraint `user_friend_list_user_1_id_foreign` foreign key (`user_1_id`) references `user` (`id`) on update cascade on delete cascade;');
    this.addSql('alter table `user_friend_list` add constraint `user_friend_list_user_2_id_foreign` foreign key (`user_2_id`) references `user` (`id`) on update cascade on delete cascade;');

    this.addSql('alter table `group_invitation_permission_users` add constraint `group_invitation_permission_users_group_id_foreign` foreign key (`group_id`) references `group` (`id`) on update cascade on delete cascade;');
    this.addSql('alter table `group_invitation_permission_users` add constraint `group_invitation_permission_users_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;');

    this.addSql('alter table `group_users` add constraint `group_users_group_id_foreign` foreign key (`group_id`) references `group` (`id`) on update cascade on delete cascade;');
    this.addSql('alter table `group_users` add constraint `group_users_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;');

    this.addSql('alter table `user_groups` add constraint `user_groups_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;');
    this.addSql('alter table `user_groups` add constraint `user_groups_group_id_foreign` foreign key (`group_id`) references `group` (`id`) on update cascade on delete cascade;');

    this.addSql('alter table `friend_request` add constraint `friend_request_from_user_id_foreign` foreign key (`from_user_id`) references `user` (`id`) on update cascade;');
    this.addSql('alter table `friend_request` add constraint `friend_request_to_user_id_foreign` foreign key (`to_user_id`) references `user` (`id`) on update cascade;');
  }

}
