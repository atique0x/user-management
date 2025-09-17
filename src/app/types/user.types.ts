export interface User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  role?: UserRole;
  isActive: boolean | string;
}

export type UserStatus = 'all' | 'active' | 'inactive';

export enum UserRole {
  Admin = 'admin',
  Guest = 'guest',
  Moderator = 'moderator',
  Editor = 'editor',
  Subscriber = 'subscriber',
}

export enum ItemsPerPage {
  Five = 5,
  Ten = 10,
  Fifteen = 15,
  Twenty = 20,
}
