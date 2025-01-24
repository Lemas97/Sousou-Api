import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core'

enum Gender {
  MALE,
  FEMALE
}

@Entity()
export class Patient {
  @PrimaryKey({ autoincrement: true })
    id: number

  @Property({ nullable: true })
    name: string

  @Property({ nullable: true })
    surname: string

  @Property()
    mobile: number

  @Property()
    address: string

  @Enum(() => Gender)
    gender: Gender

  @Property({ type: 'text' })
    medication: string

  @Property({ type: 'text' })
    conditions: string

  @Property({ length: 9 })
    AMKA: string

  @Property({ nullable: true, type: 'int' })
    age?: number
}
