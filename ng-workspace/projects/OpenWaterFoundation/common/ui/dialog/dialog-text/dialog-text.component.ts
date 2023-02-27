import { Component,
          OnInit,
          Inject, 
          OnDestroy}        from '@angular/core';
import { MatDialogRef,
          MAT_DIALOG_DATA } from '@angular/material/dialog';

import { OwfCommonService,
          SaveFileType }    from '@OpenWaterFoundation/common/services';

import { faXmark }          from '@fortawesome/free-solid-svg-icons';

import { WindowManager }    from '@OpenWaterFoundation/common/ui/window-manager';

import * as FileSaver       from 'file-saver';


@Component({
  selector: 'app-dialog-text',
  templateUrl: './dialog-text.component.html',
  styleUrls: ['./dialog-text.component.css', '../main-dialog-style.css']
})
export class DialogTextComponent implements OnInit, OnDestroy {

  /** A string representing the file extension that the text came from. Used for
   * the Download button tooltip. */
  fileExtension: string;
  /** A string representing the name that the text came from. */
  fileName: string;
  /** Used as a path resolver and contains the path to the map configuration that
   * is using this TSGraphComponent. To be set in the app service for relative
   * paths. */
  mapConfigPath: string;
  /** The text to be displayed in the dialog. */
  text: any;
  /** A string representing the button ID of the button clicked to open this dialog. */
  windowId: string;
  /** The windowManager instance for managing the opening and closing of windows throughout the InfoMapper. */
  windowManager: WindowManager = WindowManager.getInstance();
  /** All used icons in the DialogTextComponent. */
  faXmark = faXmark;

  /**
   * 
   * @param dialogRef The reference to the DialogTSGraphComponent. Used for creation
   * and sending of data.
   * @param dialogService The reference to the dialog service, for sending data between
   * components and higher scoped map variables.
   * @param matDialogData The object containing data passed from the Component that
   * created this Dialog.
   */
  constructor(
    private commonService: OwfCommonService,
    private dialogRef: MatDialogRef<DialogTextComponent>,
    @Inject(MAT_DIALOG_DATA) private matDialogData: any
  ) {

    this.windowId = this.matDialogData.data.windowId;
    this.text = this.matDialogData.data.text;
    this.fileName = this.matDialogData.data.resourcePath;
    if (this.fileName.includes('.')) {
      this.fileExtension = this.fileName.split('.').pop();
    } else {
      this.fileExtension = this.fileName;
    }
    this.mapConfigPath = this.matDialogData.data.mapConfigPath;
  }


  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive. Called after the constructor.
   */
  ngOnInit(): void {
    this.commonService.setMapConfigPath(this.mapConfigPath);

    var splitPath = this.fileName.split('/');
    this.fileName = splitPath[splitPath.length - 1];
    
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked, and removes this
   * dialog's window ID from the windowManager.
   */
  onClose(): void {
    this.dialogRef.close();
    this.windowManager.removeWindow(this.windowId);
  }

  /**
   * Called once, before the instance is destroyed. If the page is changed or a link is clicked on in the dialog that opens
   * a new map, make sure to close the dialog and remove it from the window manager.
   */
  ngOnDestroy(): void {
    this.dialogRef.close();
    this.windowManager.removeWindow(this.windowId);
  }

  /**
   * Downloads the text as a Blob onto the user's local machine with the same name as the original file
   */
  saveText(): void {
    var data = new Blob([this.text], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(data, this.commonService.formatSaveFileName(this.fileName, SaveFileType.text));
  }

}
