import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { UserRoleEnum } from './user-role.enum';
import { StatusType } from './status.type';

export interface UserFromDataInterface {
  id: FormControl<string>;
  name: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  dob: FormControl<string>;
  address: FormControl<string>;
  role: FormControl<UserRoleEnum>;
  status: FormControl<StatusType>;
  additional?: FormArray<FormGroup<AdditionalFormDataInterFace>>;
}

export interface AdditionalFormDataInterFace {
  key: FormControl<string>;
  value: FormControl<string>;
}
