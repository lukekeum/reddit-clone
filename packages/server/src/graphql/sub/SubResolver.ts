import { Sub } from '@src/entities/sub/Sub'
import { Arg, Authorized, Ctx, Mutation, Resolver } from 'type-graphql'
import { Inject } from 'typedi'
import { GraphQLContext } from '../schema'
import { SubService } from './SubService'

@Resolver(() => Sub)
export class SubResolver {
  @Inject()
  private readonly subService: SubService

  @Mutation(() => Sub)
  @Authorized()
  async createSub(
    @Arg('name') name: string,
    @Ctx() { payload: { user } }: GraphQLContext
  ): Promise<Sub> {
    return this.subService.createSub(name, user?.id)
  }
}
