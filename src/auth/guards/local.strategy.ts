import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { GraphQLLocalStrategy } from "graphql-passport";
import { hash, compare } from "bcryptjs";

import { invalidLogin, emailNotConfirmed } from "src/utils/errorMessages";
import { UserService } from "src/user/user.service";
import { User } from "src/user/models/user.entity";

@Injectable()
export class LocalStrategy extends PassportStrategy(GraphQLLocalStrategy) {
  constructor(private readonly userService: UserService) {
    super(async (email, password, done) => {
      const userEntity = await this.userService.findForAuth(email);

      let error: HttpException | null;

      if (!userEntity) {
        error = new HttpException(invalidLogin, HttpStatus.UNAUTHORIZED);
      } else if (!userEntity.confirmed) {
        error = new HttpException(emailNotConfirmed, HttpStatus.UNAUTHORIZED);
      } else if (
        !(await this.comparePasswords(password, userEntity.password))
      ) {
        error = new HttpException(invalidLogin, HttpStatus.UNAUTHORIZED);
      } else {
        error = null;
      }

      done(error, userEntity);
    });
  }

  async hashPassword(password: string): Promise<string> {
    return await hash(password, 12);
  }

  async comparePasswords(
    password: string,
    passwordHash: string
  ): Promise<boolean> {
    return await compare(password, passwordHash);
  }
}
