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
   * Unique ID for 
   */
  public dialogID: string;
  /**
   * 
   */
  public imageDescription: string;
  /**
   * The name of the image being displayed in the dialog.
   */
  // TODO: Change this from a had-coded example to the name of the image.
  public imageName = 'test.txt';
  /**
   * 
   */
  public imagePath: string;
  /**
   * The windowManager instance for managing the opening and closing of windows throughout the InfoMapper.
   */
  public windowManager: WindowManager = WindowManager.getInstance();


  /**
   * 
   * @param dialogRef 
   */
  constructor(public dialogRef: MatDialogRef<DialogImageComponent>,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.imagePath = dataObject.data.imagePath;
    this.dialogID = dataObject.data.dialogID;
  }


  /**
   * 
   */
  ngOnInit(): void {
    this.imageDescription = '';
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked.
   */
   public onClose(): void {
    this.dialogRef.close();
    this.windowManager.removeWindow(this.dialogID);
  }

}
