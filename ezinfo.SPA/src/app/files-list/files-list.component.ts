import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IconDefinition, faPenNib, faFileInvoice, 
  faFileDownload, faGlobe, faUsers, faEye} from '@fortawesome/free-solid-svg-icons';
import { Pagination } from '../_models/pagination.interface';
import { RecordInList } from '../_models/recordInList.interface';
import { AlertService } from '../_services/alert.service';
import { FileService } from '../_services/file.service';
import { SweetyService } from '../_services/sweety.service';
import {saveAs} from 'file-saver';

@Component({
  selector: 'app-files-list',
  templateUrl: './files-list.component.html',
  styleUrls: ['./files-list.component.scss']
})
export class FilesListComponent implements OnInit {

  sharedText!: RecordInList[];
  allFiles!: RecordInList[];
  retrievedFile!: any;
  page: any = 1;
  rotate: boolean = true;
  // password: string = '';
  pagination: Pagination = {
  currentPage: 1,
  itemsPerPage: 3,
  totalItems: 3,
  totalPages: 100};
  maxSize = 3;

  icons: Array<IconDefinition> = [faPenNib, faFileInvoice, faFileDownload, faGlobe, faUsers, faEye];



  constructor(private route: ActivatedRoute, private fileServ: FileService,
      private alert: AlertService, private sweety: SweetyService) { }

  ngOnInit() {

    this.route.data
      .subscribe((data: any) =>
        {
          console.log(data);
          //console.log(data.files);
          console.log(data.files);
          //this.allFiles = data.files;
          this.allFiles = [...data.files, ...data.notes];
          this.sharedText = [...data.files, ...data.notes];

          for(let i = 0; i < this.allFiles.length; i++)
          {
            this.allFiles[i].possiblePassword = '';
          }
          
          console.log(this.allFiles.length);

          this.pagination = {
            currentPage: 1,
            itemsPerPage: 3,
            totalItems: this.sharedText.length,
            totalPages: Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage)
          };
          this.sharedText = [...data.files, ...data.notes].slice(0, 3);

        })
  }

  showContent(id: string, password: string)
  {
    

    this.fileServ.retrieveNote(id, password)
      .subscribe((res:any) =>
        {
          password = '';
          //console.log(res);
          this.sweety.success(id, res.note);
          this.sharedText.forEach(el => el.possiblePassword = '');
        }, (err) =>
        {
          this.sweety.error(id, err.error.message);
          this.sharedText.forEach(el => el.possiblePassword = '');
          password = '';
        })
  }

  downloadFile(id: string, password: string, filename: string | undefined)
  {
    this.fileServ.downloadFile(id, password)
      .subscribe((res: any) =>
      {
        password = '';
        //handle name of file!
        this.alert.info('File should be downloading. Work in progress...');
        const filed = new File([res], filename!);
        saveAs(filed);
        
      }, async(err: any) =>
      {
        password = '';
        if(err.status === 0) 
        {
          this.alert.error('Probably this entity doesnt exists in db, or in storage-place');
        } 
        else{
          const hah = JSON.parse(await err.error.text()); 
          this.sweety.error(id, `${hah.message}`); 
        }

      })
  } 

  pageChanged(e: any)
  {
    if(this.pagination.currentPage > e.page)
    {
      (<HTMLElement>document.querySelector('.list-group')!).style.animation = '';
      (<HTMLElement>document.querySelector('.list-group')!).style.animation = 'flash';
      (<HTMLElement>document.querySelector('.list-group')!).style.animationDuration = '.95s';


      // (<HTMLElement>document.querySelector('.list-group')!).style.setProperty('--animate-repeat', '2');
      // (<HTMLElement>document.querySelector('.list-group')!).style.setProperty('animation-fill-mode', 'forwards');

    }else 
    {
      (<HTMLElement>document.querySelector('.list-group')!).style.animation = '';
      (<HTMLElement>document.querySelector('.list-group')!).style.animation = 'fadeInLeft';
      (<HTMLElement>document.querySelector('.list-group')!).style.animationDuration = '.5s';


      // (<HTMLElement>document.querySelector('.list-group')!).style.setProperty('--animate-repeat', '2');
      // (<HTMLElement>document.querySelector('.list-group')!).style.setProperty('animation-fill-mode', 'forwards');
    }


    this.pagination.currentPage = e.page;
    this.pagination.itemsPerPage = e.itemsPerPage;
    this.sharedText = this.allFiles.slice((e.page-1)*(e.itemsPerPage), (e.page)*(e.itemsPerPage));

  }

}
