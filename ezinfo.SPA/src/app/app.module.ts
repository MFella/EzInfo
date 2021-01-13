import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http'
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RegisterComponent } from './register/register.component';
import { FilesListComponent } from './files-list/files-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastNoAnimationModule, ToastrModule } from 'ngx-toastr';
import { AddFileComponent } from './add-file/add-file.component';
import { AuthInterceptor } from './_services/auth.interceptor';
import { AllNotesResolver } from './_resolvers/all-notes.resolver';
import {PaginationModule} from 'ngx-bootstrap/pagination';
import { AllFilesResolver } from './_resolvers/all-files.resolver';

@NgModule({
  declarations: [					
    AppComponent, 
      NavComponent,
      HomeComponent,
      RegisterComponent,
      FilesListComponent,
      AddFileComponent
   ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule, 
    FontAwesomeModule, 
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    PasswordStrengthMeterModule,
    PaginationModule.forRoot(),
    BrowserAnimationsModule, 
    ToastrModule.forRoot(),
  ], 
  providers: [
    AllNotesResolver,
    AllFilesResolver,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
