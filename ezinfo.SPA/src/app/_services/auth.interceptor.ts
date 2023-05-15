import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { AlertService } from './alert.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authServ: AuthService,
    private router: Router,
    private alert: AlertService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const idToken = localStorage.getItem('id_token');
    const csrf = localStorage.getItem('XSRF-TOKEN');
    // console.log(csrf);

    if (idToken) {
      const cloned = request.clone({
        //headers: request.headers.set('Authorization', 'Bearer ' + idToken, 'XSRF-TOKEN', csrf)
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + idToken,
        }),
      });

      return next.handle(cloned).pipe(
        catchError((response: HttpErrorResponse) => {
          if (
            response instanceof HttpErrorResponse &&
            response.status === 401
          ) {
            this.router.navigate(['']);
            this.authServ.logout();
            this.alert.error('Session expired - try to log in again');
          }

          return throwError(response);
        })
      );
    } else if (csrf) {
      console.log('WITH CSRF');
      const cloned = request.clone({
        //headers: request.headers.set('XSRF-TOKEN', 'vf1jHsBd-OCHOi_qHB232NQpgbCR9IverZhI')
        withCredentials: true,
        headers: new HttpHeaders({
          'XSRF-TOKEN': csrf,
          //'Cookie': '_csrf=' + csrf
        }),
      });

      return next.handle(cloned).pipe(
        catchError((response: HttpErrorResponse) => {
          if (
            response instanceof HttpErrorResponse &&
            response.status === 403
          ) {
            this.router.navigate(['']);
          }

          return throwError(response);
        })
      );
    } else {
      return next.handle(request);
    }
  }
}
