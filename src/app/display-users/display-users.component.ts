import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';

import { User } from '../types/user.interface';
import { ItemsPerPage } from '../types/item-per-page.enum';
import { UserStatus } from '../types/user-status.type';
import { UserRole } from '../types/user-role.enum';
import { UsersService } from '../services/users.service';
import { emailExistValidator } from '../validators/email-exist-validator';
import { FromDataInterface } from '../types/form-data.interface';

@Component({
  selector: 'app-display-users',
  templateUrl: './display-users.component.html',
  styleUrls: ['./display-users.component.css'],
})
export class DisplayUsersComponent implements OnInit, OnDestroy {
  users: User[] = [];

  currentPage = 1;
  itemsPerPage: ItemsPerPage = ItemsPerPage.Ten;
  totalPages = 1;

  searchText: string = '';
  statusFilter: UserStatus = 'active';
  role: UserRole | 'default' = 'default';
  markedUserId?: string;

  searchControl = new FormControl('');
  roles: UserRole[] = Object.values(UserRole);
  private subscriptions: Subscription[] = [];

  editRowForm!: FormGroup<FromDataInterface>;
  editingRowIndex: number | null = null;

  constructor(
    private usersService: UsersService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initSearchSubscription();
    this.initQueryParamsSubscription();
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

  onSearchChange(val: string | null): void {
    this.currentPage = 1;
    this.updateQueryParams({ page: 1, search: val || '' });
  }

  onAddUser(): void {
    this.router.navigate(['/add-user']);
  }

  onInlineEdit(i: number) {
    this.editingRowIndex = i;
    const user = this.users[i];
    if (!user) return;
    this.initForm(user);
  }

  onSaveInlineEdit() {
    if (!this.editRowForm.valid || this.editingRowIndex === null) return;
    const updatedUser = {
      ...this.users[this.editingRowIndex],
      ...this.editRowForm.value,
    };
    this.usersService.updateUser(updatedUser.id!, updatedUser);
    this.loadUsers();
    this.editingRowIndex = null;
  }

  onCancelInlineEdit() {
    this.editingRowIndex = null;
  }

  onUpdateUser(userId?: string): void {
    if (!userId) return;
    this.router.navigate(['/edit-user', userId]);
  }

  onDeleteUser(userId?: string): void {
    if (!userId) return;
    const user = this.usersService.getUserById(userId);
    if (!user) return;
    if (!confirm(`Are you sure you want to delete "${user.name}"?`)) return;

    this.usersService.deleteUser(userId);
    this.loadUsers();
  }

  onToggleActiveStatus(userId?: string): void {
    if (!userId) return;
    const user = this.usersService.getUserById(userId);
    if (!user) return;
    if (
      !confirm(
        `Are you sure you want to ${
          user.isActive ? 'deactivate' : 'activate'
        } "${user.name}"?`
      )
    )
      return;
    this.usersService.toggleActiveStatus(userId);

    this.markedUserId = userId;
    this.onTogglePageChange(this.markedUserId);
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

  private onTogglePageChange(userId?: string) {
    if (!userId) return;

    const user: User | undefined = this.usersService.getUserById(userId);
    if (!user) return;

    this.statusFilter = user.isActive ? 'active' : 'inactive';
    const page = this.usersService.getPageOfUser(
      userId,
      this.itemsPerPage,
      this.statusFilter,
      this.role,
      this.searchText
    );
    this.updateQueryParams({ status: this.statusFilter, page });

    setTimeout(() => {
      this.markedUserId = undefined;
    }, 5000);
  }

  private initSearchSubscription() {
    const searchSub = this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((val: string | null) => {
        this.onSearchChange(val);
      });
    this.subscriptions.push(searchSub);
  }

  private initQueryParamsSubscription() {
    const queryParamsSub = this.route.queryParams.subscribe(
      (params: Params) => {
        this.currentPage = params['page'] ? +params['page'] : 1;
        this.itemsPerPage = params['limit'] ? +params['limit'] : 10;
        this.statusFilter = params['status'] ? params['status'] : 'active';
        this.role = params['role'] ? params['role'] : 'default';
        this.searchText = params['search'] || '';

        this.searchControl.setValue(this.searchText, { emitEvent: false });
        this.loadUsers();
      }
    );
    this.subscriptions.push(queryParamsSub);
  }

  private initForm(user: User) {
    this.editRowForm = new FormGroup({
      name: new FormControl(user.name, {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3)],
      }),
      email: new FormControl(user.email, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.email,
          emailExistValidator(user.email),
        ],
      }),
      phone: new FormControl(user.phone, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern('^01[346789][0-9]{8}$'),
        ],
      }),
      dob: new FormControl(user.dob, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      address: new FormControl(user.address, {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3)],
      }),
      role: new FormControl(user.role, {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
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
