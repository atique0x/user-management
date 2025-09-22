import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserFromDataInterface } from '../types/form-data.interface';
import { UserRoleEnum } from '../types/user-role.enum';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users.service';
import { UserInterface } from '../types/user.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { emailExistValidator } from '../validators/email-exist-validator';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'],
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup<UserFromDataInterface>;

  isUpdateMode = false;
  updateUserId?: string;
  updateUserData?: UserInterface;

  roles = Object.values(UserRoleEnum);

  constructor(
    private userService: UsersService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.updateUserId = userId;
      this.updateUserData = this.userService.getUserById(this.updateUserId);
      if (this.updateUserData) this.isUpdateMode = true;
    }
    this.userFormInit();
  }

  onUserFormSubmit() {
    if (this.userForm.invalid) return;

    const userToAdd: UserInterface = {
      id: this.userForm.controls.id.value,
      name: this.userForm.controls.name.value,
      email: this.userForm.controls.email.value,
      phone: this.userForm.controls.phone.value,
      dob: this.userForm.controls.dob.value,
      address: this.userForm.controls.address.value,
      role: this.userForm.controls.role.value,
      status: this.userForm.controls.status.value,
    };

    if (this.isUpdateMode && this.updateUserId) {
      this.userService.updateUser(this.updateUserId, userToAdd);
      this.router.navigate(['']);
      alert('✅ User updated successfully!');
    } else {
      this.userService.addUser(userToAdd);
      this.formReset();
      alert('✅ User added successfully!');
    }
  }

  private userFormInit(): void {
    const user: UserInterface = this.updateUserData ?? {
      id: uuidv4(),
      name: '',
      email: '',
      phone: '',
      dob: '',
      address: '',
      role: UserRoleEnum.Guest,
      status: false,
    };

    this.userForm = new FormGroup<UserFromDataInterface>({
      id: new FormControl(user.id, {
        nonNullable: true,
      }),
      name: new FormControl(user.name, {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3)],
      }),
      email: new FormControl(user.email, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.email,
          emailExistValidator(user.email),
        ],
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
  }
  private formReset(): void {
    this.userForm.reset();
    this.userForm.patchValue({
      role: UserRoleEnum.Guest,
    });
  }
}
