import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';
import {
  HttpClientModule,
  HttpClientXsrfModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { FilesListComponent } from './files-list/files-list.component';
import { CommonModule } from '@angular/common';
import { AddFileComponent } from './add-file/add-file.component';
import { AuthInterceptor } from './_services/auth.interceptor';
import { AllNotesResolver } from './_resolvers/all-notes.resolver';
import { AllFilesResolver } from './_resolvers/all-files.resolver';
import { ResetWaitComponent } from './reset-wait/reset-wait.component';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    RegisterComponent,
    FilesListComponent,
    AddFileComponent,
    ResetWaitComponent,
    ResetWaitComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'XSRF-TOKEN',
      headerName: 'XSRF-TOKEN',
    }),
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    // PaginationModule.forRoot(),
    PasswordStrengthMeterModule.forRoot(),
    BrowserAnimationsModule,
    // ToastrModule.forRoot(),
  ],
  providers: [
    AllNotesResolver,
    AllFilesResolver,
    //CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
