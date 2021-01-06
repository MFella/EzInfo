import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TextInList } from '../_models/textInList.interface';
import { AlertService } from '../_services/alert.service';
import { FileService } from '../_services/file.service';
import { SweetyService } from '../_services/sweety.service';

@Component({
  selector: 'app-files-list',
  templateUrl: './files-list.component.html',
  styleUrls: ['./files-list.component.scss']
})
export class FilesListComponent implements OnInit {

  sharedText!: TextInList[];
  password: string = '';

  constructor(private route: ActivatedRoute, private fileServ: FileService,
      private alert: AlertService, private sweety: SweetyService) { }

  ngOnInit() {
  
    this.route.data
      .subscribe((data: any) =>
        {
          //console.log(data.files);
          console.log(data.files);
          this.sharedText = data.files;

        })
  }

  showContent(id: string, password: string)
  {
    

    this.fileServ.retrieveNote(id, password)
      .subscribe((res:any) =>
        {
          //console.log(res);
          this.sweety.success(id, res.note);
        }, (err) =>
        {
          //console.log(err);
          this.sweety.error(id, err.error.message);
          //this.alert.error(`Cant read that message. Reason: ${err}`);
        })
  }

}
