import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './_services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ezinfo-app';

  constructor(private authServ: AuthService, private cookieServ: CookieService){}

  ngOnInit()
  {
    this.authServ.whoAmI()
    .subscribe((res: any) =>
    {
      console.log(res);
      localStorage.setItem('XSRF-TOKEN', res.csrfToken);
      //this.cookieServ.set('XSRF-TOKEN', res.csrfToken);
    })

  }
}
