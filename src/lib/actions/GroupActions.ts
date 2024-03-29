import { EntityManager } from '@mikro-orm/core'
import { ForbiddenError, UserInputError } from 'apollo-server-koa'
import { Server } from 'socket.io'

import { PaginatedGroups } from '../../types/classes/pagination/PaginatedGroups'
import { Group } from '../../types/entities/Group'
import { User } from '../../types/entities/User'

import { GroupPreferencesInputData } from '../../types/classes/input-data/json-input-data/GroupPreferencesInputData'
import { PaginatedInputData } from '../../types/classes/input-data/PaginatedInputData'
import { GroupInputData } from '../../types/classes/input-data/GroupInputData'
import { TextChannel } from '../../types/entities/TextChannel'
import { updateGroup } from '../socket/SocketInitEvents'

export async function getGroupsAction (paginationData: PaginatedInputData, em: EntityManager): Promise<PaginatedGroups> {
  if (!paginationData.filter) paginationData.filter = ''
  const offset = (paginationData.limit * paginationData.page) - paginationData.limit

  const [group, count] = await em.findAndCount(Group, {}, {
    limit: paginationData.limit > 0 ? paginationData.limit : undefined,
    offset,
    orderBy: { createdAt: 'DESC' },
    populate: ['owner', 'textChannels.users', 'voiceChannels.users']
  })
  return { data: group, total: count }
}

export async function getGroupByIdAction (id: string, currentUser: User, em: EntityManager): Promise<Group> {
  const group = await em.findOneOrFail(Group, {
    id,
    members: { id: { $in: [currentUser.id] } }
  }, {
    populate: ['members', 'textChannels', 'voiceChannels']
  })

  return group
}

export async function createGroupAction (data: GroupInputData, currentUser: User, io: Server, em: EntityManager): Promise<Group> {
  const group = em.create(Group, {
    ...data,
    preferences: {
      approveInvites: false
    },
    createdAt: new Date(),
    owner: currentUser.id
  })

  await em.persistAndFlush(group)

  const generalTextChannel = em.create(TextChannel, {
    name: 'General',
    users: [currentUser],
    group: group.id
  })

  // const sockets = await io.fetchSockets()
  // io.socketsJoin(`group:${group.id}`)
  // console.log(sockets)

  // const socketIndex = sockets.findIndex(s => s.handshake.auth.token === currentUser.jwtToken)

  // console.log(socketIndex, sockets[socketIndex])

  // sockets[socketIndex].join(`group:${group.id}`)

  await em.persistAndFlush(generalTextChannel)

  const user = await em.findOneOrFail(User, currentUser.id)

  io.to(user.socketId!).socketsJoin(`group:${group.id}`)

  group.members.add(user)

  await em.flush()
  await em.populate(group, ['owner'])

  return group
}

export async function updateGroupAction (id: string, data: GroupInputData, currentUser: User, io: Server, em: EntityManager): Promise<Group> {
  const group = await em.findOneOrFail(Group, id)

  if (group.owner.id !== currentUser.id) throw new ForbiddenError('NO_ACCESS')

  em.assign(group, { ...data })

  await em.flush()

  updateGroup(currentUser, group, io)

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
