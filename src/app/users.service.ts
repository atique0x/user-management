import { Injectable } from '@angular/core';
import { USERS } from './model/users-data';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private users = [...USERS];

  constructor() {}

  get getUsers() {
    return this.users;
  }

  toggleActiveStatus(userId: string) {
    const user = this.users.find((user) => user.id === userId);
    if (user) {
      user.isActive = !user.isActive;
    }
  }
}
