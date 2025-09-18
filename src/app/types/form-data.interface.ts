import { FormControl } from '@angular/forms';
import { UserRole } from './user-role.enum';

export interface FromDataInterface {
  name: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  dob: FormControl<string>;
  address: FormControl<string>;
  role: FormControl<UserRole>;
}
