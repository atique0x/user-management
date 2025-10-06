import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';

import { ActivatedRoute, Params, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

import { StatusType } from 'src/app/types/status.type';
import { UserRoleEnum } from 'src/app/types/user-role.enum';

@Component({
  selector: 'app-users-filtered-features',
  templateUrl: './users-filtered-features.component.html',
  styleUrls: ['./users-filtered-features.component.css'],
})
export class UsersFilteredFeaturesComponent implements OnInit, OnDestroy {
  @Output() statusChange = new EventEmitter<StatusType>();
  @Output() roleChange = new EventEmitter<UserRoleEnum | 'default'>();
  @Output() itemPerPageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();

  roles: UserRoleEnum[] = Object.values(UserRoleEnum);

  status: StatusType = true;
  itemPerPage: number = 10;
  role: UserRoleEnum | 'default' = 'default';
  searchText: string = '';

  private searchSubject$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.initSearch();
    this.initQueryParams();
  }

  onAddUser() {
    this.router.navigate(['add-user']);
  }

  onStatusChange() {
    this.statusChange.emit(this.status);
  }

  onRoleChange() {
    this.roleChange.emit(this.role);
  }

  onItemPerPageChange() {
    this.itemPerPageChange.emit(this.itemPerPage);
  }

  onSearchChange() {
    this.searchSubject$.next(this.searchText);
  }

  /**
   * Initializes search functionality with debouncing

   * Sets up a subscription to handle search text changes with:
   * - 500ms debounce time to reduce API calls
   * - Distinct until changed to avoid duplicate searches
   * - Automatic cleanup on component destroy
   *
   * Emits the search value through searchChange EventEmitter
   * when the debounced search value changes
   */
  private initSearch() {
    this.searchSubject$
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => {
        this.searchChange.emit(value);
      });
  }

  /**
   * Initializes component state from URL query parameters
   * Subscribes to route query parameters and updates the component's filter states:
   * - itemPerPage: Number of items to display per page (default: 10)
   * - status: User active status filter (default: true)
   * - role: User role filter (default: 'default')
   * - searchText: Search query filter (default: '')
   * The subscription is automatically cleaned up on component destroy via takeUntil
   */
  private initQueryParams() {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: Params) => {
        this.itemPerPage = +params['limit'] || 10;
        this.status = params['status'] === 'false' ? false : true;
        this.role = params['role'] || 'default';
        this.searchText = params['search'] || '';
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
