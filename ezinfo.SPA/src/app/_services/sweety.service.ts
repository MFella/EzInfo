import { Injectable } from '@angular/core';
import { text } from '@fortawesome/fontawesome-svg-core';
import { repeat } from 'rxjs/operators';
import Swal, { SweetAlertResult } from 'sweetalert2';


@Injectable({
  providedIn: 'root'
})
export class SweetyService {

  constructor() { }

  success(id: string, msg: string)
  {
    //Swal.fire(`Message retrieved`, msg, "success");
    Swal.fire({
      title: 'Message retrieved',
      text: msg,
      icon: 'success',
      showClass: {
        popup: 'animate__animated animate__rotateIn'
      },
      hideClass: {
        popup: 'animate__animated animate__rotateOut'
      }
    })
  
  }

  error(id: string, msg: string)
  {
    //Swal.fire(`Cant retrieve message`, msg, 'error');
    Swal.fire({
      title: 'Message retrieved',
      text: msg,
      icon: 'error',
      showClass: {
        popup: 'animate__animated animate__zoomInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__rollOut'
      }
    })
  }

  about(title: string, text: string)
  {
    Swal.fire({
      title: title,
      showClass:{
        popup: 'animate__animated animate__flipInY'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutDownBig'
      },
      showCloseButton: true,
      showConfirmButton: true,
      text: text
    })
  }

  async forgot()
  {
   const value =  await Swal.fire({
        icon: 'question',
        title: 'Did you forget your password?',
        text: `That's happen sometimes, its usual thing. 
        Just write down your email. We will send you mail
        with recovery link.`,
        showClass: {
          popup: 'animate__animated animate__jackInTheBox'
        },
        hideClass: {
          popup: 'animate__animated animate__flipOutX'
        },
          input: 'text',
          inputLabel: 'Your email',
          inputPlaceholder: 'e.g. example@gmail.com',
          showCancelButton: true,
          showCloseButton: true,
          // inputValidator: (value) =>
          // {
          //   if(!value)
          //   {
          //     return 'Yyou need to write something';
          //   }
          // }

        
    })
    return value;
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
        For sure, passwords must match.</p>`+
        '<input type="password" id="password_for_reset" class="swal2-input" placeholder="Password">' + 
        '<input type="password" id="repeatPassword_for_reset" class="swal2-input" placeholder="Repeat Password">',
      showCancelButton: true,
      showCloseButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Change password',
      showClass: {
        popup: 'animate__animated animate__fadeInTopLeft'
      },
      hideClass: {
        popup: 'animate__animated animate__bounceOutLeft'
      }
    });

    const password = (<HTMLInputElement>document.querySelector('input#password_for_reset')).value;
    const repeat_password = (<HTMLInputElement>document.querySelector('input#repeatPassword_for_reset')).value;
    console.log(password);
    console.log(repeat_password);

    //return [value, password, repeat_password];
    return value;
  }
}
