import { ItemAccessType } from './../types/item/itemAccessType';

export interface FileToSendDto {
  file: File;
  accessType: ItemAccessType;
  accountNumbers: string;
  password: string;
}
