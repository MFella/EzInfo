import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FileToSendDto } from '../dtos/fileToSendDto';
import {environment} from '../../environments/environment';
import { TextToSendDto } from '../dtos/textToSendDto';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient) { }

  sendFile(fileToSendDto: FileToSendDto)
  {
    const formData = new FormData();
    formData.append('file', fileToSendDto.file);
    formData.append('accessType', fileToSendDto.accessType);
    formData.append('loginList', fileToSendDto.loginList);

    return this.http.post<any>(environment.backUrl + 'file/upload', formData);

  }

  sendText(textToSendDto: TextToSendDto)
  {
    
    return this.http.post<any>(environment.backUrl + 'file/save', textToSendDto);
  }

  retrieveNotes(id: string, password: string)
  {
    return this.http.get(environment.backUrl + `file/note?id=${id}&password=${password}`);
  }

}
