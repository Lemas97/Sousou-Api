import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Appointment } from './Appointment'
import { Patient } from './Patient'

@Entity()
export class Prescription {
  @PrimaryKey({ autoincrement: true })
    number: number

  @Property()
    medicine: string

  @Property()
    createdDate: Date

  @Property({ type: 'double' })
    participationFee: number

  @ManyToOne(() => Patient, { primary: true })
    patient: Patient

  @ManyToOne(() => Appointment)
    appointment: Appointment
}
