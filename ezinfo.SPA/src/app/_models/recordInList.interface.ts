import { ItemType } from './../types/item/itemType';
export interface RecordInList {
  itemId: string;
  //content: string;
  login: string;
  isRestricted: boolean;
  havePassword: boolean;
  possiblePassword: string;
  itemType: ItemType;
  filename?: string;
}
