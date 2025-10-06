import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
  Input,
} from '@angular/core';

import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

import { StatusType } from 'src/app/types/status.type';
import { UserRoleEnum } from 'src/app/types/user-role.enum';

@Component({
  selector: 'app-users-filtered-features',
  templateUrl: './users-filtered-features.component.html',
  styleUrls: ['./users-filtered-features.component.css'],
})
export class UsersFilteredFeaturesComponent implements OnInit, OnDestroy {
  @Input() status: StatusType = true;
  @Input() itemPerPage: number = 10;
  @Input() role: UserRoleEnum | 'default' = 'default';
  @Input() searchText: string = '';

  @Output() statusChange = new EventEmitter<StatusType>();
  @Output() roleChange = new EventEmitter<UserRoleEnum | 'default'>();
  @Output() itemPerPageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();

  roles: UserRoleEnum[] = Object.values(UserRoleEnum);

  private searchSubject$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initSearch();
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
