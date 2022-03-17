import { Migration } from '@mikro-orm/migrations'

export class Migration20220317225554 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table `group` modify `preferences` json;')

    this.addSql('alter table `user` modify `preferences` json;')
    this.addSql('alter table `user` drop `token`;')

    this.addSql('alter table `message` add `delete_for_all` tinyint(1) null;')

    this.addSql('create table `message_deleted_from_users` (`message_id` varchar(255) not null, `user_id` varchar(255) not null) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `message_deleted_from_users` add index `message_deleted_from_users_message_id_index`(`message_id`);')
    this.addSql('alter table `message_deleted_from_users` add index `message_deleted_from_users_user_id_index`(`user_id`);')
    this.addSql('alter table `message_deleted_from_users` add primary key `message_deleted_from_users_pkey`(`message_id`, `user_id`);')

    this.addSql('create table `group_members` (`group_id` varchar(255) not null, `user_id` varchar(255) not null) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `group_members` add index `group_members_group_id_index`(`group_id`);')
    this.addSql('alter table `group_members` add index `group_members_user_id_index`(`user_id`);')
    this.addSql('alter table `group_members` add primary key `group_members_pkey`(`group_id`, `user_id`);')

    this.addSql('alter table `message_deleted_from_users` add constraint `message_deleted_from_users_message_id_foreign` foreign key (`message_id`) references `message` (`id`) on update cascade on delete cascade;')
    this.addSql('alter table `message_deleted_from_users` add constraint `message_deleted_from_users_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;')

    this.addSql('alter table `group_members` add constraint `group_members_group_id_foreign` foreign key (`group_id`) references `group` (`id`) on update cascade on delete cascade;')
    this.addSql('alter table `group_members` add constraint `group_members_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;')

    this.addSql('drop table if exists `group_users`;')
  }
}
