import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../users.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-users',
  templateUrl: './edit-users.component.html',
  styleUrls: ['./edit-users.component.css'],
})
export class EditUsersComponent implements OnInit {
  userForm!: FormGroup;
  isUpdateMode: boolean = false;
  userId: string = '';

  constructor(
    private usersService: UsersService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.paramMap.get('id')) {
      this.userId = this.route.snapshot.paramMap.get('id')!;
      this.isUpdateMode = true;
    }

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
    if (!this.isUpdateMode) {
      this.usersService.addUser(this.userForm.value);
      this.userForm.reset();
      this.userForm.patchValue({
        isActive: '',
      });

      alert('User added successfully!');
    } else {
    }
  }
}
