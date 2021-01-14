import { Injectable } from '@angular/core';
import { text } from '@fortawesome/fontawesome-svg-core';
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

  about(title: string, text: string)
  {
    Swal.fire({
      title: title,
      showClass:{
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
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
          inputLabel: 'You email',
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


  }
}
