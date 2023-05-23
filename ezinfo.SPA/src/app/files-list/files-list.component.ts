import {
  IconDefinition,
  faPenNib,
  faFileInvoice,
  faFileDownload,
  faGlobe,
  faUsers,
  faEye,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { Pagination } from '../_models/pagination.interface';
import { RecordInList } from '../_models/recordInList.interface';
import { AlertService } from '../_services/alert.service';
import { FileService } from '../_services/file.service';
import { SweetyService } from '../_services/sweety.service';
import { saveAs } from 'file-saver';
import {
  Component,
  OnInit,
  ElementRef,
  AfterViewInit,
  ViewChild,
  DestroyRef,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, firstValueFrom, fromEvent } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../_services/auth.service';
import { PaginationComponent } from 'ngx-bootstrap/pagination';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ItemType } from '../types/item/itemType';

@Component({
  selector: 'app-files-list',
  templateUrl: './files-list.component.html',
  styleUrls: ['./files-list.component.scss'],
})
export class FilesListComponent implements OnInit, AfterViewInit {
  private destroyRef = inject(DestroyRef);

  @ViewChild('paginationComponent')
  paginationComponent!: PaginationComponent;

  sharedText!: RecordInList[];
  allFiles!: RecordInList[];
  retrievedFile!: any;
  page: any = 1;
  rotate: boolean = true;
  pagination: Pagination = {
    currentPage: 1,
    itemsPerPage: 3,
    totalItems: 3,
    totalPages: 100,
  };
  maxSize = 3;

  icons: Array<IconDefinition> = [
    faPenNib,
    faFileInvoice,
    faFileDownload,
    faGlobe,
    faUsers,
    faEye,
    faTrash,
  ];

  itemIdToDelete!: string;
  itemTypeToDelete!: ItemType;

  constructor(
    private route: ActivatedRoute,
    private fileServ: FileService,
    private alert: AlertService,
    private sweety: SweetyService,
    private readonly authService: AuthService,
    private readonly elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.route.data.subscribe((data: any) => {
      this.allFiles = [...data.files, ...data.notes];
      this.sharedText = [...data.files, ...data.notes];

      for (let i = 0; i < this.allFiles.length; i++) {
        this.allFiles[i].possiblePassword = '';
      }

      const totalPages = Math.ceil(
        this.sharedText.length / this.pagination.itemsPerPage
      );
      this.pagination = {
        currentPage: 1,
        itemsPerPage: 3,
        totalItems: this.sharedText.length,
        totalPages,
      };
      this.sharedText = [...data.files, ...data.notes].slice(0, 3);
    });
  }

  ngAfterViewInit(): void {
    this.observeKeyDownArrowKeysEvent();
  }
  showContent(id: string, password: string) {
    this.fileServ.retrieveNote(id, password).subscribe(
      (res: any) => {
        password = '';
        this.sweety.success(id, res.note);
        this.sharedText.forEach((el) => (el.possiblePassword = ''));
      },
      (err) => {
        this.sweety.error(id, err.error.message);
        this.sharedText.forEach((el) => (el.possiblePassword = ''));
        password = '';
      }
    );
  }

  downloadFile(id: string, password: string, filename: string | undefined) {
    this.fileServ.downloadFile(id, password).subscribe(
      (res: any) => {
        password = '';
        this.alert.info('File should be downloading. Work in progress...');
        const filed = new File([res], filename!);
        saveAs(filed);
      },
      async (err: any) => {
        password = '';
        if (err.status === 0) {
          this.alert.error(
            'Probably this entity doesnt exists in db, or in storage-place'
          );
        } else {
          const hah = JSON.parse(await err.error.text());
          this.sweety.error(id, `${hah.message}`);
        }
      }
    );
  }

  pageChanged(event: { page: number; itemsPerPage: number }) {
    if (this.pagination.currentPage > event.page) {
      (<HTMLElement>document.querySelector('.list-group')!).style.animation =
        '';
      (<HTMLElement>(
        document.querySelector('.list-group')!
      )).style.animationDuration = '.95s';

      setTimeout(() => {
        (<HTMLElement>document.querySelector('.list-group')!).style.animation =
          'headShake';
        (<HTMLElement>(
          document.querySelector('.list-group')!
        )).style.animationDuration = '.95s';
      }, 1);
    } else {
      (<HTMLElement>document.querySelector('.list-group')!).style.animation =
        '';
      (<HTMLElement>(
        document.querySelector('.list-group')!
      )).style.animationDuration = '.5s';

      setTimeout(() => {
        (<HTMLElement>document.querySelector('.list-group')!).style.animation =
          'fadeInLeft';
        (<HTMLElement>(
          document.querySelector('.list-group')!
        )).style.animationDuration = '.5s';
      }, 1);
    }

    this.pagination.currentPage = event.page;
    this.pagination.itemsPerPage = event.itemsPerPage;
    this.sharedText = this.allFiles.slice(
      (event.page - 1) * event.itemsPerPage,
      event.page * event.itemsPerPage
    );
  }

  deleteItem(itemId: string, itemType: ItemType): void {
    this.itemIdToDelete = itemId;
    this.itemTypeToDelete = itemType;
    this.sweety.confirmDeletion(
      itemId
        .split('-')
        .map((word) => word.charAt(0))
        .join(''),
      this.deleteFileConfirmCb.bind(this)
    );
  }

  canDeleteFile(login: string): boolean {
    return this.authService.getCurrentUser()?.login === login;
  }

  private deleteFileConfirmCb(code: string): void {
    firstValueFrom(this.fileServ.deleteItem(code, this.itemIdToDelete))
      .then((response: { deleted: boolean; message: string }) => {
        if (!response.deleted) {
          this.alert.error(response.message);
          this.removeItem(
            this.itemIdToDelete,
            this.itemTypeToDelete === 'file' ? this.allFiles : this.sharedText
          );
        } else {
          this.alert.info(response.message);
        }
      })
      .catch((err: HttpErrorResponse) => {
        this.alert.error(err.error?.message?.join(' '));
      });
  }

  private observeKeyDownArrowKeysEvent(): void {
    const [leftArrowKeyCode, rightArrowKeyCode] = ['ArrowLeft', 'ArrowRight'];
    fromEvent<KeyboardEvent>(this.elementRef.nativeElement, 'keydown')
      .pipe(
        filter(
          ($event: KeyboardEvent) =>
            $event.code === leftArrowKeyCode ||
            $event.code === rightArrowKeyCode
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(($event: KeyboardEvent) => {
        if (
          $event.code === leftArrowKeyCode &&
          this.pagination.currentPage > 1
        ) {
          this.paginationComponent.selectPage(this.pagination.currentPage - 1);
          return;
        }

        if (
          $event.code === rightArrowKeyCode &&
          this.pagination.currentPage < this.pagination.totalPages
        ) {
          this.paginationComponent.selectPage(this.pagination.currentPage + 1);
          return;
        }
      });
  }

  private removeItem(itemId: string, itemList: Array<RecordInList>): void {
    let indexToDelete: number;
    const itemIds = itemList.map((item) => item.itemId);

    while ((indexToDelete = itemIds.indexOf(itemId)) > -1) {
      itemList.splice(indexToDelete, 1);
    }
  }
}
