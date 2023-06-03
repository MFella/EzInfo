import { ItemAccessType } from '../types/item/itemAccessType';

export interface TextToSendDto {
  text: string;
  accessType: ItemAccessType;
  accountNumbers: string;
  password: string;
}
