import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { faCoffee, IconDefinition, faHome, 
  faSign, faQuestionCircle, faFileArchive, faUpload, faStickyNote} from '@fortawesome/free-solid-svg-icons';
import { LoginCredsDto } from '../dtos/loginCredsDto';
import { AlertService } from '../_services/alert.service';
import { AuthService } from '../_services/auth.service';
import { SweetyService } from '../_services/sweety.service';
import * as sweetalert2 from '@sweetalert2/ngx-sweetalert2'

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {


  login: any = '';
  password: any = '';

  faCoffee = faCoffee;
  icons: Array<IconDefinition> = [faHome, faSign, faQuestionCircle, faUpload, faFileArchive, faStickyNote]

  constructor(public authServ: AuthService, private alertServ: AlertService,
    private router: Router, private sweety: SweetyService) { }

  ngOnInit() {
   console.log(this.authServ.currentUser);
  }

  async login_user(login: string, password: string)
  {
    const loginCreds: LoginCredsDto = {
      login, password
    };

     // await this.authServ.login(loginCreds);
      return this.authServ.login(loginCreds)
      .subscribe(res =>
      {
          if(res.res)
          {
            this.alertServ.success(res.msg + ". Welcome back, " + res.name); 
            this.router.navigate(['']);
            this.login = '';
            this.password = '';
          }

      }, err =>
      {
        this.login = '';
        this.password = '';
        this.alertServ.error(err.error.message);
      })



  }

  logout()
  {
    this.authServ.logout();
    this.router.navigate(['']);
  }

  about()
  {
    const content = 
    `Main purpose of this project was to be maximum safety. 
    The most important implemented things: password hashing,
    encrypting/dedcrypting content of notes, storing files
    in storage service(AWS S3), safe headers, XSRF protection.
    More information about this project you can find in 
    <a href="https://github.com/MFella/EzInfo" target="_blank">readme</a> on github.
    `;

    this.sweety.about("About this project", content);
  }

  async changePassword()
  {
    
    const values = await this.sweety.changePassword();

    if(values.isConfirmed)
    {
      const pattern = /^^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,20}$/;
      const password = (<HTMLInputElement>document.querySelector('input#password_for_reset')).value;
      const repeat_password = (<HTMLInputElement>document.querySelector('input#repeatPassword_for_reset')).value;

      if(!pattern.test(password) || !pattern.test(repeat_password))
      {
        this.alertServ.error('Password should contains one capital letter, one special sign and one digit, and length >=7!');
        return;
      }


      this.authServ.changePassword(password)
        .subscribe((res: any) =>
          {
            this.alertServ.success(res.res);

          }, err =>
          {
            this.alertServ.error(err.error.message);
          })

    }

  }

  async displayForgot()
  {
    const email = await this.sweety.forgot();
    const pattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

    if(!pattern.test(email.value) && email.value !== undefined && email.value?.length !== 0)
    {
      this.alertServ.error('Cant send mail - written email doesnt match with email pattern');

    }else if(pattern.test(email.value))
    {

      this.authServ.forgotPassword(email.value)
        .subscribe((res: any) =>
        {
          this.alertServ.info(res.msg);

        }, err =>
        {
          this.alertServ.error(err.error.message);
        })

    }

  }

}
