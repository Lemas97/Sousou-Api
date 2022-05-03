import { EntityManager } from '@mikro-orm/core'
import { ForbiddenError, UserInputError } from 'apollo-server-koa'

import { PaginatedGroups } from 'src/types/classes/pagination/PaginatedGroups'
import { Group } from 'src/types/entities/Group'
import { User } from 'src/types/entities/User'

import { GroupPreferencesInputData } from 'src/types/classes/input-data/json-input-data/GroupPreferencesInputData'
import { PaginatedInputData } from 'src/types/classes/input-data/PaginatedInputData'
import { GroupInputData } from 'src/types/classes/input-data/GroupInputData'

export async function getGroupsAction (paginationData: PaginatedInputData, em: EntityManager): Promise<PaginatedGroups> {
  if (!paginationData.filter) paginationData.filter = ''
  const offset = (paginationData.limit * paginationData.page) - paginationData.limit

  const [group, count] = await em.findAndCount(Group, {}, {
    limit: paginationData.limit,
    offset,
    orderBy: { createdAt: 'DESC' },
    populate: ['owner']
  })
  return { data: group, total: count }
}

export async function createGroupAction (data: GroupInputData, currentUser: User, em: EntityManager): Promise<boolean> {
  const user = await em.findOneOrFail(User, { id: 'a3fd5f56-f0c6-48d9-b393-a52780b90547' })
  const group = em.create(Group, {
    ...data,
    createdAt: new Date(),
    preferences: { approveInvites: false },
    owner: user
  })

  await em.persistAndFlush(group)

  return true
}

export async function updateGroupAction (id: string, data: GroupInputData, currentUser: User, em: EntityManager): Promise<boolean> {
  const group = await em.findOneOrFail(Group, id)

  if (group.owner.id !== currentUser.id) throw new ForbiddenError('NO_ACCESS')

  em.assign(group, { ...data })

  await em.flush()

  return true
}

export async function updateGroupPreferencesAction (id: string, groupPreferencesInputData: GroupPreferencesInputData, currentUser: User, em: EntityManager): Promise<boolean> {
  const group = await em.findOneOrFail(Group, id)

  if (group.owner.id !== currentUser.id) throw new ForbiddenError('NO_ACCESS')

  group.preferences = {
    ...groupPreferencesInputData
  }

  return true
}

export async function transferOwnershipToUserAction (id: string, newOwnerId: string, currentUser: User, em: EntityManager): Promise<boolean> {
  if (newOwnerId === currentUser.id) throw new UserInputError('CANNOT_TRANSFER_GROUP_TO_YOURSELF')

  const group = await em.findOneOrFail(Group, id)

  if (group.owner.id !== currentUser.id) throw new ForbiddenError('NO_ACCESS')
  return true
}

export async function deleteGroupAction (id: string, currentUser: User, em: EntityManager): Promise<boolean> {
  const group = await em.findOneOrFail(Group, id)

  if (group.owner.id !== currentUser.id) throw new ForbiddenError('NO_ACCESS')

  await em.removeAndFlush(group)

  return true
}
