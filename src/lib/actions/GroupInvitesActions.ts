import { EntityManager } from '@mikro-orm/core'
import { ForbiddenError, UserInputError } from 'apollo-server-koa'
import { GroupInviteInputData } from '../../types/classes/input-data/GroupInviteInputData'
import { PaginatedInputData } from '../../types/classes/input-data/PaginatedInputData'
import { PaginatedGroupInvites } from '../../types/classes/pagination/GroupInvitePagination'
import { Group } from '../../types/entities/Group'
import { GroupInvite } from '../../types/entities/GroupInvite'
import { User } from '../../types/entities/User'
import { Server } from 'socket.io'
import { disconnectUserFromVoiceChannel, sendReceiveAnswerFriendRequest, sendReceiveFriendRequest, updateGroup } from '../socket/SocketInitEvents'
import { VoiceChannel } from '../../types/entities/VoiceChannel'

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
          },
          answer: null
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

export async function createGroupInviteAction (groupInviteInputData: GroupInviteInputData, currentUser: User, io: Server, em: EntityManager): Promise<GroupInvite> {
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

  sendReceiveFriendRequest(io, undefined, groupInvite)

  return groupInvite
}

export async function cancelGroupInviteAction (id: string, currentUser: User, em: EntityManager): Promise<GroupInvite> {
  const groupInvite = await em.findOneOrFail(GroupInvite, id, { populate: ['fromUser'] })

  if (currentUser.id !== groupInvite.fromUser.id) throw new UserInputError('NO_ACCESS')

  if (groupInvite.answer !== null) throw new UserInputError('Cannot cancel invite that has already been answered')

  em.assign(groupInvite, { canceled: true, updatedAt: new Date() })
  await em.flush()

  return groupInvite
}

export async function answerGroupInviteAction (id: string, answer: boolean, currentUser: User, io: Server, em: EntityManager): Promise<GroupInvite> {
  const groupInvite = await em.findOneOrFail(GroupInvite, id, { populate: ['toUser', 'fromUser', 'group.members'] })
  const user = await em.findOneOrFail(User, currentUser.id)

  const group = await em.findOneOrFail(Group, groupInvite.group.id, { populate: ['textChannels', 'members'] })

  if (user.id !== groupInvite.toUser.id) throw new UserInputError('NO_ACCESS')

  if (groupInvite.answer !== null) throw new UserInputError('Cannot answer invite that has already been answered')

  em.assign(groupInvite, { answer: answer, updatedAt: new Date() })

  if (answer) {
    await em.populate(user, ['groups'])
    group.members.add(user)
    for (const textChannel of group.textChannels) {
      textChannel.users.add(user)
    }
  }

  await em.flush()

  if (answer) {
    sendReceiveAnswerFriendRequest(io, undefined, undefined, groupInvite, group)
  }

  return groupInvite
}

export async function leaveGroupAction (id: string, currentUser: User, io: Server, em: EntityManager): Promise<boolean> {
  const group = await em.findOneOrFail(Group, id, { populate: ['members', 'textChannels', 'voiceChannels'] })

  if (!group.members.getItems().map(member => member.id).includes(currentUser.id)) throw new UserInputError('You are not a member of this group')
  const user = await em.findOneOrFail(User, currentUser.id)

  group.members.remove(user)
  for (const textChannel of group.textChannels) {
    textChannel.users.remove(user)
  }
  if (user.connectedVoiceChannel && group.voiceChannels.getItems().map(voiceChannel => voiceChannel.id).includes(user.connectedVoiceChannel.id)) {
    const voiceChannel = await em.findOneOrFail(VoiceChannel, user.connectedVoiceChannel.id)
    em.assign(user, { connectedVoiceChannel: null })
    await em.flush()
    disconnectUserFromVoiceChannel(voiceChannel, io)
  }

  await em.flush()

  updateGroup(user, group, io)

  return true
}
