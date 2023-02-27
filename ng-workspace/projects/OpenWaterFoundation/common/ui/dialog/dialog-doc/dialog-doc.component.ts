import { Component,
          Inject,
          OnDestroy,
          OnInit, }         from '@angular/core';
import { MatDialogRef,
          MAT_DIALOG_DATA } from '@angular/material/dialog';

import { OwfCommonService, Path } from '@OpenWaterFoundation/common/services';

import { faXmark }          from '@fortawesome/free-solid-svg-icons';

import { WindowManager }    from '@OpenWaterFoundation/common/ui/window-manager';


@Component({
  selector: 'app-dialog-doc',
  templateUrl: './dialog-doc.component.html',
  styleUrls: ['./dialog-doc.component.css', '../main-dialog-style.css']
})
export class DialogDocComponent implements OnInit, OnDestroy {
  /** Shows if the current documentation type is a regular text file. */
  docText: boolean;
  /** Shows if the current documentation type is a markdown file. */
  docMarkdown: boolean;
  /** Shows if the current documentation type is an HTML file. */
  docHTML: boolean;
  /** The string containing the documentation that needs to be displayed in this
   * DialogDocComponent. */
  doc: string;
  /** The string representing the path to the documentation file to be displayed. */
  docPath: string;
  /** The full path to the folder containing the markdown file. */
  fullMarkdownPath: string;
  /** The Id from the given geoMapId, geoLayerViewGroupId, or geoLayerViewId. */
  geoId: string;
  /** The name property from the geoMap, geoLayerViewGroup, or geoLayerView. */
  geoName: string;
  /** Used as a path resolver and contains the path to the map configuration that
   * is using this TSGraphComponent. To be set in the app service for relative paths. */
  mapConfigPath: string;
  /** The Showdown config option object. Overrides an app `app.module.ts` config 
   * option object. */
  showdownOptions = {
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
  showdownHTML: string;
  /** A unique string representing the windowId of this Dialog Component in the
   * WindowManager. */
  windowId: string;
  /** The windowManager instance, which creates, maintains, and removes multiple
   * open dialogs in an application. */
  windowManager: WindowManager = WindowManager.getInstance();
  /** All used icons in the DialogDocComponent. */
  faXmark = faXmark;
  

  /**
   * Constructor for the DialogDocComponent.
   * @param commonService 
   * @param dialogRef 
   * @param matDialogData 
   */
  constructor(
    private commonService: OwfCommonService,
    private dialogRef: MatDialogRef<DialogDocComponent>,
    @Inject(MAT_DIALOG_DATA) private matDialogData: any
  ) {

    this.doc = this.matDialogData.doc;
    this.docPath = this.matDialogData.docPath;
    this.fullMarkdownPath = this.matDialogData.fullMarkdownPath;
    this.geoId = this.matDialogData.geoId;
    this.geoName = this.matDialogData.geoName;

    if (this.matDialogData.docText) this.docText = true;
    else if (this.matDialogData.docMarkdown) this.docMarkdown = true;
    else if (this.matDialogData.docHtml) this.docHTML = true;

    this.mapConfigPath = this.matDialogData.mapConfigPath;
    this.windowId = this.matDialogData.windowId;
  }


  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive. Called after the constructor.
   */
  ngOnInit(): void {
    if (this.mapConfigPath && this.fullMarkdownPath) {
      this.commonService.setMapConfigPath(this.mapConfigPath);
      this.commonService.setFullMarkdownPath(this.fullMarkdownPath);
    }

    if (this.docMarkdown) {
      // Check to see if the markdown file has any input that is an image link syntax.
      // If it does, we want users to be able to set the path to the image relative
      // to the markdown folder being displayed, so they don't have to be burdened
      // with putting a possibly extra long path.
      var sanitizedDoc = this.commonService.sanitizeDoc(this.doc, Path.mP);

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
  onClose(): void {
    this.dialogRef.close();
  }

  /**
   * Called once, before the instance is destroyed. If the page is changed or a
   * link is clicked on in the dialog that opens a new map, make sure to close the
   * dialog and remove it from the window manager.
   */
  ngOnDestroy(): void {
    this.windowManager.removeWindow(this.windowId);
  }

}
