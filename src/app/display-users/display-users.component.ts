import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UsersService } from '../services/users.service';
import { User } from '../types/user.types';
import { UserStatus } from '../data/users-data';

@Component({
  selector: 'app-display-users',
  templateUrl: './display-users.component.html',
  styleUrls: ['./display-users.component.css'],
})
export class DisplayUsersComponent implements OnInit {
  users: User[] = [];

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  statusFilter: UserStatus = 'all';
  searchText: string = '';

  constructor(
    private usersService: UsersService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.currentPage = params['page'] ? +params['page'] : 1;
      this.itemsPerPage = params['limit'] ? +params['limit'] : 10;
      this.statusFilter = params['status'] ? params['status'] : 'all';
      this.loadUsers();
    });
  }

  //-------------------Page Change Logic---------------------
  onPageChange(newPage: number): void {
    this.router.navigate([], {
      queryParams: { page: newPage },
      queryParamsHandling: 'merge',
    });
  }

  //-------------------Items Per Page Change Logic---------------------
  onItemsPerPageChange(): void {
    this.router.navigate([], {
      queryParams: {
        limit: this.itemsPerPage,
      },
      queryParamsHandling: 'merge',
    });
  }

  //-------------------Status Filter Logic---------------------
  onStatusFilterChange() {
    this.router.navigate([], {
      queryParams: {
        status: this.statusFilter,
      },
      queryParamsHandling: 'merge',
    });
  }

  onSearchChange(): void {
    // if (this.searchText.trim() === '') {
    //   this.users = this.usersService.getUsers;
    // } else {
    //   this.users = this.usersService.getUsers.filter(
    //     (user) =>
    //       user.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
    //       user.email.toLowerCase().includes(this.searchText.toLowerCase()) ||
    //       user.phone.toLowerCase().includes(this.searchText.toLowerCase())
    //   );
    // }
  }

  //-------------- User Active Status Logic--------------
  onToggleActiveStatus(userId?: string): void {
    if (!userId) return;
    this.usersService.toggleActiveStatus(userId);
    this.loadUsers();
  }

  //------------------User Delete Logic--------------------
  onDeleteUser(isActive: boolean, userId?: string): void {
    if (!userId) return;

    if (isActive) {
      alert("User is active. Doesn't remove user.");
      return;
    }

    if (confirm('Are you sure you want to delete this user?')) {
      this.usersService.deleteUser(userId);
      this.loadUsers();
    }
  }

  //------------------User Add Logic--------------------
  onAddUser(): void {
    this.router.navigate(['/edit-user']);
  }

  //----------------- User Update Logic-------------------
  onUpdateUser(isActive: boolean, userId?: string): void {
    if (!userId) return;
    if (!isActive) {
      alert("User is inactive. Can't update user.");
      return;
    }
    this.router.navigate(['/edit-user', userId]);
  }

  //------------------- Load Users Logic-------------------
  private loadUsers(): void {
    const { users, totalUsers } = this.usersService.getPaginatedUsers(
      this.currentPage,
      this.itemsPerPage,
      this.statusFilter
    );
    this.totalPages = Math.ceil(totalUsers / this.itemsPerPage);

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
      this.router.navigate([], {
        queryParams: { page: this.currentPage },
        queryParamsHandling: 'merge',
      });
    }

    this.users = users;
  }
}
