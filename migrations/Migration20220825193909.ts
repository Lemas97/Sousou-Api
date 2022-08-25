import { Migration } from '@mikro-orm/migrations'

export class Migration20220825193909 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table `user` add `group_invites_id` varchar(255) not null;')
  }

  async down (): Promise<void> {
    this.addSql('alter table `user` drop foreign key `user_group_invites_id_foreign`;')

    this.addSql('alter table `user` drop index `user_group_invites_id_index`;')
    this.addSql('alter table `user` drop `group_invites_id`;')
  }
}
