import { Component,
          
  Inject,
          OnInit }           from '@angular/core';

import { MatDialogRef,
          MAT_DIALOG_DATA }  from '@angular/material/dialog';

import { WindowManager }     from '@OpenWaterFoundation/common/ui/window-manager';

@Component({
  selector: 'lib-dialog-image',
  templateUrl: './dialog-image.component.html',
  styleUrls: ['./dialog-image.component.css', '../main-dialog-style.css']
})
export class DialogImageComponent implements OnInit {
  /**
   * Unique ID for this dialog to be used by the Window Manager.
   */
  public dialogID: string;
  /**
   * The optional description to be shown underneath the image.
   */
  public imageDescription: string;
  /**
   * The name of the image being displayed in the dialog.
   */
  public imageName: string;
  /**
   * The absolute path to the image file.
   */
  public imagePath: string;
  /**
   * The windowManager instance for managing the opening and closing of windows throughout the InfoMapper.
   */
  public windowManager: WindowManager = WindowManager.getInstance();


  /**
   * 
   * @param dialogRef 
   * @param dataObject
   */
  constructor(public dialogRef: MatDialogRef<DialogImageComponent>,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.imagePath = dataObject.data.imagePath;
    this.dialogID = dataObject.data.dialogID;
    this.imageDescription = dataObject.data.imageDescription ? dataObject.data.imageDescription : '';
  }


  /**
   * 
   */
  ngOnInit(): void {
    this.imageName = this.imagePath.split('/')[this.imagePath.split('/').length - 1]
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked.
   */
   public onClose(): void {
    this.dialogRef.close();
    this.windowManager.removeWindow(this.dialogID);
  }

}
