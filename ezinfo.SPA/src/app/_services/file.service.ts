import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FileToSendDto } from '../dtos/fileToSendDto';
import {environment} from '../../environments/environment';

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

}
