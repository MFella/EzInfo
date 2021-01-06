import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';


@Injectable({
  providedIn: 'root'
})
export class SweetyService {

  constructor() { }

  success(id: string, msg: string)
  {
    Swal.fire(`Message retrieved`, msg, "success");
  }

  error(id: string, msg: string)
  {
    Swal.fire(`Cant retrieve message`, msg, 'error');
  }
}
