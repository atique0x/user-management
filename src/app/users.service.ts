import { USERS } from './data/users-data';
import { UserInterface } from './types/user.interface';
import { UserRoleEnum } from './types/user-role.enum';
import { StatusType } from './types/status.type';

export class UsersService {
  private users: UserInterface[] = [];

  constructor() {
    this.users = this.usersFromLocalStorage() || USERS;
    this.syncLocalStorage();
  }

  getPaginatedUsers(
    currentPage: number = 1,
    itemsPerPage: number = 10,
    role: UserRoleEnum | 'default' = 'default',
    status: StatusType = true,
    searchText: string = ''
  ): { users: UserInterface[]; totalUsers: number } {
    const lowerSearchText = searchText.toLowerCase();

    const filtered: UserInterface[] = this.users.filter(
      (user) =>
        user.status === status &&
        (user.name.toLowerCase().includes(lowerSearchText) ||
          user.email.toLowerCase().includes(lowerSearchText) ||
          user.phone.toLowerCase().includes(lowerSearchText)) &&
        (user.role === role || role === 'default')
    );

    const start = (currentPage - 1) * itemsPerPage;
    return {
      users: filtered.slice(start, start + itemsPerPage),
      totalUsers: filtered.length,
    };
  }

  getUserById(id: string): UserInterface | undefined {
    return this.users.find((user) => user.id === id);
  }

  addUser(newUser: UserInterface): void {
    this.users.unshift(newUser);
    this.syncLocalStorage();
  }

  updateUser(id: string, data: Partial<UserInterface>): void {
    const index: number = this.users.findIndex((user) => user.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...data };
      this.syncLocalStorage();
    }
  }

  toggleActiveStatus(id: string): void {
    const user = this.getUserById(id);
    if (user) user.status = !user.status;
    this.syncLocalStorage();
  }

  deleteUser(id: string): void {
    const index = this.users.findIndex((u) => u.id === id);
    if (index > -1) this.users.splice(index, 1);
    this.syncLocalStorage();
  }

  private syncLocalStorage(): void {
    localStorage.setItem('users', JSON.stringify(this.users));
  }

  private usersFromLocalStorage(): UserInterface[] {
    try {
      const usersData = localStorage.getItem('users');
      return usersData ? (JSON.parse(usersData) as UserInterface[]) : [];
    } catch {
      return [];
    }
  }
}
