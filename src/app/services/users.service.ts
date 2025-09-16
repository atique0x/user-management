import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../types/user.types';
import { USERS, UserStatus } from '../data/users-data';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private users: User[] = [];

  constructor() {
    const storedUsers = this.getUsersFromLocalStorage();
    this.users = storedUsers.length ? storedUsers : USERS;
    this.setUsersToLocalStorage(this.users);
  }

  //--------------- Get users with pagination, filter------------------
  getPaginatedUsers(
    page: number,
    itemsPerPage: number,
    status: UserStatus = 'all'
  ): { users: User[]; totalUsers: number } {
    //Filtered Users
    let filtered = [...this.users];
    if (status === 'active') filtered = filtered.filter((u) => u.isActive);
    else if (status === 'inactive')
      filtered = filtered.filter((u) => !u.isActive);

    //Paginated Users
    const totalUsers = filtered.length;
    const start = (page - 1) * itemsPerPage;
    const paginatedUsers = filtered.slice(start, start + itemsPerPage);

    return { users: paginatedUsers, totalUsers };
  }

  //--------------- Toggle User Active Status------------------
  toggleActiveStatus(userId: string): void {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      this.users[index] = {
        ...this.users[index],
        isActive: !this.users[index].isActive,
      };
      this.setUsersToLocalStorage(this.users);
    }
  }

  addUser(user: User): void {
    const newUser: User = {
      id: uuidv4(),
      ...user,
      isActive: user.isActive,
    };

    this.users = [newUser, ...this.users];
    this.setUsersToLocalStorage(this.users);
  }

  updateUser(userId: string, updatedUserData: User): void {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updatedUserData };
      this.setUsersToLocalStorage(this.users);
    }
  }

  deleteUser(userId: string): void {
    this.users = this.users.filter((user) => user.id !== userId);
    this.setUsersToLocalStorage(this.users);
  }

  //Remove Future
  get getUsers(): User[] {
    return [...this.users];
  }

  getUserById(userId: string): User | undefined {
    return this.users.find((user) => user.id === userId);
  }

  private setUsersToLocalStorage(users: User[]): void {
    localStorage.setItem('users', JSON.stringify(users));
  }

  private getUsersFromLocalStorage(): User[] {
    try {
      const usersData = localStorage.getItem('users');
      return usersData ? (JSON.parse(usersData) as User[]) : [];
    } catch {
      return [];
    }
  }
}
