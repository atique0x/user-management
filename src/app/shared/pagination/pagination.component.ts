import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
})
export class PaginationComponent implements OnInit {
  @Input() currentPage!: number;
  @Input() itemsPerPage: number = 10;
  @Input() totalPages!: number;
  @Output() pageChange = new EventEmitter<number>();

  constructor() {}

  ngOnInit(): void {}

  goPreviousPage(): void {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  goNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }
}
