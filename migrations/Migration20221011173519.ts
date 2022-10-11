import { Migration } from '@mikro-orm/migrations'

export class Migration20221011173519 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table `user` add `is_logged` tinyint(1) not null;')
  }

  async down (): Promise<void> {
    this.addSql('alter table `user` drop `is_logged`;')
  }
}
