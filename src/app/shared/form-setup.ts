import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserInterface } from '../types/user.interface';
import { UserFromDataInterface } from '../types/form-data.interface';

export const formSetup = (user: UserInterface) => {
  return new FormGroup<UserFromDataInterface>({
    id: new FormControl(user.id, {
      nonNullable: true,
    }),
    name: new FormControl(user.name, {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    email: new FormControl(user.email, {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phone: new FormControl(user.phone, {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern('^01[346789][0-9]{8}$'),
      ],
    }),
    dob: new FormControl(user.dob, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    address: new FormControl(user.address, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    role: new FormControl(user.role, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    status: new FormControl(user.status, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
};
