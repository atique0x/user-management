import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DisplayUsersComponent } from './display-users/display-users.component';
import { EditUsersComponent } from './edit-users/edit-users.component';

const routes: Routes = [
  { path: '', component: DisplayUsersComponent },
  { path: 'edit-user', component: EditUsersComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
