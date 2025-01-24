import { Migration } from '@mikro-orm/migrations'

export class Migration20250104183428 extends Migration {
  async up (): Promise<void> {
    this.addSql('create table `doctor` (`id` int unsigned not null auto_increment primary key, `specialty` tinyint null, `name` varchar(255) null, `surname` varchar(255) null, `age` int null) default character set utf8mb4 engine = InnoDB;')

    this.addSql('create table `patient` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) null, `surname` varchar(255) null, `age` int null) default character set utf8mb4 engine = InnoDB;')

    this.addSql('create table `appointment` (`id` int unsigned not null auto_increment primary key, `scheduled_date` datetime null, `scheduled_time` time null, `start_date` datetime null, `start_time` time null, `end_date` datetime null, `end_time` time null, `cancel_date` datetime null, `medical_report` text null, `patient_id` int unsigned not null, `doctor_id` int unsigned null) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `appointment` add index `appointment_patient_id_index`(`patient_id`);')
    this.addSql('alter table `appointment` add index `appointment_doctor_id_index`(`doctor_id`);')

    this.addSql('create table `prescription` (`id` int unsigned not null auto_increment primary key, `medicine` varchar(255) not null, `patient_id` int unsigned not null, `appointment_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;')
    this.addSql('alter table `prescription` add index `prescription_patient_id_index`(`patient_id`);')
    this.addSql('alter table `prescription` add index `prescription_appointment_id_index`(`appointment_id`);')

    this.addSql('alter table `appointment` add constraint `appointment_patient_id_foreign` foreign key (`patient_id`) references `patient` (`id`) on update cascade;')
    this.addSql('alter table `appointment` add constraint `appointment_doctor_id_foreign` foreign key (`doctor_id`) references `doctor` (`id`) on update cascade on delete set null;')

    this.addSql('alter table `prescription` add constraint `prescription_patient_id_foreign` foreign key (`patient_id`) references `patient` (`id`) on update cascade;')
    this.addSql('alter table `prescription` add constraint `prescription_appointment_id_foreign` foreign key (`appointment_id`) references `appointment` (`id`) on update cascade;')
  }

  async down (): Promise<void> {
    this.addSql('alter table `appointment` drop foreign key `appointment_doctor_id_foreign`;')

    this.addSql('alter table `appointment` drop foreign key `appointment_patient_id_foreign`;')

    this.addSql('alter table `prescription` drop foreign key `prescription_patient_id_foreign`;')

    this.addSql('alter table `prescription` drop foreign key `prescription_appointment_id_foreign`;')

    this.addSql('drop table if exists `doctor`;')

    this.addSql('drop table if exists `patient`;')

    this.addSql('drop table if exists `appointment`;')

    this.addSql('drop table if exists `prescription`;')
  }
}
