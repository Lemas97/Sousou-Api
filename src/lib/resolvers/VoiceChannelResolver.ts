import { EntityManager } from '@mikro-orm/core'
import { VoiceChannelInputData } from 'src/types/classes/input-data/VoiceChannelInputData'
import { AuthCustomContext } from 'src/types/interfaces/CustomContext'
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import { connectToVoiceChannelAction, createVoiceChannelAction, deleteVoiceChannelAction, disconnectFromVoiceChannelAction, updateVoiceChannelAction } from '../actions/VoiceChannelAction'

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

  @Mutation(() => Boolean)
  async connectToVoiceChannel (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string
  ): Promise<boolean> {
    return await connectToVoiceChannelAction(id, ctx.user, em)
  }

  @Mutation(() => Boolean)
  async disconnectFromVoiceChannel (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string
  ): Promise<boolean> {
    return await disconnectFromVoiceChannelAction(id, ctx.user, em)
  }
}
