import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";

import { LocalAuthGuard } from "src/auth/guards/local-auth.guard";
import { CurrentUser } from "src/auth/decorators/currentUser.decorator";
import { ContextGql } from "src/auth/decorators/contextGql.decorator";
import { MutationResponse } from "src/shared/models/MutationResponse.model";

import { UserService } from "./user.service";
import { UserEntity, User } from "./models/user.entity";

@Resolver(() => UserEntity)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User)
  @UseGuards(LocalAuthGuard)
  me(@CurrentUser() user: User) {
    return user;
  }

  @Mutation(() => User)
  async login(
    @Args("email") email: string,
    @Args("password") password: string,
    @ContextGql() context: any
  ): Promise<User> {
    const { user } = await context.authenticate("graphql-local", {
      email,
      password
    });
    await context.login(user);
    return user;
  }

  @Mutation(() => Boolean)
  async logout(@ContextGql() context: any): Promise<boolean> {
    try {
      const request = context.req;
      if (request.logout) {
        request.logout();
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }

  @Mutation(() => MutationResponse)
  async register(
    @Args("email") email: string,
    @Args("password") password: string
  ): Promise<MutationResponse> {
    return await this.userService.register({ email, password });
  }
}
