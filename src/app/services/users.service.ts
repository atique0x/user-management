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
    this.setUsersToLocalStorage(this.users);
  }

  setSearchText(text: string) {
    this.searchSubject.next(text);
  }

  //--------------- Get users---------------
  getPaginatedUsers(
    page: number,
    itemsPerPage: number,
    status: UserStatus = 'all',
    role: UserRole = UserRole.Default,
    searchText: string
  ): { users: User[]; totalUsers: number } {
    let filtered = [...this.users];

    //Activity Users
    if (status === 'active') filtered = filtered.filter((u) => u.isActive);
    else if (status === 'inactive')
      filtered = filtered.filter((u) => !u.isActive);

    //Search
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(lowerSearchText) ||
          u.email.toLowerCase().includes(lowerSearchText) ||
          u.phone.toLowerCase().includes(lowerSearchText)
      );
    }

    //Search by Role
    if (role && role !== UserRole.Default) {
      filtered = filtered.filter((u) => u.role === role);
    }

    //Paginated Users
    const totalUsers = filtered.length;
    const start = (page - 1) * itemsPerPage;
    const paginatedUsers = filtered.slice(start, start + itemsPerPage);

    return { users: paginatedUsers, totalUsers };
  }

  //--------------- Toggle User Active Status------------------
  toggleActiveStatus(userId: string): void {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.isActive = !user.isActive;
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

  getUserById(userId: string): User | undefined {
    return this.users.find((user) => user.id === userId);
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
