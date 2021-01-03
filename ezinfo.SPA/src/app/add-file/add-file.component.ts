import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IconDefinition, faGlobe, faUsers, faLock} from '@fortawesome/free-solid-svg-icons';
import { HTMLInputEvent } from '../_models/HTMLInputEvent.interface';
import { AlertService } from '../_services/alert.service';

@Component({
  selector: 'app-add-file',
  templateUrl: './add-file.component.html',
  styleUrls: ['./add-file.component.scss']
})
export class AddFileComponent implements OnInit {

  accessType: string = 'Everyone';
  loginList: string = '';
  file: any = null;
  fileForm!: FormGroup;

  icons: Array<IconDefinition> = [faGlobe, faUsers, faLock]

  constructor(private alert: AlertService, private fb: FormBuilder) {
   }

  ngOnInit() {

    this.fileForm = this.fb.group({
      file: ['']
    });

  }

  random(e: Event)
  {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(el =>
      {
        if(el.checked)
        {
          this.accessType = el.value;
        }

      });
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

    if(this.validateInfo())
    {
      // do my thing

    }else {
      this.alert.error('Data which you provided are invalid!');
    }
    
  }

  validateInfo()
  {

    if(this.accessType == 'Restricted' && this.loginList.length == 0)
    {
      return false;
    }

    if(this.accessType != 'Restricted' && this.loginList.length != 0)
    {
      return false;
    }

    console.log(this.file);

    if(this.file === null)
    {
      return false;
    }

    return true;

  }

}
