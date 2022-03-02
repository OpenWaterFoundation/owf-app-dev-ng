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
  /** Shows if the current documentation type is a regular text file. */
  public docText: boolean;
  /** Shows if the current documentation type is a markdown file. */
  public docMarkdown: boolean;
  /** Shows if the current documentation type is an HTML file. */
  public docHTML: boolean;
  /** The string containing the documentation that needs to be displayed in this
   * DialogDocComponent. */
  public doc: string;
  /** The string representing the path to the documentation file to be displayed. */
  public docPath: string;
  /** The full path to the folder containing the markdown file. */
  public fullMarkdownPath: string;
  /** The Id from the given geoMapId, geoLayerViewGroupId, or geoLayerViewId. */
  public geoId: string;
  /** The name property from the geoMap, geoLayerViewGroup, or geoLayerView. */
  public geoName: string;
  /** Used as a path resolver and contains the path to the map configuration that
   * is using this TSGraphComponent. To be set in the app service for relative paths. */
   public mapConfigPath: string;
  /** The Showdown config option object. Overrides an app `app.module.ts` config 
   * option object. */
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
  /** The formatted string to be converted into markdown by Showdown. */
  public showdownHTML: string;
  /** A unique string representing the windowID of this Dialog Component in the
   * WindowManager. */
  public windowID: string;
  /** The windowManager instance, which creates, maintains, and removes multiple
   * open dialogs in an application. */
  public windowManager: WindowManager = WindowManager.getInstance();
  

  constructor(public owfCommonService: OwfCommonService,
              public dialogRef: MatDialogRef<DialogDocComponent>,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.doc = dataObject.data.doc;
    this.docPath = dataObject.data.docPath;
    this.fullMarkdownPath = dataObject.data.fullMarkdownPath;
    this.geoId = dataObject.data.geoId;
    this.geoName = dataObject.data.geoName;

    if (dataObject.data.docText) this.docText = true;
    else if (dataObject.data.docMarkdown) this.docMarkdown = true;
    else if (dataObject.data.docHtml) this.docHTML = true;

    this.mapConfigPath = dataObject.data.mapConfigPath;
    this.windowID = dataObject.data.windowID;
  }


  /**
   * This function is called on initialization of the map component, right after
   * the constructor.
   */
  ngOnInit(): void {
    if (this.mapConfigPath && this.fullMarkdownPath) {
      this.owfCommonService.setMapConfigPath(this.mapConfigPath);
      this.owfCommonService.setFullMarkdownPath(this.fullMarkdownPath);
    }

    if (this.docMarkdown) {
      // Check to see if the markdown file has any input that is an image link syntax.
      // If it does, we want users to be able to set the path to the image relative
      // to the markdown folder being displayed, so they don't have to be burdened
      // with putting a possibly extra long path.
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
   * Closes the Mat Dialog popup when the Close button is clicked, and removes this
   * dialog's window ID from the windowManager.
   */
  public onClose(): void {
    this.dialogRef.close();
    this.windowManager.removeWindow(this.windowID);
  }

  /**
   * Called once, before the instance is destroyed. If the page is changed or a
   * link is clicked on in the dialog that opens a new map, make sure to close the
   * dialog and remove it from the window manager.
   */
  public ngOnDestroy(): void {
    this.dialogRef.close();
    this.windowManager.removeWindow(this.windowID);
  }

}
