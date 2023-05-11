import { Migration } from '@mikro-orm/migrations'

export class Migration20230511213707 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table `user` add `socket_id` varchar(255) not null;')
    this.addSql('alter table `user` add unique `user_socket_id_unique`(`socket_id`);')
  }

  async down (): Promise<void> {
    this.addSql('alter table `user` drop index `user_socket_id_unique`;')
    this.addSql('alter table `user` drop `socket_id`;')
  }
}
