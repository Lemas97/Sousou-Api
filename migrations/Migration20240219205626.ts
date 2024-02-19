import { Migration } from '@mikro-orm/migrations'

export class Migration20240219205626 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table `user` add `socket_id` varchar(255) null')
  }
}
