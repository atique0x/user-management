import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';
import { User } from '../model/user.model';

@Component({
  selector: 'app-display-users',
  templateUrl: './display-users.component.html',
  styleUrls: ['./display-users.component.css'],
})
export class DisplayUsersComponent implements OnInit {
  constructor(private usersService: UsersService) {}
  users: User[] = this.usersService.getUsers;
  pagedUsers: User[] = [];
  usersPerPage = 10;
  searchText: string = '';

  currentPage: number = 1;
  totalPage = Math.ceil(this.users.length / this.usersPerPage);
  totalPagesArray: number[] = [];

  ngOnInit(): void {
    // console.log(this.totalPage);
    this.getPagedUsers();
    for (let i = 1; i <= this.totalPage; i++) {
      this.totalPagesArray.push(i);
    }
    // console.log(this.totalPagesArray);
  }

  //Pagination Logic
  getPagedUsers() {
    const startUserIndex = (this.currentPage - 1) * this.usersPerPage;
    const endUserIndex = startUserIndex + this.usersPerPage;
    this.pagedUsers = this.users.slice(startUserIndex, endUserIndex);
    // console.log(this.pagedUsers);
  }

  goPreviousPage() {
    // console.log('Clicked Previous');
    this.currentPage--;
    this.getPagedUsers();
  }

  goToPage(pageNumber: number) {
    this.currentPage = pageNumber;
    this.getPagedUsers();
  }

  goNextPage() {
    // console.log('Clicked Next');
    this.currentPage++;
    this.getPagedUsers();
  }

  onUsersPerPageChange() {
    this.currentPage = 1;
    this.totalPage = Math.ceil(this.users.length / this.usersPerPage);

    this.totalPagesArray = [];
    for (let i = 1; i <= this.totalPage; i++) {
      this.totalPagesArray.push(i);
    }
    this.getPagedUsers();
  }

  //Search Logic
  onSearchChange() {
    // console.log(this.searchText);
    if (this.searchText.trim() === '') {
      this.users = this.usersService.getUsers;
    } else {
      this.users = this.usersService.getUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
          user.email.toLowerCase().includes(this.searchText.toLowerCase()) ||
          user.phone.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
    this.currentPage = 1;
    this.totalPage = Math.ceil(this.users.length / this.usersPerPage);

    this.totalPagesArray = [];
    for (let i = 1; i <= this.totalPage; i++) {
      this.totalPagesArray.push(i);
    }
    this.getPagedUsers();
  }

  onToggleActiveStatus(userId: string) {
    this.usersService.toggleActiveStatus(userId);
  }
}
