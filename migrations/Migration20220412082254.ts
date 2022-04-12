import { Migration } from '@mikro-orm/migrations'

export class Migration20220412082254 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table `group` modify `preferences` json not null;')

    this.addSql('alter table `user` add `email_confirm` json not null;')
    this.addSql('alter table `user` modify `preferences` json not null;')
  }
}
