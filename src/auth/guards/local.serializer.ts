import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";

import { UserService } from "src/user/user.service";
import { UserEntity, User } from "src/user/models/user.entity";

@Injectable()
export class LocalSerializer extends PassportSerializer {
  constructor(private readonly userService: UserService) {
    super();
  }

  serializeUser(user: UserEntity, done: CallableFunction): void {
    done(null, user.id);
  }

  async deserializeUser(userId: string, done: CallableFunction): Promise<User> {
    return await this.userService
      .findByIdOrFail(userId)
      .then(user => done(null, user))
      .catch(error => done(error));
  }
}
