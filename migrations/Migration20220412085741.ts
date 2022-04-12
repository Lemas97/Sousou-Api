import { Migration } from '@mikro-orm/migrations'

export class Migration20220412085741 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table `group` modify `preferences` json;')

    this.addSql('alter table `user` add `confirm_email_token` varchar(255) not null;')
    this.addSql('alter table `user` modify `email_confirm` json, modify `preferences` json;')
  }
}
