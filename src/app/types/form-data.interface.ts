import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { UserRole } from './user-role.enum';

export interface ExtraColumnFormInterface {
  name: FormControl<string>;
  value: FormControl<string>;
}

export interface FromDataInterface {
  id?: FormControl<string>;
  name: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  dob: FormControl<string>;
  address: FormControl<string>;
  role: FormControl<UserRole>;
  isActive?: FormControl<boolean>;
  extraColumns?: FormArray<FormGroup<ExtraColumnFormInterface>>;
}
