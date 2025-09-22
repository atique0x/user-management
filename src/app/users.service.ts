import { USERS } from './data/users-data';
import { UserInterface } from './types/user.interface';
import { UserRoleEnum } from './types/user-role.enum';
import { StatusType } from './types/status.type';

export class UsersService {
  private users: UserInterface[] = [];

  constructor() {
    const storedUsers: UserInterface[] = this.getUsersFromLocalStorage();
    this.users = storedUsers.length ? storedUsers : USERS;
    this.setUsersToLocalStorage();
  }

  getPaginatedUsers(
    currentPage: number,
    itemsPerPage: number,
    role: UserRoleEnum | 'default',
    status: StatusType,
    searchText: string
  ): { users: UserInterface[]; totalUsers: number } {
    const filtered: UserInterface[] = this.applyFilters(
      role,
      status,
      searchText
    );
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = filtered.slice(start, start + itemsPerPage);
    return { users: paginatedUsers, totalUsers: filtered.length };
  }

  getUserById(userId: string): UserInterface | undefined {
    return this.users.find((user) => user.id === userId);
  }

  addUser(newUser: UserInterface): void {
    this.users = [newUser, ...this.users];
    this.setUsersToLocalStorage();
  }

  updateUser(userId: string, updatedUserData: Partial<UserInterface>): void {
    const index: number = this.users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updatedUserData };
      this.setUsersToLocalStorage();
    }
  }

  toggleActiveStatus(userId: string): void {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      this.users[index] = {
        ...this.users[index],
        status: !this.users[index].status,
      };
      this.setUsersToLocalStorage();
    }
  }

  deleteUser(userId: string): void {
    this.users = this.users.filter((u) => u.id !== userId);
    this.setUsersToLocalStorage();
  }

  private applyFilters(
    role: UserRoleEnum | 'default',
    status: StatusType,
    searchText: string
  ): UserInterface[] {
    let filtered: UserInterface[] = [...this.users];

    if (status === true) filtered = filtered.filter((u) => u.status);
    else if (status === false) filtered = filtered.filter((u) => !u.status);

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

  private getUsersFromLocalStorage(): UserInterface[] {
    try {
      const usersData = localStorage.getItem('users');
      return usersData ? (JSON.parse(usersData) as UserInterface[]) : [];
    } catch {
      return [];
    }
  }
}
