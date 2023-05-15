import { Injectable } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AlertService } from '../_services/alert.service';
import { FileService } from '../_services/file.service';

@Injectable({
  providedIn: 'root'
})
export class AllFilesResolver  {

  constructor(private router: Router, private alert: AlertService, 
    private fileServ: FileService){}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>  {

    return this.fileServ.retrieveFiles()
      .pipe(
        catchError(err =>
          {
            this.alert.error('Problem occured during retriving data');
            this.router.navigate(['']);
            return of(null);
          })
      )
  }
}
