import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DisplayUsersComponent } from './display-users/display-users.component';
import { EditUsersComponent } from './edit-users/edit-users.component';

const routes: Routes = [
  { path: '', redirectTo: 'display-user', pathMatch: 'full' },
  { path: 'display-user', component: DisplayUsersComponent },
  { path: 'add-user', component: EditUsersComponent },
  { path: 'edit-user/:id', component: EditUsersComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
