import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole, UserStatus } from '../types/user.types';
import { USERS } from '../data/users-data';
import { Subject } from 'rxjs';

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

  setSearchText(text: string) {
    this.searchSubject.next(text);
  }

  getPaginatedUsers(
    page: number,
    itemsPerPage: number,
    status: UserStatus = 'all',
    role: UserRole | 'default' = 'default',
    searchText: string = ''
  ): { users: User[]; totalUsers: number } {
    let filtered = this.applyFilters(this.users, status, role, searchText);

    const totalUsers = filtered.length;
    const start = (page - 1) * itemsPerPage;
    const paginatedUsers = filtered.slice(start, start + itemsPerPage);

    return { users: paginatedUsers, totalUsers };
  }

  toggleActiveStatus(userId: string): void {
    const user = this.getUserById(userId);
    if (user) {
      user.isActive = !user.isActive;
      this.setUsersToLocalStorage();
    }
  }

  addUser(user: User): void {
    const newUser: User = {
      id: uuidv4(),
      ...user,
      isActive: user.isActive === 'true',
    };
    this.users = [newUser, ...this.users];
    this.setUsersToLocalStorage();
  }

  getUserById(userId: string): User | undefined {
    return this.users.find((user) => user.id === userId);
  }

  updateUser(userId: string, updatedUserData: User): void {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      this.users[index] = {
        ...this.users[index],
        ...updatedUserData,
        isActive: updatedUserData.isActive === 'true',
      };
      this.setUsersToLocalStorage();
    }
  }

  deleteUser(userId: string): void {
    const user = this.getUserById(userId);
    if (!user) {
      alert('User not found.');
      return;
    }
    if (user.isActive) {
      alert(`User "${user.name}" is active. Cannot delete.`);
      return;
    }
    if (confirm(`Are you sure you want to delete "${user.name}"?`)) {
      this.users = this.users.filter((u) => u.id !== userId);
      this.setUsersToLocalStorage();
    }
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

  private applyFilters(
    users: User[],
    status: UserStatus,
    role: UserRole | 'default',
    searchText: string
  ): User[] {
    let filtered = [...users];
    //Filter by active status
    if (status === 'active') filtered = filtered.filter((u) => u.isActive);
    else if (status === 'inactive')
      filtered = filtered.filter((u) => !u.isActive);
    // Filter by search text
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(lowerSearchText) ||
          u.email.toLowerCase().includes(lowerSearchText) ||
          u.phone.toLowerCase().includes(lowerSearchText)
      );
    }
    // Filter by role
    if (role && role !== 'default') {
      filtered = filtered.filter((u) => u.role === role);
    }
    return filtered;
  }
}
