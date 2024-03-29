import { EntityManager } from '@mikro-orm/core'
import { VoiceChannelInputData } from '../../types/classes/input-data/VoiceChannelInputData'
import { AuthCustomContext } from '../../types/interfaces/CustomContext'
import { Arg, Ctx, Mutation, Resolver, Query } from 'type-graphql'
import { connectToVoiceChannelAction, createVoiceChannelAction, deleteVoiceChannelAction, disconnectFromVoiceChannelAction, getVoiceChannelByIdAction, kickFromVoiceChannelAction, updateVoiceChannelAction } from '../actions/VoiceChannelAction'
import { VoiceChannel } from '../../types/entities/VoiceChannel'
import { Server } from 'socket.io'

@Resolver()
export class VoiceChannelResolver {
  @Query(() => VoiceChannel)
  async getVoiceChannelById (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string
  ): Promise<VoiceChannel> {
    return await getVoiceChannelByIdAction(id, ctx.user, em)
  }

  @Mutation(() => Boolean)
  async createVoiceChannel (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('data') data: VoiceChannelInputData
  ): Promise<boolean> {
    return await createVoiceChannelAction(data, ctx.user, em)
  }

  @Mutation(() => Boolean)
  async updateVoiceChannel (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string,
      @Arg('data') data: VoiceChannelInputData
  ): Promise<boolean> {
    return await updateVoiceChannelAction(id, data, ctx.user, em)
  }

  @Mutation(() => Boolean)
  async deleteVoiceChannel (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string
  ): Promise<boolean> {
    return await deleteVoiceChannelAction(id, ctx.user, em)
  }

  @Mutation(() => Boolean, { description: 'Connects the current user to the voice channel. Also sends, via group room, the info that user connected to the channel' })
  async connectToVoiceChannel (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Ctx('io') io: Server,
      @Arg('id') id: string
  ): Promise<boolean> {
    return await connectToVoiceChannelAction(id, ctx.user, io, em)
  }

  @Mutation(() => Boolean, { description: 'Disconnects the current user from the voice channel. Also sends, via group room, the info that user left the channel' })
  async disconnectFromVoiceChannel (
    @Ctx('em') em: EntityManager,
      @Ctx('io') io: Server,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string
  ): Promise<boolean> {
    return await disconnectFromVoiceChannelAction(id, ctx.user, io, em)
  }

  @Mutation(() => Boolean, {
    description: 'Can only be used by owner of the group, and the user they\'re choosing has to be in the voice channel. Also sends, via group room, the info that user left the channel'
  })
  async kickFromVoiceChannel (
    @Ctx('em') em: EntityManager,
      @Ctx('io') io: Server,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string,
      @Arg('userId') userId: string
  ): Promise<boolean> {
    return await kickFromVoiceChannelAction(id, userId, ctx.user, io, em)
  }
}
