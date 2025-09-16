import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../users.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../model/user.model';

@Component({
  selector: 'app-edit-users',
  templateUrl: './edit-users.component.html',
  styleUrls: ['./edit-users.component.css'],
})
export class EditUsersComponent implements OnInit {
  userForm!: FormGroup;

  isUpdateMode: boolean = false;
  updateUserId: string = '';
  updateUserData: User | undefined;

  constructor(
    private usersService: UsersService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.paramMap.get('id')) {
      this.updateUserId = this.route.snapshot.paramMap.get('id')!;
      this.updateUserData = this.usersService.getUsers.find(
        (user) => user.id === this.updateUserId
      );
      console.log(this.updateUserData);
      this.isUpdateMode = true;
    }
    this.userFormInit();
  }

  //----------------User Form Initialization------------------
  userFormInit() {
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

  //---------------Form Submission------------------
  onUserFormSubmit() {
    if (!this.isUpdateMode) {
      console.log(this.userForm.value);
      this.usersService.addUser(this.userForm.value);
      this.userForm.reset();
      this.userForm.patchValue({
        isActive: '',
      });
      alert('User added successfully!');
      this.router.navigate(['']);
    } else {
      this.usersService.updateUser(this.updateUserId, this.userForm.value);
      alert('User updated successfully!');
    }
  }
}
