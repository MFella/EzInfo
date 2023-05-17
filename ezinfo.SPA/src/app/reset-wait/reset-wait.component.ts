import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../_services/alert.service';
import { AuthService } from '../_services/auth.service';
import { SweetyService } from '../_services/sweety.service';

@Component({
  selector: 'app-reset-wait',
  templateUrl: './reset-wait.component.html',
  styleUrls: ['./reset-wait.component.scss'],
})
export class ResetWaitComponent implements OnInit {
  public load = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alert: AlertService,
    private authServ: AuthService,
    private sweety: SweetyService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['token'] === undefined) {
        this.alert.error('Cant get this route');
        this.router.navigate(['']);
      }

      this.authServ.sendConfirmation(params['token']).subscribe(
        async (res) => {
          this.alert.success('You have been logged in');
          // here change password
          const values = await this.sweety.changePassword();

          if (values.isConfirmed) {
            const pattern =
              /^^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,20}$/;
            const password = (<HTMLInputElement>(
              document.querySelector('input#password_for_reset')
            )).value;
            const repeat_password = (<HTMLInputElement>(
              document.querySelector('input#repeatPassword_for_reset')
            )).value;

            if (!pattern.test(password) || !pattern.test(repeat_password)) {
              this.alert.error(
                'Password should contains one capital letter, one special sign and one digit, and length >=7!'
              );
              this.router.navigate(['']);
              return;
            }

            this.authServ.changePassword(password).subscribe(
              (res: any) => {
                this.alert.success(res.res);
                this.router.navigate(['']);
              },
              (err) => {
                this.alert.error(err.error.message);
                this.router.navigate(['']);
              }
            );
          } else {
            this.router.navigate(['']);
          }
        },
        (err) => {
          this.alert.error('Error ocured during retriving data');
          this.router.navigate(['']);
        }
      );
    });
  }
}
