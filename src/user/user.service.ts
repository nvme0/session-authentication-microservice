import { Injectable, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { v4 as uuid } from "uuid";
import * as yup from "yup";
import { hash } from "bcryptjs";

import { AppModule } from "src/app.module";

import { MutationResponse } from "src/shared/models/MutationResponse.model";
import { formatYupError } from "src/utils/formatYupErrors";

import { UserEntity, User } from "./models/user.entity";
import { emailTaken } from "src/utils/errorMessages";

const schema = yup.object().shape({
  email: yup
    .string()
    .min(3)
    .max(255)
    .email()
    .required(),
  password: yup
    .string()
    .min(7)
    .max(255)
    .required()
});

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>
  ) {}

  async findById(id: string): Promise<User | undefined> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!!user) {
      const { password, ...result } = user;
      return result;
    }
    return undefined;
  }

  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.userRepo.findOneOrFail({ where: { id } });
    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!!user) {
      const { password, ...result } = user;
      return result;
    }
    return undefined;
  }

  async findForAuth(email: string): Promise<UserEntity | undefined> {
    return await this.userRepo.findOne({ where: { email } });
  }

  async update(id: string, data: Partial<UserEntity>) {
    const { id: userId, email, password, ...userData } = data;
    await this.userRepo.update({ id }, { ...userData });
    return await this.findById(id);
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const user = await this.findById(id);
    if (user) {
      await this.userRepo.delete(user.id);
      return { deleted: true };
    }
    return { deleted: false };
  }

  async register({
    email,
    password
  }: {
    email: string;
    password: string;
  }): Promise<MutationResponse> {
    try {
      await schema.validate({ email, password }, { abortEarly: false });
    } catch (error) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        errors: formatYupError(error)
      };
    }

    if (await this.exists(email)) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        errors: emailTaken
      };
    }

    const newUser = new UserEntity();
    newUser.id = uuid();
    newUser.email = email;
    newUser.password = await hash(password, 12);
    newUser.createdAt = new Date();
    newUser.updatedAt = new Date();

    await this.userRepo.save(newUser);

    return {
      status: HttpStatus.CREATED,
      errors: [],
      payload: `${AppModule.host}:${AppModule.port}/user/confirm`
    };
  }

  async confirmEmail(email: string): Promise<boolean> {
    await this.userRepo.update({ email }, { confirmed: true });
    const user = await this.findByEmail(email);
    if (!!user) {
      return user.confirmed;
    }
    return false;
  }

  async exists(email: string): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { email },
      select: ["id"]
    });
    return !!user;
  }
}
