import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Doctor } from './Doctor'
import { Patient } from './Patient'

@Entity()
export class Appointment {
  @PrimaryKey({ autoincrement: true })
    number: number

  @Property({ type: 'date', nullable: true })
    scheduledDate: Date

  @Property({ type: 'time', nullable: true })
    scheduledTime: Date

  @Property({ type: 'date', nullable: true })
    startDate: Date

  @Property({ type: 'time', nullable: true })
    startTime: Date

  @Property({ type: 'date', nullable: true })
    endDate: Date

  @Property({ type: 'time', nullable: true })
    endTime: Date

  @Property({ type: 'datetime', nullable: true })
    cancelDate: Date

  @Property({ type: 'text', nullable: true })
    medicalReport: string

  @ManyToOne(() => Patient, { primary: true })
    patient: Patient

  @ManyToOne(() => Doctor, { nullable: true })
    doctor: Doctor
}
