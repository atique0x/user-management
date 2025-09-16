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
    const activity = String(isActive) === 'true' ? true : false;
    const newUser: User = {
      id: uuidv4(),
      name,
      email,
      phone,
      dob,
      address,
      isActive: activity,
    };
    this.users.unshift(newUser);
    this.setUsersToLocalStorage(this.users);
  }

  deleteUser(userId: string) {
    this.users = this.users.filter((user) => user.id !== userId);
    this.setUsersToLocalStorage(this.users);
  }

  updateUser(userId: string, updatedUserData: User) {
    const user = this.users.find((user) => user.id === userId);
    if (user) {
      user.name = updatedUserData.name;
      user.email = updatedUserData.email;
      user.phone = updatedUserData.phone;
      user.dob = updatedUserData.dob;
      user.address = updatedUserData.address;
      user.isActive = updatedUserData.isActive;
      this.setUsersToLocalStorage(this.users);
    }
  }
}
