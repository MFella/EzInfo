import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { faCoffee, IconDefinition, faHome, 
  faSign, faQuestionCircle, faFileArchive, faUpload, faStickyNote} from '@fortawesome/free-solid-svg-icons';
import { LoginCredsDto } from '../dtos/loginCredsDto';
import { AlertService } from '../_services/alert.service';
import { AuthService } from '../_services/auth.service';

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
    private router: Router) { }

  ngOnInit() {
   console.log(this.authServ.currentUser);
  }

  login_user(login: string, password: string)
  {
    const loginCreds: LoginCredsDto = {
      login, password
    };

    return this.authServ.login(loginCreds)
      .subscribe(res =>
      {
        if(res.res)
        {
          this.alertServ.success(res.msg + ". Welcome back, " + res.name); 
          this.login = '';
          this.password = '';
        }

      }, err =>
      {
        console.log(err);
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

  

}
