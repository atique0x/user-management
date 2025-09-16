import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UsersService } from '../services/users.service';
import { User, UserRole } from '../types/user.types';
import { UserStatus } from '../types/user.types';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-display-users',
  templateUrl: './display-users.component.html',
  styleUrls: ['./display-users.component.css'],
})
export class DisplayUsersComponent implements OnInit {
  users: User[] = [];
  role: UserRole = UserRole.Default;

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  searchText: string = '';
  statusFilter: UserStatus = 'all';

  roles = Object.values(UserRole);

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
      this.role = params['role'] ? params['role'] : 'default';
      this.searchText = params['search'] || '';
      this.loadUsers();
    });

    this.usersService.search$
      .pipe(debounceTime(500))
      .subscribe((text: string) => {
        this.currentPage = 1;
        this.updateQueryParams({ page: 1, search: text });
      });
  }

  onPageChange(newPage: number): void {
    this.updateQueryParams({ page: newPage });
  }

  onItemsPerPageChange(): void {
    this.updateQueryParams({ limit: this.itemsPerPage });
  }

  onStatusFilterChange() {
    this.updateQueryParams({ status: this.statusFilter });
  }

  onRoleFiltered() {
    this.updateQueryParams({ role: this.role });
  }

  onSearchChange(): void {
    this.usersService.setSearchText(this.searchText);
  }

  onToggleActiveStatus(userId?: string): void {
    if (!userId) return;
    if (confirm('Are you sure you want to change active status?')) {
      this.usersService.toggleActiveStatus(userId);
      this.loadUsers();
    }
  }

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

  onAddUser(): void {
    this.router.navigate(['/edit-user']);
  }

  onUpdateUser(isActive: boolean, userId?: string): void {
    if (!userId) return;
    if (!isActive) {
      alert("User is inactive. Can't update user.");
      return;
    }
    this.router.navigate(['/edit-user', userId]);
  }

  private loadUsers(): void {
    const { users, totalUsers } = this.usersService.getPaginatedUsers(
      this.currentPage,
      this.itemsPerPage,
      this.statusFilter,
      this.role,
      this.searchText
    );

    this.totalPages = Math.max(Math.ceil(totalUsers / this.itemsPerPage), 1);

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
      this.updateQueryParams({ page: this.currentPage });
    }

    this.users = users;
  }

  private updateQueryParams(params: any): void {
    this.router.navigate([], {
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }
}
