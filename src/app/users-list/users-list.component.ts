import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { UsersService } from '../users.service';
import { UserInterface } from '../types/user.interface';
import { StatusType } from '../types/status.type';
import { UserRoleEnum } from '../types/user-role.enum';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css'],
})
export class UsersListComponent implements OnInit {
  users: UserInterface[] = [];

  status: StatusType = true;
  role: UserRoleEnum | 'default' = 'default';
  searchText: string = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  private queryParamsSub?: Subscription;

  constructor(
    private userService: UsersService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initQueryParamsSubscription();
    this.loadUsers();
  }

  //--------------- Pagination & Filtering ---------------
  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.updateQueryParams({ page: newPage });
  }

  handleStatusChange(status: StatusType) {
    this.status = status;
    this.updateQueryParams({ status: status });
  }

  handleRoleChange(role: UserRoleEnum | 'default') {
    this.role = role;
    this.updateQueryParams({ role: role });
  }

  handleItemsPerPageChange(item: number) {
    this.itemsPerPage = item;
    this.updateQueryParams({ limit: item });
  }

  handleSearchChange(searchText: string) {
    this.searchText = searchText;
    this.updateQueryParams({ search: searchText });
  }

  //------------------ User Action -------------------
  handleUserDelete(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId);
      this.loadUsers();
    }
  }

  handleToggleStatus(userId: string) {
    if (confirm(`Are you sure you want to change user status?`)) {
      this.userService.toggleActiveStatus(userId);
      this.loadUsers();
    }
  }

  handleUpdateUser(userId: string) {
    if (confirm(`Are you sure you want to update user information?`))
      this.router.navigate(['update-user', userId]);
    this.loadUsers();
  }

  handleBulkFieldUpdate(userData: {
    id: string;
    updatedData: Partial<UserInterface>;
  }) {
    this.userService.updateUser(userData.id, userData.updatedData);
    if (userData.updatedData.role) {
      this.loadUsers();
    }
  }

  private loadUsers(): void {
    const { totalUsers, users } = this.userService.getPaginatedUsers(
      this.currentPage,
      this.itemsPerPage,
      this.role,
      this.status,
      this.searchText
    );

    this.totalPages = Math.max(Math.ceil(totalUsers / this.itemsPerPage), 1);

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
      this.updateQueryParams({ page: this.currentPage });
    } else if (this.currentPage < 1) {
      this.currentPage = 1;
      this.updateQueryParams({ page: 1 });
    }

    this.users = [...users];
  }

  private initQueryParamsSubscription() {
    this.queryParamsSub = this.route.queryParams.subscribe((params: Params) => {
      const page = Number(params['page']);
      const limit = Number(params['limit']);

      this.currentPage = !isNaN(page) && page > 0 ? page : 1;
      this.itemsPerPage =
        !isNaN(limit) && limit > 0 ? limit : this.itemsPerPage;

      if (params['status'] === 'true') {
        this.status = true;
      } else if (params['status'] === 'false') {
        this.status = false;
      } else {
        this.status = true;
      }
      this.role = params['role'] ? params['role'] : 'default';
      this.searchText = params['search'];
      this.loadUsers();
    });
  }

  private updateQueryParams(
    params: Partial<{
      page: number;
      limit: number;
      status: StatusType;
      role: UserRoleEnum | 'default';
      search: string | null;
    }>
  ): void {
    this.router.navigate([], {
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }

  ngOnDestroy() {
    this.queryParamsSub?.unsubscribe();
  }
}
