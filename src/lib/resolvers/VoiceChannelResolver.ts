import { EntityManager } from '@mikro-orm/core'
import { VoiceChannelInputData } from 'src/types/classes/input-data/VoiceChannelInputData'
import { AuthCustomContext } from 'src/types/interfaces/CustomContext'
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import { connectToVoiceChannelAction, createVoiceChannelAction, deleteVoiceChannelAction, disconnectFromVoiceChannelAction, disconnectOtherUserAction, updateVoiceChannelAction } from '../actions/VoiceChannelAction'

@Resolver()
export class VoiceChannelResolver {
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
      @Arg('id') id: string
  ): Promise<boolean> {
    return await connectToVoiceChannelAction(id, ctx.user, ctx.io, em)
  }

  @Mutation(() => Boolean, { description: 'Disconnects the current user from the voice channel. Also sends, via group room, the info that user left the channel' })
  async disconnectFromVoiceChannel (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string
  ): Promise<boolean> {
    return await disconnectFromVoiceChannelAction(id, ctx.user, ctx.io, em)
  }

  @Mutation(() => Boolean, {
    description: 'Can only be used by owner of the group, and the user they\'re choosing has to be in the voice channel. Also sends, via group room, the info that user left the channel'
  })
  async disconnectOtherUser (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string,
      @Arg('userId') userId: string
  ): Promise<boolean> {
    return await disconnectOtherUserAction(id, userId, ctx.user, ctx.io, em)
  }
}
