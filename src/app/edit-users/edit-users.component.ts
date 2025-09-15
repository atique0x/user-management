import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-edit-users',
  templateUrl: './edit-users.component.html',
  styleUrls: ['./edit-users.component.css'],
})
export class EditUsersComponent implements OnInit {
  userForm!: FormGroup;

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.userForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [
        Validators.required,
        Validators.pattern('^01[346789][0-9]{8}$'),
      ]),
      dob: new FormControl('', [Validators.required]),
      address: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      isActive: new FormControl('', [Validators.required]),
    });
  }

  onUserFormSubmit() {
    this.usersService.addUser(this.userForm.value);
    this.userForm.reset();
    this.userForm.patchValue({
      isActive: '',
    });

    alert('User added successfully!');
  }
}
