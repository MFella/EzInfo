import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  IconDefinition,
  faGlobe,
  faUsers,
  faLock,
  faPenFancy,
  faFileImage,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import { FileToSendDto } from '../dtos/fileToSendDto';
import { TextToSendDto } from '../dtos/textToSendDto';
import { AlertService } from '../_services/alert.service';
import { FileService } from '../_services/file.service';

@Component({
  selector: 'app-add-file',
  templateUrl: './add-file.component.html',
  styleUrls: ['./add-file.component.scss'],
})
export class AddFileComponent implements OnInit {
  passwordInputType: 'text' | 'password' = 'password';

  addFileInputLabel: string = 'Choose File';

  accessType: string = 'Everyone';
  sendType: string = 'File';
  loginList: string = '';
  contentText: string = '';
  withPassword: boolean = false;
  passwordValue: string = '';
  file: File | null = null;
  fileForm!: UntypedFormGroup;
  availableFileFormats: Array<string> = ['.jpeg', '.png', '.csv', '.svg'];

  icons: Array<IconDefinition> = [
    faGlobe,
    faUsers,
    faLock,
    faPenFancy,
    faFileImage,
    faEye,
    faEyeSlash,
  ];

  constructor(
    private alert: AlertService,
    private fb: UntypedFormBuilder,
    private fileServ: FileService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fileForm = this.fb.group({
      file: [''],
      password: [
        '',
        [
          Validators.pattern(
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
          ),
        ],
      ],
    });
  }

  setAccessType(type: string) {
    this.accessType = type;
  }

  chooseFile(e: any) {
    this.file = e.target.files.item(0);
    this.addFileInputLabel = this.file?.name ?? 'Choose File';
  }

  sendFile() {
    if (!this.validateInfo()) {
      if (this.sendType === 'File') {
        const fileToSendDto: FileToSendDto = Object.assign(
          {},
          {
            file: this.file as File,
            accessType: this.accessType,
            loginList: this.loginList,
            password: this.fileForm.get('password')!.value.toString(),
          }
        );

        this.fileServ.sendFile(fileToSendDto).subscribe(
          () => {
            this.alert.success('Saved correctly! See this in your infos!');
            this.router.navigate(['']);
          },
          (err: HttpErrorResponse) => {
            this.alert.error(`Some error occured: ${err.error?.message}`);
          }
        );
      } else {
        //else text
        const textToSendDto: TextToSendDto = Object.assign(
          {},
          {
            text: this.contentText,
            accessType: this.accessType,
            loginList: this.loginList,
            password: this.fileForm.get('password')?.value,
          }
        );

        this.fileServ.sendText(textToSendDto).subscribe(
          (res) => {
            this.alert.success('Saved correctly! See this in your strongbox!');
            this.router.navigate(['']);
          },
          (err) => {
            this.alert.error(`Error occured while saving note. Error: ${err}`);
          }
        );
      }
    } else {
      this.alert.error('Data which you provided are invalid!');
    }
  }

  changeSendType(typo: string) {
    this.sendType = typo;
  }

  changePassOpt() {
    this.fileForm.get('password')?.setValue('');
    this.withPassword = !this.withPassword;
  }

  validateInfo() {
    if (this.sendType === 'File' && this.file === null) {
      return true;
    }

    if (this.sendType === 'Text' && this.contentText.length === 0) {
      return true;
    }

    if (
      this.withPassword &&
      (this.fileForm.get('password')!.status === 'INVALID' ||
        this.fileForm.get('password')?.value.length === 0)
    ) {
      return true;
    }

    return false;
  }

  togglePasswordInputType(): void {
    if (!this.withPassword) {
      return;
    }
    this.passwordInputType =
      this.passwordInputType === 'password' ? 'text' : 'password';
  }
}
