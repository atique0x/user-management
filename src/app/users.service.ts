import { Injectable } from '@angular/core';
import { USERS } from './model/users-data';
import { User } from './model/user.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor() {
    if (!localStorage.getItem('users')) {
      this.setUsersToLocalStorage();
    }
  }
  setUsersToLocalStorage(users: User[] = USERS) {
    localStorage.setItem('users', JSON.stringify(users));
  }

  getUsersFromLocalStorage = (): User[] => {
    const usersData = localStorage.getItem('users');
    return usersData ? JSON.parse(usersData) : [];
  };

  private users: User[] = this.getUsersFromLocalStorage();

  get getUsers() {
    return this.users;
  }

  toggleActiveStatus(userId: string) {
    const user = this.users.find((user) => user.id === userId);
    if (user) {
      user.isActive = !user.isActive;
      this.setUsersToLocalStorage(this.users);
    }
  }

  addUser(user: User) {
    const { name, email, phone, dob, address, isActive } = user;
    const newUser: User = {
      id: uuidv4(),
      name,
      email,
      phone,
      dob,
      address,
      isActive: isActive,
    };
    this.users.unshift(newUser);
    this.setUsersToLocalStorage(this.users);
  }

  deleteUser(userId: string) {
    this.users = this.users.filter((user) => user.id !== userId);
    this.setUsersToLocalStorage(this.users);
  }
}
