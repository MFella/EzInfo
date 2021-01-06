import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import { LoginCredsDto } from '../dtos/loginCredsDto';
import { UserForCreationDto } from '../dtos/userForCreationDto';
import { AlertService } from './alert.service';
import * as moment from 'moment';
import {map, shareReplay, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser: any;

  constructor(private http: HttpClient, private alertServ: AlertService) {

    this.currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}'): null;
   }

  register(userForCreationDto: UserForCreationDto)
  {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*');

    return this.http.post(environment.backUrl + 'auth/register', userForCreationDto, {headers});
  }

  login(loginCredsDto: LoginCredsDto)
  {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    return this.http.post(environment.backUrl + 'auth/login', loginCredsDto, {headers})
    .pipe(
      tap(r => this.setSession(r)),
      shareReplay(),
      map((res: any) =>
      {
        if(res.user)
        {
          this.currentUser = res.user;
        }

        return {
          res: res.res, 
          name: res.user.name, 
          msg: res.msg
        };
      })
    )
  }

  checkLogin(login: string)
  {
    return this.http.get(environment.backUrl + `auth/availability?login=${login}`);
  }

  private setSession(authRes: any)
  {

    this.currentUser = authRes.user;
    const expireDate = moment().add(authRes.expiresIn, 'second');
    localStorage.setItem('user', JSON.stringify(authRes.user));
    localStorage.setItem('id_token', authRes.access_token);
    localStorage.setItem('expires_at', JSON.stringify(expireDate.valueOf()));
  }

  logout()
  {
    this.currentUser = null;
    localStorage.removeItem('user');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    //just make sure, that everything is cleared
    localStorage.clear();
    this.alertServ.info('You have been logged out!');
  }

}
