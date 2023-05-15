import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertService } from '../_services/alert.service';
import { AuthService } from '../_services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard  {

  constructor(private authServ: AuthService, private alert: AlertService, private router: Router){}

  canActivate(): boolean {

    if(this.authServ.currentUser !== null)
    {
      return true;
    }
    
    this.alert.error('You are not allowed to do this');
    this.router.navigate(['/']);

    return false;
  }
  
}
