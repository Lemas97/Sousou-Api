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
    limit: paginationData.limit > 0 ? paginationData.limit : undefined,
    offset,
    orderBy: { createdAt: 'DESC' },
    populate: ['owner']
  })
  return { data: group, total: count }
}

export async function createGroupAction (data: GroupInputData, currentUser: User, em: EntityManager): Promise<Group> {
  const group = em.create(Group, {
    ...data,
    preferences: {
      approveInvites: false
    },
    createdAt: new Date(),
    owner: currentUser.id
  })

  await em.persistAndFlush(group)
  await em.populate(group, ['owner'])

  return group
}

export async function updateGroupAction (id: string, data: GroupInputData, currentUser: User, em: EntityManager): Promise<Group> {
  const group = await em.findOneOrFail(Group, id)

  if (group.owner.id !== currentUser.id) throw new ForbiddenError('NO_ACCESS')

  em.assign(group, { ...data })

  await em.flush()

  return group
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
