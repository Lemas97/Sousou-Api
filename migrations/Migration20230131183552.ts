import { Migration } from '@mikro-orm/migrations'

export class Migration20230131183552 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table `user` drop index `user_username_unique`;')
    this.addSql('alter table `user` add unique `user_username_code_unique`(`username`, `code`);')
  }

  async down (): Promise<void> {
    this.addSql('alter table `user` drop index `user_username_code_unique`;')
    this.addSql('alter table `user` add unique `user_username_unique`(`username`);')
  }
}
