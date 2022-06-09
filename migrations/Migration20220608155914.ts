import { Migration } from '@mikro-orm/migrations'

export class Migration20220608155914 extends Migration {
  async up (): Promise<void> {
    this.addSql('create table `personal_chat` (`id` varchar(255) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;')

    this.addSql('create table `group` (`id` varchar(255) not null, `name` varchar(255) not null, `icon` varchar(255) not null, `color` varchar(255) not null, `created_at` datetime not null, `preferences` json not null, `owner_id` varchar(255) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `group` add index `group_owner_id_index`(`owner_id`);')

    this.addSql('create table `text_channel` (`id` varchar(255) not null, `name` varchar(255) not null, `slow_mode` int null, `group_id` varchar(255) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `text_channel` add index `text_channel_group_id_index`(`group_id`);')

    this.addSql('create table `voice_channel` (`id` varchar(255) not null, `name` varchar(255) not null, `max_users` int null, `group_id` varchar(255) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `voice_channel` add index `voice_channel_group_id_index`(`group_id`);')

    this.addSql('create table `user` (`id` varchar(255) not null, `username` varchar(255) not null, `display_name` varchar(255) not null, `email` varchar(255) not null, `code` varchar(255) not null, `password` varchar(255) not null, `icon` varchar(255) not null, `created_at` datetime not null, `confirm_email_token` varchar(255) not null, `email_confirm` tinyint(1) not null, `jwt_token` text null, `preferences` json not null, `connected_voice_channel_id` varchar(255) null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `user` add unique `user_username_unique`(`username`);')
    this.addSql('alter table `user` add unique `user_email_unique`(`email`);')
    this.addSql('alter table `user` add index `user_connected_voice_channel_id_index`(`connected_voice_channel_id`);')

    this.addSql('create table `personal_message` (`id` varchar(255) not null, `created_at` datetime not null, `text` varchar(255) not null, `delete_for_all` tinyint(1) null, `state` enum(\'sended\', \'deleted_for_all\', \'deleted_for_me\') not null, `file` varchar(255) null, `from_id` varchar(255) not null, `personal_chat_id` varchar(255) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `personal_message` add index `personal_message_from_id_index`(`from_id`);')
    this.addSql('alter table `personal_message` add index `personal_message_personal_chat_id_index`(`personal_chat_id`);')

    this.addSql('create table `text_channel_message` (`id` varchar(255) not null, `created_at` datetime not null, `text` varchar(255) not null, `delete_for_all` tinyint(1) null, `state` enum(\'sended\', \'deleted_for_all\', \'deleted_for_me\') not null, `file` varchar(255) null, `from_id` varchar(255) not null, `text_channel_id` varchar(255) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `text_channel_message` add index `text_channel_message_from_id_index`(`from_id`);')
    this.addSql('alter table `text_channel_message` add index `text_channel_message_text_channel_id_index`(`text_channel_id`);')

    this.addSql('create table `personal_chat_users` (`personal_chat_id` varchar(255) not null, `user_id` varchar(255) not null, primary key (`personal_chat_id`, `user_id`)) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `personal_chat_users` add index `personal_chat_users_personal_chat_id_index`(`personal_chat_id`);')
    this.addSql('alter table `personal_chat_users` add index `personal_chat_users_user_id_index`(`user_id`);')

    this.addSql('create table `personal_message_read_by` (`personal_message_id` varchar(255) not null, `user_id` varchar(255) not null, primary key (`personal_message_id`, `user_id`)) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `personal_message_read_by` add index `personal_message_read_by_personal_message_id_index`(`personal_message_id`);')
    this.addSql('alter table `personal_message_read_by` add index `personal_message_read_by_user_id_index`(`user_id`);')

    this.addSql('create table `personal_message_deleted_from_users` (`personal_message_id` varchar(255) not null, `user_id` varchar(255) not null, primary key (`personal_message_id`, `user_id`)) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `personal_message_deleted_from_users` add index `personal_message_deleted_from_users_personal_message_id_index`(`personal_message_id`);')
    this.addSql('alter table `personal_message_deleted_from_users` add index `personal_message_deleted_from_users_user_id_index`(`user_id`);')

    this.addSql('create table `text_channel_message_read_by` (`text_channel_message_id` varchar(255) not null, `user_id` varchar(255) not null, primary key (`text_channel_message_id`, `user_id`)) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `text_channel_message_read_by` add index `text_channel_message_read_by_text_channel_message_id_index`(`text_channel_message_id`);')
    this.addSql('alter table `text_channel_message_read_by` add index `text_channel_message_read_by_user_id_index`(`user_id`);')

    this.addSql('create table `text_channel_message_deleted_from_users` (`text_channel_message_id` varchar(255) not null, `user_id` varchar(255) not null, primary key (`text_channel_message_id`, `user_id`)) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `text_channel_message_deleted_from_users` add index `text_channel_message_deleted_from_users_text_channe_220d0_index`(`text_channel_message_id`);')
    this.addSql('alter table `text_channel_message_deleted_from_users` add index `text_channel_message_deleted_from_users_user_id_index`(`user_id`);')

    this.addSql('create table `user_friend_list` (`user_1_id` varchar(255) not null, `user_2_id` varchar(255) not null, primary key (`user_1_id`, `user_2_id`)) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `user_friend_list` add index `user_friend_list_user_1_id_index`(`user_1_id`);')
    this.addSql('alter table `user_friend_list` add index `user_friend_list_user_2_id_index`(`user_2_id`);')

    this.addSql('create table `group_invitation_permission_users` (`group_id` varchar(255) not null, `user_id` varchar(255) not null, primary key (`group_id`, `user_id`)) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `group_invitation_permission_users` add index `group_invitation_permission_users_group_id_index`(`group_id`);')
    this.addSql('alter table `group_invitation_permission_users` add index `group_invitation_permission_users_user_id_index`(`user_id`);')

    this.addSql('create table `group_members` (`group_id` varchar(255) not null, `user_id` varchar(255) not null, primary key (`group_id`, `user_id`)) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `group_members` add index `group_members_group_id_index`(`group_id`);')
    this.addSql('alter table `group_members` add index `group_members_user_id_index`(`user_id`);')

    this.addSql('create table `user_groups` (`user_id` varchar(255) not null, `group_id` varchar(255) not null, primary key (`user_id`, `group_id`)) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `user_groups` add index `user_groups_user_id_index`(`user_id`);')
    this.addSql('alter table `user_groups` add index `user_groups_group_id_index`(`group_id`);')

    this.addSql('create table `friend_request` (`id` varchar(255) not null, `message` varchar(255) not null, `created_at` datetime not null, `updated_at` datetime null, `answer` tinyint(1) null, `canceled` tinyint(1) null, `from_user_id` varchar(255) not null, `to_user_id` varchar(255) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `friend_request` add index `friend_request_from_user_id_index`(`from_user_id`);')
    this.addSql('alter table `friend_request` add index `friend_request_to_user_id_index`(`to_user_id`);')

    this.addSql('alter table `group` add constraint `group_owner_id_foreign` foreign key (`owner_id`) references `user` (`id`) on update cascade;')

    this.addSql('alter table `text_channel` add constraint `text_channel_group_id_foreign` foreign key (`group_id`) references `group` (`id`) on update cascade;')

    this.addSql('alter table `voice_channel` add constraint `voice_channel_group_id_foreign` foreign key (`group_id`) references `group` (`id`) on update cascade;')

    this.addSql('alter table `user` add constraint `user_connected_voice_channel_id_foreign` foreign key (`connected_voice_channel_id`) references `voice_channel` (`id`) on update cascade on delete set null;')

    this.addSql('alter table `personal_message` add constraint `personal_message_from_id_foreign` foreign key (`from_id`) references `user` (`id`) on update cascade;')
    this.addSql('alter table `personal_message` add constraint `personal_message_personal_chat_id_foreign` foreign key (`personal_chat_id`) references `personal_chat` (`id`) on update cascade;')

    this.addSql('alter table `text_channel_message` add constraint `text_channel_message_from_id_foreign` foreign key (`from_id`) references `user` (`id`) on update cascade;')
    this.addSql('alter table `text_channel_message` add constraint `text_channel_message_text_channel_id_foreign` foreign key (`text_channel_id`) references `text_channel` (`id`) on update cascade;')

    this.addSql('alter table `personal_chat_users` add constraint `personal_chat_users_personal_chat_id_foreign` foreign key (`personal_chat_id`) references `personal_chat` (`id`) on update cascade on delete cascade;')
    this.addSql('alter table `personal_chat_users` add constraint `personal_chat_users_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;')

    this.addSql('alter table `personal_message_read_by` add constraint `personal_message_read_by_personal_message_id_foreign` foreign key (`personal_message_id`) references `personal_message` (`id`) on update cascade on delete cascade;')
    this.addSql('alter table `personal_message_read_by` add constraint `personal_message_read_by_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;')

    this.addSql('alter table `personal_message_deleted_from_users` add constraint `personal_message_deleted_from_users_personal_message_id_foreign` foreign key (`personal_message_id`) references `personal_message` (`id`) on update cascade on delete cascade;')
    this.addSql('alter table `personal_message_deleted_from_users` add constraint `personal_message_deleted_from_users_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;')

    this.addSql('alter table `text_channel_message_read_by` add constraint `text_channel_message_read_by_text_channel_message_id_foreign` foreign key (`text_channel_message_id`) references `text_channel_message` (`id`) on update cascade on delete cascade;')
    this.addSql('alter table `text_channel_message_read_by` add constraint `text_channel_message_read_by_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;')

    this.addSql('alter table `text_channel_message_deleted_from_users` add constraint `text_channel_message_deleted_from_users_text_chan_f294f_foreign` foreign key (`text_channel_message_id`) references `text_channel_message` (`id`) on update cascade on delete cascade;')
    this.addSql('alter table `text_channel_message_deleted_from_users` add constraint `text_channel_message_deleted_from_users_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;')

    this.addSql('alter table `user_friend_list` add constraint `user_friend_list_user_1_id_foreign` foreign key (`user_1_id`) references `user` (`id`) on update cascade on delete cascade;')
    this.addSql('alter table `user_friend_list` add constraint `user_friend_list_user_2_id_foreign` foreign key (`user_2_id`) references `user` (`id`) on update cascade on delete cascade;')

    this.addSql('alter table `group_invitation_permission_users` add constraint `group_invitation_permission_users_group_id_foreign` foreign key (`group_id`) references `group` (`id`) on update cascade on delete cascade;')
    this.addSql('alter table `group_invitation_permission_users` add constraint `group_invitation_permission_users_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;')

    this.addSql('alter table `group_members` add constraint `group_members_group_id_foreign` foreign key (`group_id`) references `group` (`id`) on update cascade on delete cascade;')
    this.addSql('alter table `group_members` add constraint `group_members_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;')

    this.addSql('alter table `user_groups` add constraint `user_groups_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;')
    this.addSql('alter table `user_groups` add constraint `user_groups_group_id_foreign` foreign key (`group_id`) references `group` (`id`) on update cascade on delete cascade;')

    this.addSql('alter table `friend_request` add constraint `friend_request_from_user_id_foreign` foreign key (`from_user_id`) references `user` (`id`) on update cascade;')
    this.addSql('alter table `friend_request` add constraint `friend_request_to_user_id_foreign` foreign key (`to_user_id`) references `user` (`id`) on update cascade;')
  }

