import { Migration } from '@mikro-orm/migrations'

export class Migration20220609205830 extends Migration {
  async up (): Promise<void> {
    this.addSql('create table `group_invite` (`id` varchar(255) not null, `message` varchar(255) not null, `created_at` datetime not null, `updated_at` datetime null, `answer` tinyint(1) null, `canceled` tinyint(1) null, `from_user_id` varchar(255) not null, `to_user_id` varchar(255) not null, `group_id` varchar(255) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `group_invite` add index `group_invite_from_user_id_index`(`from_user_id`);')
    this.addSql('alter table `group_invite` add index `group_invite_to_user_id_index`(`to_user_id`);')
    this.addSql('alter table `group_invite` add index `group_invite_group_id_index`(`group_id`);')

    this.addSql('alter table `group_invite` add constraint `group_invite_from_user_id_foreign` foreign key (`from_user_id`) references `user` (`id`) on update cascade;')
    this.addSql('alter table `group_invite` add constraint `group_invite_to_user_id_foreign` foreign key (`to_user_id`) references `user` (`id`) on update cascade;')
    this.addSql('alter table `group_invite` add constraint `group_invite_group_id_foreign` foreign key (`group_id`) references `group` (`id`) on update cascade;')
  }

  async down (): Promise<void> {
    this.addSql('drop table if exists `group_invite`;')
  }
}
