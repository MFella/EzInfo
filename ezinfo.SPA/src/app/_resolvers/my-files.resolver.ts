import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AlertService } from '../_services/alert.service';
import { FileService } from '../_services/file.service';

@Injectable({
  providedIn: 'root'
})
export class MyFilesResolver implements Resolve<boolean> {

  constructor(private router: Router, private alert: AlertService, 
    private fileServ: FileService){}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

    // return this.fileServ.retrieveNotes()
    //   .pipe(
    //     catchError(err =>
    //       {
    //         this.alert.error('Problem occured during retriving data');
    //         this.router.navigate(['']);
    //         return of(null);
    //       })
    //   )


    return of(true);
  }
}
