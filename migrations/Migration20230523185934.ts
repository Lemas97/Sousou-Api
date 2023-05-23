import { Migration } from '@mikro-orm/migrations'

export class Migration20230523185934 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table `personal_message` add `is_call` tinyint(1) not null default false, add `call_data_answer` tinyint(1) null, add `call_data_start_timestamp` datetime null, add `call_data_end_timestamp` datetime null, add `call_data_end_calling_timestamp` datetime null;')
  }

  async down (): Promise<void> {
    this.addSql('alter table `personal_message` drop `is_call`;')
    this.addSql('alter table `personal_message` drop `call_data_answer`;')
    this.addSql('alter table `personal_message` drop `call_data_start_timestamp`;')
    this.addSql('alter table `personal_message` drop `call_data_end_timestamp`;')
    this.addSql('alter table `personal_message` drop `call_data_end_calling_timestamp`;')
  }
}
