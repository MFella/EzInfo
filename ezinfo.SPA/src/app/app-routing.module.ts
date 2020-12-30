import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddFileComponent } from './add-file/add-file.component';
import { FilesListComponent } from './files-list/files-list.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'files-list', component: FilesListComponent},
  {path: 'add-file', component: AddFileComponent},
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
