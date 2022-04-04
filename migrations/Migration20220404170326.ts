import { Migration } from '@mikro-orm/migrations';

export class Migration20220404170326 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `group` modify `preferences` json not null;');

    this.addSql('alter table `user` modify `preferences` json not null;');

    this.addSql('alter table `personal_message` change `from_user_id` `from_id` varchar(255) not null;');


    this.addSql('alter table `text_channel_message` change `from_user_id` `from_id` varchar(255) not null;');
  }

}
