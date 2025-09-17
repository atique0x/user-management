import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { User } from '../types/user.interface';
import { UserRole } from '../types/user-role.enum';

@Component({
  selector: 'app-edit-users',
  templateUrl: './edit-users.component.html',
  styleUrls: ['./edit-users.component.css'],
})
export class EditUsersComponent implements OnInit {
  userForm!: FormGroup;

  isUpdateMode = false;
  updateUserId = '';
  updateUserData?: User;

  roles = Object.values(UserRole);

  constructor(
    private usersService: UsersService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.updateUserId = userId;
      this.updateUserData = this.usersService.getUserById(this.updateUserId);
      if (this.updateUserData) this.isUpdateMode = true;
    }
    this.userFormInit();
  }

  onUserFormSubmit(): void {
    if (this.userForm.invalid) return;

    if (this.isUpdateMode && this.updateUserId) {
      this.usersService.updateUser(this.updateUserId, this.userForm.value);
      this.router.navigate(['']);
      alert('✅ User updated successfully!');
    } else {
      this.usersService.addUser(this.userForm.value);
      this.formReset();
      alert('✅ User added successfully!');
    }
  }

  private userFormInit(): void {
    const data = this.updateUserData ?? {
      name: '',
      email: '',
      phone: '',
      dob: '',
      address: '',
      role: UserRole.Guest,
    };

    this.userForm = new FormGroup({
      name: new FormControl(data.name, [
        Validators.required,
        Validators.minLength(3),
      ]),
      email: new FormControl(data.email, [
        Validators.required,
        Validators.email,
      ]),
      phone: new FormControl(data.phone, [
        Validators.required,
        Validators.pattern('^01[346789][0-9]{8}$'),
      ]),
      dob: new FormControl(data.dob, [Validators.required]),
      address: new FormControl(data.address, [
        Validators.required,
        Validators.minLength(3),
      ]),
      role: new FormControl(data.role, [Validators.required]),
    });
  }

  private formReset(): void {
    this.userForm.reset();
    this.userForm.patchValue({
      role: UserRole.Guest,
    });
  }
}