  async down (): Promise<void> {
    this.addSql('alter table `personal_message` drop foreign key `personal_message_personal_chat_id_foreign`;')

    this.addSql('alter table `personal_chat_users` drop foreign key `personal_chat_users_personal_chat_id_foreign`;')

    this.addSql('alter table `text_channel` drop foreign key `text_channel_group_id_foreign`;')

    this.addSql('alter table `voice_channel` drop foreign key `voice_channel_group_id_foreign`;')

    this.addSql('alter table `group_invitation_permission_users` drop foreign key `group_invitation_permission_users_group_id_foreign`;')

    this.addSql('alter table `group_members` drop foreign key `group_members_group_id_foreign`;')

    this.addSql('alter table `user_groups` drop foreign key `user_groups_group_id_foreign`;')

    this.addSql('alter table `text_channel_message` drop foreign key `text_channel_message_text_channel_id_foreign`;')

    this.addSql('alter table `user` drop foreign key `user_connected_voice_channel_id_foreign`;')

    this.addSql('alter table `group` drop foreign key `group_owner_id_foreign`;')

    this.addSql('alter table `personal_message` drop foreign key `personal_message_from_id_foreign`;')

    this.addSql('alter table `text_channel_message` drop foreign key `text_channel_message_from_id_foreign`;')

    this.addSql('alter table `personal_chat_users` drop foreign key `personal_chat_users_user_id_foreign`;')

    this.addSql('alter table `personal_message_read_by` drop foreign key `personal_message_read_by_user_id_foreign`;')

    this.addSql('alter table `personal_message_deleted_from_users` drop foreign key `personal_message_deleted_from_users_user_id_foreign`;')

    this.addSql('alter table `text_channel_message_read_by` drop foreign key `text_channel_message_read_by_user_id_foreign`;')

    this.addSql('alter table `text_channel_message_deleted_from_users` drop foreign key `text_channel_message_deleted_from_users_user_id_foreign`;')

    this.addSql('alter table `user_friend_list` drop foreign key `user_friend_list_user_1_id_foreign`;')

    this.addSql('alter table `user_friend_list` drop foreign key `user_friend_list_user_2_id_foreign`;')

    this.addSql('alter table `group_invitation_permission_users` drop foreign key `group_invitation_permission_users_user_id_foreign`;')

    this.addSql('alter table `group_members` drop foreign key `group_members_user_id_foreign`;')

    this.addSql('alter table `user_groups` drop foreign key `user_groups_user_id_foreign`;')

    this.addSql('alter table `friend_request` drop foreign key `friend_request_from_user_id_foreign`;')

    this.addSql('alter table `friend_request` drop foreign key `friend_request_to_user_id_foreign`;')

    this.addSql('alter table `personal_message_read_by` drop foreign key `personal_message_read_by_personal_message_id_foreign`;')

    this.addSql('alter table `personal_message_deleted_from_users` drop foreign key `personal_message_deleted_from_users_personal_message_id_foreign`;')

    this.addSql('alter table `text_channel_message_read_by` drop foreign key `text_channel_message_read_by_text_channel_message_id_foreign`;')

    this.addSql('alter table `text_channel_message_deleted_from_users` drop foreign key `text_channel_message_deleted_from_users_text_chan_f294f_foreign`;')

    this.addSql('drop table if exists `personal_chat`;')

    this.addSql('drop table if exists `group`;')

    this.addSql('drop table if exists `text_channel`;')

    this.addSql('drop table if exists `voice_channel`;')

    this.addSql('drop table if exists `user`;')

    this.addSql('drop table if exists `personal_message`;')

    this.addSql('drop table if exists `text_channel_message`;')

    this.addSql('drop table if exists `personal_chat_users`;')

    this.addSql('drop table if exists `personal_message_read_by`;')

    this.addSql('drop table if exists `personal_message_deleted_from_users`;')

    this.addSql('drop table if exists `text_channel_message_read_by`;')

    this.addSql('drop table if exists `text_channel_message_deleted_from_users`;')

    this.addSql('drop table if exists `user_friend_list`;')

    this.addSql('drop table if exists `group_invitation_permission_users`;')

    this.addSql('drop table if exists `group_members`;')

    this.addSql('drop table if exists `user_groups`;')

    this.addSql('drop table if exists `friend_request`;')
  }
}
