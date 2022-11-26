import { Migration } from '@mikro-orm/migrations';

export class Migration20221126111100 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `user` change `is_logged` `is_logged_in` tinyint(1) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `user` change `is_logged_in` `is_logged` tinyint(1) not null;');
  }

}
