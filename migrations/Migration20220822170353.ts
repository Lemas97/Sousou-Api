import { Migration } from '@mikro-orm/migrations'

export class Migration20220822170353 extends Migration {
  async up (): Promise<void> {
    this.addSql('drop table if exists `user_groups`;')
  }

  async down (): Promise<void> {
    this.addSql('create table `user_groups` (`user_id` varchar(255) not null, `group_id` varchar(255) not null, primary key (`user_id`, `group_id`)) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `user_groups` add index `user_groups_user_id_index`(`user_id`);')
    this.addSql('alter table `user_groups` add index `user_groups_group_id_index`(`group_id`);')
  }
}
