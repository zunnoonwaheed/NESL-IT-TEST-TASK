import { Injectable } from '@nestjs/common';
import { User, UserWithPassword } from '../../shared/types';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  private users: Map<string, UserWithPassword> = new Map();

  async createUser(
    email: string,
    username: string,
    password: string,
  ): Promise<User> {
    // Check if user already exists
    const existingUser = Array.from(this.users.values()).find(
      (u) => u.email === email || u.username === username,
    );

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error('Email already exists');
      }
      if (existingUser.username === username) {
        throw new Error('Username already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user: UserWithPassword = {
      id: this.generateId(),
      email,
      username,
      password: hashedPassword,
      createdAt: new Date(),
    };

    this.users.set(user.id, user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const user = Array.from(this.users.values()).find((u) => u.email === email);
    return user || null;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async validatePassword(
    user: UserWithPassword,
    password: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
