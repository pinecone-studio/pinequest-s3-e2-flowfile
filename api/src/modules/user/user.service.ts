import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from 'src/database/repositories/user.repository';
import { NewUser, UpdateUser, UserRole } from 'src/shared/types/user.types';
import type { AuthenticatedUser } from 'src/modules/auth/interfaces/authenticated-user.interface';

interface ClerkUserPayload {
  clerkUserId: string;
  email: string;
  name: string;
  imageUrl?: string | null;
  role?: UserRole;
}

interface DevUserPayload {
  id: string;
  clerkUserId: string;
  email: string;
  name: string;
  imageUrl?: string | null;
  role?: UserRole;
}

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getById(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getByIdForUser(id: string, requester: AuthenticatedUser) {
    if (requester.id !== id) {
      throw new ForbiddenException('You can only access your own user profile');
    }

    return this.getById(id);
  }

  async getByClerkUserId(clerkUserId: string) {
    const user = await this.userRepository.findByClerkUserId(clerkUserId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findAllByRole(role: UserRole) {
    return this.userRepository.findAllByRole(role);
  }

  async updateUser(id: string, data: UpdateUser, requester: AuthenticatedUser) {
    if (requester.id !== id) {
      throw new ForbiddenException('You can only update your own user profile');
    }

    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    return this.userRepository.update(id, data);
  }

  async activateUser(id: string) {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    return this.userRepository.activateUser(id);
  }

  async deactivateUser(id: string) {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    return this.userRepository.deactivateUser(id);
  }

  async findOrCreateFromClerk(payload: ClerkUserPayload) {
    const existingUser = await this.userRepository.findByClerkUserId(
      payload.clerkUserId,
    );

    if (existingUser) {
      return this.userRepository.update(existingUser.id, {
        email: payload.email,
        name: payload.name,
        imageUrl: payload.imageUrl ?? null,
      });
    }

    const now = new Date().toISOString();

    const newUser: NewUser = {
      id: crypto.randomUUID(),
      clerkUserId: payload.clerkUserId,
      email: payload.email,
      name: payload.name,
      imageUrl: payload.imageUrl ?? null,
      role: payload.role ?? 'student',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    return this.userRepository.create(newUser);
  }

  async findOrCreateDevUser(payload: DevUserPayload) {
    const existingUser = await this.userRepository.findById(payload.id);

    if (existingUser) {
      return this.userRepository.update(existingUser.id, {
        clerkUserId: payload.clerkUserId,
        email: payload.email,
        name: payload.name,
        imageUrl: payload.imageUrl ?? null,
        role: payload.role ?? existingUser.role,
      });
    }

    const now = new Date().toISOString();

    const newUser: NewUser = {
      id: payload.id,
      clerkUserId: payload.clerkUserId,
      email: payload.email,
      name: payload.name,
      imageUrl: payload.imageUrl ?? null,
      role: payload.role ?? 'student',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    return this.userRepository.create(newUser);
  }
}
