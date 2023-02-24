import { MatDialogRef } from '@angular/material/dialog';
import { WindowType }   from './window-manager';


/**
 * 
 */
export class WindowItem {

  dialogRef: MatDialogRef<any> = null;
  windowID: string = null;
  windowType: WindowType = null;


  constructor(windowID: string, type: WindowType, dialogRef?: MatDialogRef<any>) {
    this.windowID = windowID;
    this.windowType = type;
    this.dialogRef = dialogRef;
  }


}