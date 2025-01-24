import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core'

@Entity()
export class Doctor {
  @PrimaryKey({ autoincrement: true })
    id: number

  @Enum({ type: () => SpecialtyEnum, nullable: true })
    specialty: SpecialtyEnum

  @Property({ nullable: true })
    name: string

  @Property({ nullable: true })
    surname: string

  @Property({ nullable: true, type: 'int' })
    age?: number
}

export enum SpecialtyEnum {
  'gynecologist',
  'cardiologist',
  'pathologist',
  'radiologist',
  'orthopaedic',
}
