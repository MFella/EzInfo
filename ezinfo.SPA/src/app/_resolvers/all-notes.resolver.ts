import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AlertService } from '../_services/alert.service';
import { FileService } from '../_services/file.service';
import { Note } from '../types/item/note';

@Injectable({
  providedIn: 'root',
})
export class AllNotesResolver {
  constructor(
    private router: Router,
    private alert: AlertService,
    private fileServ: FileService
  ) {}

  resolve(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<Array<Note> | null> {
    return this.fileServ.retrieveNotes().pipe(
      catchError((err) => {
        this.alert.error('Problem occured during retriving data');
        this.router.navigate(['']);
        return of(null);
      })
    );
  }
}
