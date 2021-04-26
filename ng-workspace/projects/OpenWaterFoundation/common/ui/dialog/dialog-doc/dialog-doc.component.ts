import { Component,
          Inject,
          OnDestroy,
          OnInit, }         from '@angular/core';
import { MatDialogRef,
          MAT_DIALOG_DATA } from '@angular/material/dialog';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';

import { WindowManager }    from '@OpenWaterFoundation/common/ui/window-manager';


@Component({
  selector: 'app-dialog-doc',
  templateUrl: './dialog-doc.component.html',
  styleUrls: ['./dialog-doc.component.css', '../main-dialog-style.css']
})
export class DialogDocComponent implements OnInit, OnDestroy {
  /** Boolean showing if the current documentation type is a regular text file. */
  public docText: boolean;
  /** Boolean showing if the current documentation type is a markdown file. */
  public docMarkdown: boolean;
  /** Boolean showing if the current documentation type is an HTML file. */
  public docHTML: boolean;
  /** The string containing the documentation that needs to be displayed in this DialogDocComponent. */
  public doc: string;
  /** The string representing the path to the documentation file to be displayed. */
  public docPath: string;
  /** The string to show as the DialogDoc title. */
  public informationName: string;
  /** The Showdown config option object. Overrides an app `app.module.ts` config option object. */
  public showdownOptions = {
    emoji: true,
    flavor: 'github',
    noHeaderId: true,
    openLinksInNewWindow: true,
    parseImgDimensions: true,
    // This must exist in the config object and be set to false to work.
    simpleLineBreaks: false,
    strikethrough: true,
    tables: true
  }
  /**
   * The formatted string to be converted into markdown by Showdown.
   */
  public showdownHTML: string;
  /**
   * A unique string representing the windowID of this Dialog Component in the WindowManager.
   */
  public windowID: string;
  /**
   * The windowManager instance, whose job it will be to create, maintain, and remove multiple open dialogs from the InfoMapper.
   */
  public windowManager: WindowManager = WindowManager.getInstance();
  

  constructor(public owfCommonService: OwfCommonService,
              public dialogRef: MatDialogRef<DialogDocComponent>,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.doc = dataObject.data.doc;
    this.docPath = dataObject.data.docPath;

    if (dataObject.data.geoLayerView.name) {
      this.informationName = dataObject.data.geoLayerView.name;
    } else if (dataObject.data.geoLayerView) {
      this.informationName = dataObject.data.geoLayerView;
    }

    if (dataObject.data.docText) this.docText = true;
    else if (dataObject.data.docMarkdown) this.docMarkdown = true;
    else if (dataObject.data.docHtml) this.docHTML = true;

    this.windowID = dataObject.data.windowID;
  }

  /**
   * This function is called on initialization of the map component, right after the constructor.
   */
  ngOnInit(): void {

    if (this.docMarkdown) {
      // Check to see if the markdown file has any input that is an image link syntax. If it does, we want users to
      // be able to set the path to the image relative to the markdown folder being displayed, so they don't have to
      // be burdened with putting a possibly extra long path.
      var sanitizedDoc = this.owfCommonService.sanitizeDoc(this.doc, IM.Path.mP);

      setTimeout(() => {
        this.showdownHTML = sanitizedDoc;
      });
    } else if (this.docHTML) {
      setTimeout(() => {          
        document.getElementById('docHTMLDiv').innerHTML = this.doc;
      });
    }
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked.
   */
  public onClose(): void {
    console.log('Dialog closed and removed from the Window Manager');
    this.dialogRef.close();
    this.windowManager.removeWindow(this.windowID);
  }

  /**
   * Called once, before the instance is destroyed. If the page is changed or a link is clicked on in the dialog that opens
   * a new map, make sure to close the dialog and remove it from the window manager.
   */
  public ngOnDestroy(): void {
    this.dialogRef.close();
    this.windowManager.removeWindow(this.windowID);
  }

}
