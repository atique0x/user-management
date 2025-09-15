import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-display-users',
  templateUrl: './display-users.component.html',
  styleUrls: ['./display-users.component.css'],
})
export class DisplayUsersComponent implements OnInit {
  constructor(private usersService: UsersService) {}
  users = this.usersService.getUsers;

  ngOnInit(): void {}
}
