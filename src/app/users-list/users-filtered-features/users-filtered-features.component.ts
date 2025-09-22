import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';

import { StatusType } from 'src/app/types/status.type';
import { UserRoleEnum } from 'src/app/types/user-role.enum';

@Component({
  selector: 'app-users-filtered-features',
  templateUrl: './users-filtered-features.component.html',
  styleUrls: ['./users-filtered-features.component.css'],
})
export class UsersFilteredFeaturesComponent implements OnInit, OnDestroy {
  @Output() statusFilterChanged = new EventEmitter<StatusType>();
  @Output() roleFilterChanged = new EventEmitter<UserRoleEnum | 'default'>();
  @Output() itemPerPageFilterChanged = new EventEmitter<number>();
  @Output() searchChanged = new EventEmitter<string>();

  roles: UserRoleEnum[] = Object.values(UserRoleEnum);

  statusFilter: StatusType = true;
  itemsPerPageFilter: number = 10;
  roleFilter: UserRoleEnum | 'default' = 'default';

  searchControl = new FormControl();

  private searchSub?: Subscription;
  private queryParamsSub?: Subscription;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.searchSub = this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((val) => this.searchChanged.emit(val));

    this.queryParamsSub = this.route.queryParams.subscribe((params: Params) => {
      const limit = Number(params['limit']);
      this.itemsPerPageFilter = !isNaN(limit) && limit > 0 ? limit : 10;
      if (params['status'] === 'true') {
        this.statusFilter = true;
      } else if (params['status'] === 'false') {
        this.statusFilter = false;
      } else {
        this.statusFilter = true;
      }
      this.roleFilter = params['role'] ? params['role'] : 'default';
      this.searchControl.setValue(params['search']);
    });
  }

  onAddUser() {
    this.router.navigate(['add-user']);
  }

  onStatusFilterChange() {
    this.statusFilterChanged.emit(this.statusFilter);
  }

  onRoleFilterChange() {
    this.roleFilterChanged.emit(this.roleFilter);
  }

  onItemsPerPageFilterChange() {
    this.itemPerPageFilterChanged.emit(this.itemsPerPageFilter);
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
    this.queryParamsSub?.unsubscribe();
  }
}
