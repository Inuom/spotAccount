import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password_hash'>> {
    const { email, name, password, role } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password_hash,
        role: role as Role,
        is_active: true,
      },
    });

    // Return user without password_hash
    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password_hash'>;
  }

  async findAll(role?: Role, is_active?: boolean): Promise<Omit<User, 'password_hash'>[]> {
    const where: any = {};
    
    if (role !== undefined) {
      where.role = role;
    }
    
    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return users.map(({ password_hash, ...user }) => user as Omit<User, 'password_hash'>);
  }

  async findOne(id: string): Promise<Omit<User, 'password_hash'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password_hash'>;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password_hash'>> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Update user
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        role: updateUserDto.role as Role,
      },
    });

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password_hash'>;
  }

  async remove(id: string): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async validatePassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    
    if (!user || !user.is_active) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
