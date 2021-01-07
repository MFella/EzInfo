import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IconDefinition, faGlobe, faUsers, faLock, faPenFancy, faFileImage} from '@fortawesome/free-solid-svg-icons';
import { FileToSendDto } from '../dtos/fileToSendDto';
import { TextToSendDto } from '../dtos/textToSendDto';
import { HTMLInputEvent } from '../_models/HTMLInputEvent.interface';
import { AlertService } from '../_services/alert.service';
import { FileService } from '../_services/file.service';

@Component({
  selector: 'app-add-file',
  templateUrl: './add-file.component.html',
  styleUrls: ['./add-file.component.scss']
})
export class AddFileComponent implements OnInit {

  accessType: string = 'Everyone';
  sendType: string = 'File';
  loginList: string = '';
  contentText: string = '';
  withPassword: boolean = false;
  passwordValue: string = '';
  file: any = null;
  fileForm!: FormGroup;

  icons: Array<IconDefinition> = [faGlobe, faUsers, faLock, faPenFancy, faFileImage]

  constructor(private alert: AlertService, private fb: FormBuilder,
    private fileServ: FileService, private router: Router) {}

  ngOnInit() {

    this.fileForm = this.fb.group({
      file: [''],
      password: ['', [ Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)]]
    });

  }

  random(e: Event, type: string)
  {
    this.accessType = type;
  }

  showMe()
  {
    console.log(this.loginList);
  }

  showFile(e: any) 
  {
    const file = e.target.files;
    this.file = e.target.files.item(0);
  }

  sendFile()
  {

    if(!this.validateInfo())
    {
      // do my thing
      if(this.sendType === 'File')
      {

        console.log('the password is: ' + this.fileForm.get('password')!.value);

        const fileToSendDto: FileToSendDto = Object.assign({}, {
          file: this.file,
          accessType: this.accessType,
          loginList: this.loginList,
          password: this.fileForm.get('password')!.value.toString()
        });

        console.log(fileToSendDto);

        this.fileServ.sendFile(fileToSendDto)
          .subscribe(res =>
            {
              this.alert.success('Saved correctly! See this in your infos!');
              this.router.navigate(['']);
            }, err =>
            {
              this.alert.error(`Some error occured: ${err}`);
            })

      }else
      {
        //else text
        const textToSendDto: TextToSendDto = Object.assign({}, 
        {
          text: this.contentText,
          accessType: this.accessType,
          loginList: this.loginList,
          password: this.fileForm.get('password')?.value
        });

        this.fileServ.sendText(textToSendDto)
          .subscribe(res =>
            {
              this.alert.success('Saved correctly! See this in your strongbox!');
              this.router.navigate(['']);
            }, err =>
            {
              this.alert.error(`Error occured while saving note. Error: ${err}`);
            })
      }

    }else {

      this.alert.error('Data which you provided are invalid!');
    }
    
  }

  changeSendType(typo: string)
  {
    this.sendType = typo;
  }

  changePassOpt()
  {
    this.fileForm.get('password')?.setValue('');
    this.withPassword = !this.withPassword;
  
  }


  validateInfo()
  {

    if(this.sendType === 'File' && this.file === null)
    { 
      return true;
    }

    if(this.sendType === 'Text' && this.contentText.length === 0)
    {
      return true;
    }

    if(this.withPassword && ((this.fileForm.get('password')!.status === 'INVALID') || this.fileForm.get('password')?.value.length === 0))
    {
      return true;
    }

    return false;

  }

}
