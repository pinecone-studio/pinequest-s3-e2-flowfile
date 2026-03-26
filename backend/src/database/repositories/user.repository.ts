import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NewUser, UpdateUser } from 'src/shared/types/user.types';
import { users } from '../schema';
import { db } from '../client';

@Injectable()
export class UserRepository {
  async findById(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  async findByClerkUserId(clerkUserId: string) {
    return db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId),
    });
  }

  async findByEmail(email: string) {
    return db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async create(data: NewUser) {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async update(id: string, data: UpdateUser) {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deactivateUser(id: string) {
    const [user] = await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date().toISOString() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async activateUser(id: string) {
    const [user] = await db
      .update(users)
      .set({ isActive: true, updatedAt: new Date().toISOString() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async findAllByRole(role: 'teacher' | 'student') {
    return db.query.users.findMany({
      where: eq(users.role, role),
    });
  }
}
