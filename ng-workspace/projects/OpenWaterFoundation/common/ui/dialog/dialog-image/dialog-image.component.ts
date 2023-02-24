import { Component,
          
  Inject,
          OnInit }           from '@angular/core';

import { MatDialogRef,
          MAT_DIALOG_DATA }  from '@angular/material/dialog';

import { faXmark }           from '@fortawesome/free-solid-svg-icons';

import { WindowManager }     from '@OpenWaterFoundation/common/ui/window-manager';

@Component({
  selector: 'lib-dialog-image',
  templateUrl: './dialog-image.component.html',
  styleUrls: ['./dialog-image.component.css', '../main-dialog-style.css']
})
export class DialogImageComponent implements OnInit {

  /** Unique ID for this dialog to be used by the Window Manager. */
  dialogID: string;
  /** The optional description to be shown underneath the image. */
  imageDescription: string;
  /** The name of the image being displayed in the dialog. */
  imageName: string;
  /** The absolute path to the image file. */
  imagePath: string;
  /**
   * Used as a path resolver and contains the path to the map configuration that is using this TSGraphComponent.
   * To be set in the app service for relative paths.
   */
  mapConfigPath: string;
  /** The windowManager instance for managing the opening and closing of windows throughout the InfoMapper. */
  windowManager: WindowManager = WindowManager.getInstance();
  /** All used icons in the DialogImageComponent. */
  faXmark = faXmark;


  /**
   * 
   * @param dialogRef 
   * @param matDialogData
   */
  constructor(
    private dialogRef: MatDialogRef<DialogImageComponent>,
    @Inject(MAT_DIALOG_DATA) private matDialogData: any
  ) {

    this.dialogID = this.matDialogData.data.dialogID;
    this.imagePath = this.matDialogData.data.imagePath;
    this.imageDescription = this.matDialogData.data.imageDescription ? this.matDialogData.data.imageDescription : '';
    this.mapConfigPath = this.matDialogData.data.mapConfigPath;
  }


  /**
   * 
   */
  ngOnInit(): void {
    // this.commonService.setMapConfigPath(this.mapConfigPath);
    // First split by '/', and grab the last element, which is the file.
    // Immediately split the file name by '.' and grab the first element: the file name.
    this.imageName = this.imagePath.split('/')[this.imagePath.split('/').length - 1].split('.')[0];
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked, and removes this
   * dialog's window ID from the windowManager.
   */
  onClose(): void {
    this.dialogRef.close();
    this.windowManager.removeWindow(this.dialogID);
  }

}
