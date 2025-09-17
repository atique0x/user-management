import { UserRole } from './user-role.enum';

export interface User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  role: UserRole;
  isActive: boolean;
}
