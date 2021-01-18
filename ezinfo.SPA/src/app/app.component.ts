import { Component, OnInit } from '@angular/core';
import { AuthService } from './_services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ezinfo-app';

  constructor(private authServ: AuthService){}

  ngOnInit()
  {
    this.authServ.whoAmI()
    .subscribe((res: any) =>
    {
      console.log(res);
      localStorage.setItem('XSRF-TOKEN', res.csrfToken);
    })

  }
}
