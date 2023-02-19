import { Migration } from '@mikro-orm/migrations'

export class Migration20230219113027 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table `user` add `reset_password_token` varchar(255) null;')
  }

  async down (): Promise<void> {
    this.addSql('alter table `user` drop `reset_password_token`;')
  }
}
