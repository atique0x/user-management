import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { User } from '../types/user.types';

@Component({
  selector: 'app-edit-users',
  templateUrl: './edit-users.component.html',
  styleUrls: ['./edit-users.component.css'],
})
export class EditUsersComponent implements OnInit {
  userForm!: FormGroup;

  isUpdateMode: boolean = false;

  updateUserId: string | null = null;
  updateUserData?: User;

  constructor(
    private usersService: UsersService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.updateUserId = this.route.snapshot.paramMap.get('id');
    if (this.updateUserId) {
      this.updateUserData = this.usersService.getUserById(this.updateUserId);
      if (this.updateUserData) this.isUpdateMode = true;
    }
    this.userFormInit();
  }

  // Form Submission
  onUserFormSubmit(): void {
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

  // User Form Initialization
  private userFormInit(): void {
    this.userForm = new FormGroup({
      name: new FormControl(this.updateUserData?.name, [
        Validators.required,
        Validators.minLength(3),
      ]),
      email: new FormControl(this.updateUserData?.email, [
        Validators.required,
        Validators.email,
      ]),
      phone: new FormControl(this.updateUserData?.phone, [
        Validators.required,
        Validators.pattern('^01[346789][0-9]{8}$'),
      ]),
      dob: new FormControl(this.updateUserData?.dob, [Validators.required]),
      address: new FormControl(this.updateUserData?.address, [
        Validators.required,
        Validators.minLength(3),
      ]),
      isActive: new FormControl(this.updateUserData?.isActive || '', [
        Validators.required,
      ]),
    });
  }

  private formReset(): void {
    this.userForm.reset();
    this.userForm.patchValue({
      isActive: '',
    });
  }
}
