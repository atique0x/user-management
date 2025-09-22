import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { PaginationComponent } from './shared/pagination/pagination.component';
import { NavbarComponent } from './navbar/navbar.component';
import { UsersService } from './users.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsersListComponent } from './users-list/users-list.component';
import { UsersFilteredFeaturesComponent } from './users-list/users-filtered-features/users-filtered-features.component';
import { UsersDisplayTableComponent } from './users-list/users-display-table/users-display-table.component';
import { UserFormComponent } from './user-form/user-form.component';

@NgModule({
  declarations: [
    AppComponent,
    PaginationComponent,
    NavbarComponent,
    UsersListComponent,
    UsersFilteredFeaturesComponent,
    UsersDisplayTableComponent,
    UserFormComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule],
  providers: [UsersService],
  bootstrap: [AppComponent],
})
export class AppModule {}
