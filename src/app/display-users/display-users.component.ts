import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UsersService } from '../services/users.service';
import { debounceTime, Subscription } from 'rxjs';
import { User } from '../types/user.interface';
import { ItemsPerPage } from '../types/item-per-page.enum';
import { UserStatus } from '../types/user-status.type';
import { UserRole } from '../types/user-role.enum';

@Component({
  selector: 'app-display-users',
  templateUrl: './display-users.component.html',
  styleUrls: ['./display-users.component.css'],
})
export class DisplayUsersComponent implements OnInit, OnDestroy {
  users: User[] = [];

  itemsPerPageOptions: number[] = [];
  currentPage = 1;
  itemsPerPage: ItemsPerPage = ItemsPerPage.Ten;
  totalPages = 1;

  searchText = '';
  statusFilter: UserStatus = 'all';
  role: UserRole | 'default' = 'default';
  roles = Object.values(UserRole);

  private subscriptions: Subscription[] = [];

  constructor(
    private usersService: UsersService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.itemsPerPageOptions = Object.values(ItemsPerPage).filter(
      (v) => typeof v === 'number'
    ) as number[];

    const queryParamsSub = this.route.queryParams.subscribe(
      (params: Params) => {
        this.currentPage = params['page'] ? +params['page'] : 1;
        this.itemsPerPage = params['limit'] ? +params['limit'] : 10;
        this.statusFilter = params['status'] ? params['status'] : 'all';
        this.role = params['role'] ? params['role'] : 'default';
        this.searchText = params['search'] || '';
        this.loadUsers();
      }
    );
    this.subscriptions.push(queryParamsSub);

    const searchSub = this.usersService.search$
      .pipe(debounceTime(500))
      .subscribe((text: string) => {
        this.currentPage = 1;
        this.updateQueryParams({ page: 1, search: text });
      });
    this.subscriptions.push(searchSub);
  }

  onPageChange(newPage: number): void {
    this.updateQueryParams({ page: newPage });
  }

  onItemsPerPageChange(): void {
    this.updateQueryParams({ limit: this.itemsPerPage });
  }

  onStatusFilterChange(): void {
    this.updateQueryParams({ status: this.statusFilter });
  }

  onRoleFiltered(): void {
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

  onDeleteUser(userId?: string): void {
    if (!userId) return;
    this.usersService.deleteUser(userId);
    this.loadUsers();
  }

  onAddUser(): void {
    this.router.navigate(['/edit-user']);
  }

  onUpdateUser(userId?: string): void {
    if (!userId) return;
    const user = this.usersService.getUserById(userId);
    if (user && !user.isActive) {
      alert(`${user.name} is inactive, can't update.`);
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

  private updateQueryParams(
    params: Partial<{
      page: number;
      limit: number;
      status: UserStatus;
      role: UserRole | 'default';
      search: string;
    }>
  ): void {
    this.router.navigate([], {
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
