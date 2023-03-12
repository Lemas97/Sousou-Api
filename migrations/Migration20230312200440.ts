import { Migration } from '@mikro-orm/migrations'

export class Migration20230312200440 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table `personal_chat` add `disabled` tinyint(1) not null default false, add `is_group_personal_chat` tinyint(1) not null default false;')
  }

  async down (): Promise<void> {
    this.addSql('alter table `personal_chat` drop `disabled`;')
    this.addSql('alter table `personal_chat` drop `is_group_personal_chat`;')
  }
}
