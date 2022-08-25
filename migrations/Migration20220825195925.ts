import { Migration } from '@mikro-orm/migrations'

export class Migration20220825195925 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table `user` drop `group_invites_id`;')
  }

  async down (): Promise<void> {
    this.addSql('alter table `user` add `group_invites_id` varchar(255) not null;')
  }
}
