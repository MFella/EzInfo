export interface RecordInList {
  id: string;
  //content: string;
  login: string;
  isRestricted: boolean;
  havePassword: boolean;
  possiblePassword: string;
  isFile: boolean;
  filename?: string;
}
