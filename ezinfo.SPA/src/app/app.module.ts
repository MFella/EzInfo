import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import {HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS} from '@angular/common/http'
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
import { ResetWaitComponent } from './reset-wait/reset-wait.component';
import { NgxSpinnerModule } from "ngx-spinner";
import { NgxLoadingXModule } from 'ngx-loading-x';
import { CookieService } from 'ngx-cookie-service';



@NgModule({
  declarations: [							
    AppComponent, 
      NavComponent,
      HomeComponent, 
      RegisterComponent, 
      FilesListComponent,
      AddFileComponent,
      ResetWaitComponent,
      ResetWaitComponent
   ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule, 
    FontAwesomeModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'XSRF-TOKEN',
      headerName: 'XSRF-TOKEN'
    }),
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
    CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
