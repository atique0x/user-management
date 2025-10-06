import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { UsersService } from '../users.service';
import { UserInterface } from '../types/user.interface';
import { StatusType } from '../types/status.type';
import { UserRoleEnum } from '../types/user-role.enum';

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

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UsersService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initQueryParams();
  }

  //-------- Pagination & Filtering --------
  onPageChange(page: number): void {
    this.updateQueryParams({ page });
  }

  handleStatusChange(status: StatusType) {
    this.updateQueryParams({ status });
  }

  handleRoleChange(role: UserRoleEnum | 'default') {
    this.updateQueryParams({ role });
  }

  handleItemsPerPageChange(limit: number) {
    this.updateQueryParams({ limit });
  }

  handleSearchChange(search: string) {
    this.updateQueryParams({ search });
  }

  //------------ User Action ------------
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
    this.loadUsers();
  }

  /**
   * Fetches paginated and filtered users from the service and updates the component state
   * This method:
   * 1. Gets paginated users based on current filters and pagination settings
   * 2. Calculates total pages based on total users and items per page
   * 3. Handles edge cases by adjusting current page if it's out of bounds
   * 4. Updates the users array in the component
   * @private
   * @returns {void}
   */
  private loadUsers(): void {
    const { users, totalUsers } = this.userService.getPaginatedUsers(
      this.currentPage,
      this.itemsPerPage,
      this.role,
      this.status,
      this.searchText
    );
    this.totalPages = Math.max(Math.ceil(totalUsers / this.itemsPerPage), 1);
    if (this.currentPage > this.totalPages)
      this.updateQueryParams({ page: this.totalPages });
    else if (this.currentPage < 1) this.updateQueryParams({ page: 1 });
    this.users = users;
  }

  /**
   * Initializes and manages URL query parameters for user list filtering and pagination
   * This method:
   * 1. Subscribes to route query parameter changes
   * 2. Extracts and validates page, limit, status, role and search parameters
   * 3. Updates component state only when parameters actually change
   * 4. Triggers user list reload when necessary
   * 5. Handles initial load state to ensure first data fetch
   *
   * Query Parameters:
   * - page: Current page number (default: 1)
   * - limit: Items per page (default: 10)
   * - status: User active status (true/false)
   * - role: User role filter ('default' or UserRoleEnum)
   * - search: Search text filter
   * @private
   */
  private initQueryParams() {
    let initialLoad = true;
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: Params) => {
        const page = +params['page'] || 1;
        const limit = +params['limit'] || 10;
        const status = params['status'] === 'false' ? false : true;
        const role = params['role'] || 'default';
        const search = params['search'] || '';

        let shouldReload = false;

        if (this.currentPage !== page) {
          this.currentPage = page;
          shouldReload = true;
        }
        if (this.itemsPerPage !== limit) {
          this.itemsPerPage = limit;
          shouldReload = true;
        }
        if (this.status !== status) {
          this.status = status;
          shouldReload = true;
        }
        if (this.role !== role) {
          this.role = role;
          shouldReload = true;
        }
        if (this.searchText !== search) {
          this.searchText = search;
          shouldReload = true;
        }

        if (shouldReload || initialLoad) {
          this.loadUsers();
          initialLoad = false;
        }
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
    this.destroy$.next();
    this.destroy$.complete();
  }
}
