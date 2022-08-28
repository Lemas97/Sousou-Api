import { EntityManager } from '@mikro-orm/core'
import { ForbiddenError, UserInputError } from 'apollo-server-koa'
import { GroupInviteInputData } from 'src/types/classes/input-data/GroupInviteInputData'
import { PaginatedInputData } from 'src/types/classes/input-data/PaginatedInputData'
import { PaginatedGroupInvites } from 'src/types/classes/pagination/GroupInvitePagination'
import { Group } from 'src/types/entities/Group'
import { GroupInvite } from 'src/types/entities/GroupInvite'
import { User } from 'src/types/entities/User'

export async function getGroupInviteActions (paginationData: PaginatedInputData, forMe: boolean, currentUser: User, em: EntityManager): Promise<PaginatedGroupInvites> {
  const offset = (paginationData.limit * paginationData.page) - paginationData.limit
  paginationData.filter = paginationData.filter ?? ''

  const groupInvites = await em.findAndCount(GroupInvite,
    forMe
      ? {
          toUser: {
            $and: [
              { id: currentUser.id },
              { username: { $like: `%${paginationData.filter}%` } },
              { email: { $like: `%${paginationData.filter}%` } },
              { displayName: { $like: `%${paginationData.filter}%` } },
              { code: { $like: `%${paginationData.filter}%` } }
            ]
          }
        }
      : {
          fromUser: {
            $and: [
              { id: currentUser.id },
              { username: { $like: `%${paginationData.filter}%` } },
              { email: { $like: `%${paginationData.filter}%` } },
              { displayName: { $like: `%${paginationData.filter}%` } },
              { code: { $like: `%${paginationData.filter}%` } }
            ]
          }
        },
    {
      populate: [forMe ? 'fromUser' : 'toUser'],
      offset,
      limit: paginationData.limit > 0 ? paginationData.limit : undefined
    })

  return {
    data: groupInvites[0],
    total: groupInvites[1]
  }
}

export async function createGroupInviteAction (groupInviteInputData: GroupInviteInputData, currentUser: User, em: EntityManager): Promise<GroupInvite> {
  if (currentUser.id === groupInviteInputData.toUserId) throw new UserInputError('You cannot invite yourself to a group')

  const group = await em.findOneOrFail(Group, groupInviteInputData.groupId)
  if (!group.invitationPermissionUsers && group.owner.id !== currentUser.id) {
    throw new ForbiddenError('Invitations are forbidden in this group')
  }

  const toUser = await em.findOneOrFail(User, groupInviteInputData.toUserId, {
    populate: ['groupInvites', 'groups']
  })

  if (toUser.groups.getItems().map(gr => gr.id).includes(groupInviteInputData.groupId)) throw new UserInputError('This user is already a member')
  if (toUser.groupInvites.getItems().map(gr => gr.group.id).includes(groupInviteInputData.groupId)) throw new UserInputError('This user is already invited')

  const groupInvite = em.create(GroupInvite, {
    ...groupInviteInputData,
    createdAt: new Date(),
    group: group.id,
    toUser: toUser.id,
    fromUser: currentUser.id
  })

  await em.persistAndFlush(groupInvite)

  await em.populate(groupInvite, ['toUser', 'fromUser'])

  await em.populate(currentUser, ['groups'])

  return groupInvite
}

export async function cancelGroupInviteAction (id: string, currentUser: User, em: EntityManager): Promise<GroupInvite> {
  const groupInvite = await em.findOneOrFail(GroupInvite, id, { populate: ['fromUser'] })

  if (currentUser.id !== groupInvite.fromUser.id) throw new UserInputError('NO_ACCESS')

  if (groupInvite.answer !== null) throw new UserInputError('Cannot cancel invite that has already been answered')

  em.assign(groupInvite, { canceled: true })
  await em.flush()

  return groupInvite
}

export async function answerGroupInviteAction (id: string, answer: boolean, currentUser: User, em: EntityManager): Promise<GroupInvite> {
  const groupInvite = await em.findOneOrFail(GroupInvite, id, { populate: ['toUser', 'fromUser', 'group', 'group.members'] })

  const group = await em.findOneOrFail(Group, groupInvite.group.id)

  if (currentUser.id !== groupInvite.toUser.id) throw new UserInputError('NO_ACCESS')

  if (groupInvite.answer !== null) throw new UserInputError('Cannot answer invite that has already been answered')

  em.assign(groupInvite, { answer: answer })

  await em.populate(currentUser, ['groups'])
  em.assign(group, { members: [...group.members.getItems(), currentUser] })

  await em.flush()

  return groupInvite
}
