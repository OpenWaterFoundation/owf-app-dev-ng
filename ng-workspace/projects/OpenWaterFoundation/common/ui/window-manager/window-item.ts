import { MatDialogRef } from '@angular/material/dialog';
import { WindowType }   from './window-manager';


/**
 * 
 */
export class WindowItem {

  dialogRef: MatDialogRef<any> = null;
  windowId: string = null;
  windowType: WindowType = null;


  constructor(windowId: string, type: WindowType, dialogRef?: MatDialogRef<any>) {
    this.windowId = windowId;
    this.windowType = type;
    this.dialogRef = dialogRef;
  }


}