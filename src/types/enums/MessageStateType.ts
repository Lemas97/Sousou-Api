import { registerEnumType } from 'type-graphql'

export enum MessageStateType {
  SENDED = 'sended',
  DELETED_FOR_ME = 'deleted_for_all',
  DELETED_FOR_ALL = 'deleted_for_me'
}

registerEnumType(MessageStateType, {
  name: 'MessageStateType'
})
