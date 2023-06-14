import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { LoginCredsDto } from '../dtos/loginCredsDto';
import { UserForCreationDto } from '../dtos/userForCreationDto';
import { AlertService } from './alert.service';
import * as moment from 'moment';
import { delay, map, shareReplay, tap } from 'rxjs/operators';
import { LoggedUser } from '../types/user/loggedUser';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser: LoggedUser | null = null;

  constructor(private http: HttpClient, private alertServ: AlertService) {
    this.currentUser = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user') || '{}')
      : null;
  }

  register(userForCreationDto: UserForCreationDto) {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*');

    return this.http.post(
      environment.backUrl + 'auth/register',
      userForCreationDto,
      { headers }
    );
  }

  login(loginCredsDto: LoginCredsDto) {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.http
      .post(environment.backUrl + 'auth/login', loginCredsDto, { headers })
      .pipe(
        delay(1500),
        tap((r) => this.setSession(r)),
        shareReplay(),
        map((res: any) => {
          if (res.user) {
            this.currentUser = res.user;
          }

          return {
            res: res.res,
            name: res.user.name,
            msg: res.msg,
          };
        })
      );
  }

  checkLogin(login: string) {
    return this.http.get(
      environment.backUrl + `auth/availability?login=${login}`
    );
  }

  forgotPassword(email: string) {
    return this.http.post(environment.backUrl + 'auth/forgotPass', { email });
  }

  sendConfirmation(id: string) {
    return this.http.get(environment.backUrl + `auth/confirm?token=${id}`).pipe(
      delay(1500),
      tap((r: any) => this.setSession(r.token)),
      shareReplay(),
      map((res: any) => {
        if (res.token.user) {
          this.currentUser = res.token.user;
        }

        return {
          res: res.token.res,
          name: res.token.user.name,
          msg: res.token.msg,
        };
      })
    );
  }

  whoAmI() {
    return this.http.get(environment.backUrl + 'auth/who-am-I', {
      withCredentials: true,
    });
  }

  changePassword(password: string) {
    return this.http.post(environment.backUrl + 'auth/change', {
      password: password,
    });
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('user');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.clear();
    this.alertServ.info('You have been logged out!');
  }

  getCurrentUser(): LoggedUser | null {
    return this.currentUser;
  }

  private setSession(authRes: any) {
    this.currentUser = authRes.user;
    const expireDate = moment().add(authRes.expiresIn, 'second');
    localStorage.setItem('user', JSON.stringify(authRes.user));
    localStorage.setItem('id_token', authRes.access_token);
    localStorage.setItem('expires_at', JSON.stringify(expireDate.valueOf()));
  }
}
