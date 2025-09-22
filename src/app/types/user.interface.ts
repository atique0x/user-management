import { StatusType } from './status.type';
import { UserRoleEnum } from './user-role.enum';

export interface UserInterface {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  role: UserRoleEnum;
  status: StatusType;
  additional?: { key: string; value: string }[];
}
