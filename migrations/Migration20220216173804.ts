import { Migration } from '@mikro-orm/migrations'

export class Migration20220216173804 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table `user` add `token` varchar(255) null;')
  }
}
