import { Component, OnInit } from '@angular/core';
import { faCoffee, IconDefinition, faHome, 
  faSign, faQuestionCircle, faFileArchive, faUpload, faStickyNote} from '@fortawesome/free-solid-svg-icons';

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

  constructor() { }

  ngOnInit() {
  }

}
