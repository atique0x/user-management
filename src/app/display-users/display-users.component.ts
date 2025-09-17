import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UsersService } from '../services/users.service';
import { ItemsPerPage, User, UserRole } from '../types/user.types';
import { UserStatus } from '../types/user.types';
import { debounceTime, Subscription } from 'rxjs';

@Component({
  selector: 'app-display-users',
  templateUrl: './display-users.component.html',
  styleUrls: ['./display-users.component.css'],
})
export class DisplayUsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  role: UserRole | 'default' = 'default';
  itemsPerPageOptions: number[] = Object.values(ItemsPerPage).filter(
    (v) => typeof v === 'number'
  ) as number[];
  currentPage = 1;
  itemsPerPage: ItemsPerPage = ItemsPerPage.Ten;
  totalPages = 1;
  searchText: string = '';
  statusFilter: UserStatus = 'all';
  roles = Object.values(UserRole);
  private subscriptions: Subscription[] = [];

  constructor(
    private usersService: UsersService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log(this.roles);
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

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
