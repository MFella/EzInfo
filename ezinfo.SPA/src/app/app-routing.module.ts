import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddFileComponent } from './add-file/add-file.component';
import { FilesListComponent } from './files-list/files-list.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './_guards/auth.guard';
import { AllFilesResolver } from './_resolvers/all-files.resolver';
import { AllNotesResolver } from './_resolvers/all-notes.resolver';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'files-list', component: FilesListComponent, canActivate: [AuthGuard],
    resolve: {
      notes: AllNotesResolver,
      files: AllFilesResolver
    }},
  {path: 'add-file', component: AddFileComponent, canActivate: [AuthGuard]},
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
