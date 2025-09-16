export interface User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  role?: UserRole;
  isActive: boolean;
}

export type UserStatus = 'all' | 'active' | 'inactive';

export enum UserRole {
  Default = 'default',
  Admin = 'admin',
  Guest = 'guest',
  Moderator = 'moderator',
  Editor = 'editor',
  Subscriber = 'subscriber',
}
