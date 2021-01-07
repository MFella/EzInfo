import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Pagination } from '../_models/pagination.interface';
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
  allFiles!: TextInList[];
  page: any = 1;
  rotate: boolean = true;
  // password: string = '';
  pagination: Pagination = {
  currentPage: 1,
  itemsPerPage: 3,
  totalItems: 3,
  totalPages: 100
  };
  maxSize = 3;

  constructor(private route: ActivatedRoute, private fileServ: FileService,
      private alert: AlertService, private sweety: SweetyService) { }

  ngOnInit() {

    this.route.data
      .subscribe((data: any) =>
        {
          //console.log(data.files);
          console.log(data.files);
          this.allFiles = data.files;
          this.sharedText = data.files;
          
          this.pagination = {
            currentPage: 1,
            itemsPerPage: 3,
            totalItems: this.sharedText.length,
            totalPages: Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage)
          };
          this.sharedText = data.files.slice(0, 3);

        })
  }

  showContent(id: string, password: string)
  {
    

    this.fileServ.retrieveNote(id, password)
      .subscribe((res:any) =>
        {
          //console.log(res);
          this.sweety.success(id, res.note);
          this.sharedText.forEach(el => el.possiblePassword = '');
        }, (err) =>
        {
          this.sweety.error(id, err.error.message);
          this.sharedText.forEach(el => el.possiblePassword = '');
        })
  }

  pageChanged(e: any)
  {
    this.pagination.currentPage = e.page;
    this.pagination.itemsPerPage = e.itemsPerPage;
    this.sharedText = this.allFiles.slice((e.page-1)*(e.itemsPerPage), (e.page)*(e.itemsPerPage))
  }

}
