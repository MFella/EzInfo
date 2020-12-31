import { Component, OnInit } from '@angular/core';
import { IconDefinition, faGlobe, faUsers, faLock} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-add-file',
  templateUrl: './add-file.component.html',
  styleUrls: ['./add-file.component.scss']
})
export class AddFileComponent implements OnInit {


  icons: Array<IconDefinition> = [faGlobe, faUsers, faLock]

  constructor() { }

  ngOnInit() {
  }

}
