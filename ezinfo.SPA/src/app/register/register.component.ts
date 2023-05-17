import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../_services/alert.service';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm!: UntypedFormGroup;
  availability: boolean = false;
  password!: string;

  constructor(
    private fb: UntypedFormBuilder,
    private authServ: AuthService,
    private alertServ: AlertService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    //Validators.pattern(/^[A-Za-z0-9]+$/)
    this.registerForm = this.fb.group(
      {
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(16),
            Validators.pattern(/^[A-Za-z]+$/),
          ],
        ],
        surname: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(32),
            Validators.pattern(/^[A-Za-z]+$/),
          ],
        ],
        email: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
            ),
          ],
        ],
        login: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[A-Za-z]+$/),
            Validators.minLength(6),
            Validators.maxLength(20),
          ],
        ],
        pesel: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[0-9]+$/),
            Validators.minLength(11),
            Validators.maxLength(11),
          ],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/
            ),
          ],
        ],
        repeatPassword: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/
            ),
          ],
        ],
      },
      { validators: [this.passMatch, this.checkPeselValidation] }
    );
  }

  passMatch(fg: UntypedFormGroup) {
    return fg.get('password')!.value === fg.get('repeatPassword')!.value
      ? null
      : {
          mismatchPassword: true,
        };
  }

  checkPeselValidation(fg: UntypedFormGroup) {
    const pesel = fg.get('pesel')!.value;
    var reg = /^[0-9]{11}$/;
    if (reg.test(pesel) == false || pesel === undefined)
      return { peselInvalid: true };
    else {
      var digits = ('' + pesel).split('');
      if (
        parseInt(pesel.substring(4, 6)) > 31 ||
        parseInt(pesel.substring(2, 4)) > 12
      )
        return { peselInvalid: true };

      var checksum =
        (1 * parseInt(digits[0]) +
          3 * parseInt(digits[1]) +
          7 * parseInt(digits[2]) +
          9 * parseInt(digits[3]) +
          1 * parseInt(digits[4]) +
          3 * parseInt(digits[5]) +
          7 * parseInt(digits[6]) +
          9 * parseInt(digits[7]) +
          1 * parseInt(digits[8]) +
          3 * parseInt(digits[9])) %
        10;
      if (checksum == 0) checksum = 10;
      checksum = 10 - checksum;

      return (parseInt(digits[10]) == checksum) === false
        ? { peselInvalid: true }
        : {}; //: {'patternInvalid': false};
    }
  }

  peselValid(fg: UntypedFormGroup) {
    const pesel = fg.get('pesel')!.value;
    return this.checkPeselValidation(fg.get('pesel')!.value)
      ? null
      : {
          patternInvalid: true,
        };
  }

  register() {
    const forRegister = Object.assign({}, this.registerForm.value);
    this.authServ.register(forRegister).subscribe(
      (res) => {
        this.alertServ.success('You have been registered successfully!');
        this.router.navigate(['/']);
      },
      (err: any) => {
        let errMess = '';
        for (const item in err.error.message) {
          errMess += item + ' ';
        }

        this.alertServ.error(err.error.message);
      }
    );
  }

  checkAvailability(login: string, valid: string | undefined) {
    this.authServ.checkLogin(login).subscribe(
      (res: any) => {
        this.availability = res.available;
      },
      (err) => {
        console.warn(err);
      }
    );
  }
}
