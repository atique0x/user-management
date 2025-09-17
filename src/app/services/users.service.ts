import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { v4 as uuidv4 } from 'uuid';

import { USERS } from '../data/users-data';
import { User } from '../types/user.interface';
import { UserStatus } from '../types/user-status.type';
import { UserRole } from '../types/user-role.enum';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private users: User[] = [];
  private searchSubject = new Subject<string>();
  readonly search$ = this.searchSubject.asObservable();

  constructor() {
    const storedUsers = this.getUsersFromLocalStorage();
    this.users = storedUsers.length ? storedUsers : USERS;
    this.setUsersToLocalStorage();
  }

  getPaginatedUsers(
    page: number,
    itemsPerPage: number,
    status: UserStatus,
    role: UserRole | 'default',
    searchText: string = ''
  ): { users: User[]; totalUsers: number } {
    const filtered = this.applyFilters(status, role, searchText);

    const totalUsers = filtered.length;
    const start = (page - 1) * itemsPerPage;
    const paginatedUsers = filtered.slice(start, start + itemsPerPage);
    return { users: paginatedUsers, totalUsers };
  }

  getPageOfUser(
    userId: string,
    itemsPerPage: number,
    status: UserStatus,
    role: UserRole | 'default',
    searchText: string
  ): number {
    const filtered = this.applyFilters(status, role, searchText);

    const index = filtered.findIndex((u) => u.id === userId);
    if (index === -1) return 1;
    return Math.floor(index / itemsPerPage) + 1;
  }

  getUserById(userId: string): User | undefined {
    return this.users.find((user) => user.id === userId);
  }

  addUser(user: User): void {
    const newUser: User = { id: uuidv4(), ...user, isActive: false };
    this.users = [newUser, ...this.users];
    this.setUsersToLocalStorage();
  }

  updateUser(userId: string, updatedUserData: User): void {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updatedUserData };
      this.setUsersToLocalStorage();
    }
  }

  toggleActiveStatus(userId: string): void {
    const user = this.getUserById(userId);
    if (!user) return;
    if (!confirm(`Are you sure you want to change status for "${user.name}"?`))
      return;

    user.isActive = !user.isActive;
    this.setUsersToLocalStorage();
  }

  deleteUser(userId: string): void {
    const user = this.getUserById(userId);
    if (!user) return;
    if (confirm(`Are you sure you want to delete "${user.name}"?`)) {
      this.users = this.users.filter((u) => u.id !== userId);
      this.setUsersToLocalStorage();
    }
  }

  setSearchText(text: string) {
    this.searchSubject.next(text);
  }

  private applyFilters(
    status: UserStatus,
    role: UserRole | 'default',
    searchText: string
  ): User[] {
    let filtered = [...this.users];

    if (status === 'active') filtered = filtered.filter((u) => u.isActive);
    else if (status === 'inactive')
      filtered = filtered.filter((u) => !u.isActive);

    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(lowerSearchText) ||
          u.email.toLowerCase().includes(lowerSearchText) ||
          u.phone.toLowerCase().includes(lowerSearchText)
      );
    }

    if (role && role !== 'default') {
      filtered = filtered.filter((u) => u.role === role);
    }
    return filtered;
  }

  private setUsersToLocalStorage(): void {
    localStorage.setItem('users', JSON.stringify(this.users));
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
