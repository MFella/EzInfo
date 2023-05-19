import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FileToSendDto } from '../dtos/fileToSendDto';
import { environment } from '../../environments/environment';
import { TextToSendDto } from '../dtos/textToSendDto';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(private http: HttpClient) {}

  sendFile(fileToSendDto: FileToSendDto) {
    const formData = new FormData();
    formData.append('file', fileToSendDto.file);
    formData.append('accessType', fileToSendDto.accessType);
    formData.append('loginList', fileToSendDto.loginList);
    formData.append('password', fileToSendDto.password);

    return this.http.post<any>(environment.backUrl + 'file/upload', formData);
  }

  sendText(textToSendDto: TextToSendDto) {
    return this.http.post<any>(
      environment.backUrl + 'file/save',
      textToSendDto
    );
  }

  retrieveNotes() {
    return this.http.get(environment.backUrl + `file/notes`);
  }

  retrieveNote(id: string, password: string) {
    return this.http.get(
      environment.backUrl + `file/note?id=${id}&password=${password}`
    );
  }

  retrieveFiles() {
    return this.http.get(environment.backUrl + 'file/files');
  }

  downloadFile(id: string, password: string) {
    return this.http.get(
      environment.backUrl + `file/download?id=${id}&password=${password}`,
      { responseType: 'blob' }
    );
  }

  deleteItem(
    code: string,
    itemId: string
  ): Observable<{ deleted: boolean; message: string }> {
    return this.http.delete(
      environment.backUrl + `file/delete?itemId=${itemId}&code=${code}`
    ) as Observable<{ deleted: boolean; message: string }>;
  }
}
