import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: {
        uid: true,
        email: true,
        first_name: true,
        last_name: true,
        password_hash: true,
      },
    });
  }

  async create(userData: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findOne(uid: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { uid },
      relations: {
        memberships: {
          organization: true,
          account: true,
          team: true,
        },
      },
    });
  }

  async update(uid: string, data: UpdateUserDto): Promise<User> {
    const user = await this.findOne(uid);
    if (!user) throw new NotFoundException(`User with UID ${uid} not found`);
    Object.assign(user, data);
    return this.usersRepository.save(user);
  }

  async remove(uid: string): Promise<void> {
    const result = await this.usersRepository.delete(uid);
    if (result.affected === 0)
      throw new NotFoundException(`User with UID ${uid} not found`);
  }
}
