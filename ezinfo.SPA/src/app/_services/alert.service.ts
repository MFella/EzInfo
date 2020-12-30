import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

constructor(private toastr: ToastrService) { }

  success(msg: string)
  {
    this.toastr.success(msg, 'Success', {
      timeOut: 4000,
      positionClass: 'toast-bottom-left'
    });
  }

  error(msg: string)
  {
    this.toastr.error(msg, 'Error occured', {
      timeOut: 4000,
      positionClass: 'toast-bottom-right'
    });
  }

  info(msg: string)
  {
    this.toastr.info(msg, 'Info', {
      timeOut: 4000,
      positionClass: 'toast-bottom-left'
     // positionClass: 'toast-top-left'
     //positionClass: 'inline'
    })
  }

  warning(msg: string)
  {
    this.toastr.warning(msg, 'Warning', {
      timeOut: 4000,
      positionClass: 'toast-bottom-right'
    })
  }


}
