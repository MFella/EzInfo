import { AlertService } from './alert.service';
import { Injectable } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { FileService } from './file.service';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SweetyService {
  constructor() {}

  success(id: string, msg: string) {
    //Swal.fire(`Message retrieved`, msg, "success");
    Swal.fire({
      title: 'Message retrieved',
      text: msg,
      icon: 'success',
      showClass: {
        popup: 'animate__animated animate__rotateIn',
      },
      hideClass: {
        popup: 'animate__animated animate__rotateOut',
      },
    });
  }

  error(id: string, msg: string) {
    //Swal.fire(`Cant retrieve message`, msg, 'error');
    Swal.fire({
      title: 'Message retrieved',
      text: msg,
      icon: 'error',
      showClass: {
        popup: 'animate__animated animate__zoomInDown',
      },
      hideClass: {
        popup: 'animate__animated animate__rollOut',
      },
    });
  }

  about(title: string, text: string) {
    Swal.fire({
      title: title,
      showClass: {
        popup: 'animate__animated animate__flipInY',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutDownBig',
      },
      showCloseButton: true,
      showConfirmButton: true,
      html: text,
    });
  }

  async forgot() {
    const value = await Swal.fire({
      icon: 'question',
      title: 'Did you forget your password?',
      text: `That's happen sometimes, its usual thing. 
        Just write down your email. We will send you mail
        with recovery link.`,
      showClass: {
        popup: 'animate__animated animate__jackInTheBox',
      },
      hideClass: {
        popup: 'animate__animated animate__flipOutX',
      },
      input: 'text',
      inputLabel: 'Your email',
      inputPlaceholder: 'e.g. example@gmail.com',
      showCancelButton: true,
      showCloseButton: true,
    });
    return value;
  }

  async confirm(
    itemId: string,
    preConfirmCb: (code: string) => void
  ): Promise<boolean> {
    const value = await Swal.fire({
      title: 'Enter destruction code',
      text: 'XYYY-XYYY-XYYY => XXX',
      input: 'text',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      preConfirm: preConfirmCb,
    });

    return value.isConfirmed;
  }

  async changePassword(): Promise<SweetAlertResult> {
    const value = await Swal.fire({
      title: 'Reset your password',
      text: `Remember about the restrictions associated with passwords.
      Password length must be greater than 7, contains at least one number and one special sign.
      Passwords should match.`,
      focusConfirm: false,
      inputLabel: 'Password',
      html:
        `<p class="text-center">Remember about the restrictions associated with passwords.
        Password length must be greater than 7, contains at least one number and one special sign.
        For sure, passwords must match.</p>` +
        '<input type="password" id="password_for_reset" class="swal2-input" placeholder="Password">' +
        '<input type="password" id="repeatPassword_for_reset" class="swal2-input" placeholder="Repeat Password">',
      showCancelButton: true,
      showCloseButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Change password',
      showClass: {
        popup: 'animate__animated animate__fadeInTopLeft',
      },
      hideClass: {
        popup: 'animate__animated animate__bounceOutLeft',
      },
    });

    //return [value, password, repeat_password];
    return value;
  }
}
