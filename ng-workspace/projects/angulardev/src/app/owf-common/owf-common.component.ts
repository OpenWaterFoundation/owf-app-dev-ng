import { Component,
          OnInit }                 from '@angular/core';
import { MatDialog,
          MatDialogConfig,
          MatDialogRef }           from '@angular/material/dialog';

import { DialogDataTableComponent,
          DialogDocComponent,
          DialogImageComponent,
          DialogTextComponent,
          DialogTSGraphComponent } from '@OpenWaterFoundation/common/ui/dialog';
import { WindowManager,
          WindowType }             from '@OpenWaterFoundation/common/ui/window-manager';
import { OwfCommonService }        from '@OpenWaterFoundation/common/services';
import * as IM                     from '@OpenWaterFoundation/common/services';

import { take }                    from 'rxjs/operators';


@Component({
  selector: 'app-owf-common',
  templateUrl: './owf-common.component.html',
  styleUrls: ['./owf-common.component.css']
})
export class OwfCommonComponent implements OnInit {

  /**
   * The windowManager instance, whose job it will be to create, maintain, and remove multiple open dialogs from the InfoMapper.
   */
  public windowManager: WindowManager = WindowManager.getInstance();


  constructor(public dialog: MatDialog,
              private owfCommonService: OwfCommonService) { }


  ngOnInit(): void {
  }

  /**
   * 
   */
  public openDataTableExampleDialog(): void {
    var windowID = 'geoLayerId-dialog-data-table';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    this.owfCommonService.getJSONData('assets/app/map-layers/municipal-boundaries.geojson')
    .subscribe((allFeatures: any) => {

      var geoLayerId = 'geoLayerId', geoLayerViewName = 'geoLayerViewName';
      var selectedLayers = {};
      var mainMap = {};
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        allFeatures: allFeatures,
        geometryType: 'WKT:Polygon',
        geoLayerId: geoLayerId,
        geoLayerViewName: geoLayerViewName,
        selectedLayers: selectedLayers,
        mainMap: mainMap
      }
      const dialogRef: MatDialogRef<DialogDataTableComponent, any> = this.dialog.open(DialogDataTableComponent, {
        data: dialogConfig,
        hasBackdrop: false,
        panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
        height: "750px",
        width: "910px",
        minHeight: "275px",
        minWidth: "675px",
        maxHeight: "90vh",
        maxWidth: "90vw"
      });
      this.windowManager.addWindow(windowID, WindowType.TABLE);
    });
  }

  /**
   * 
   */
  public openDocMarkdownExampleDialog(): void {
    var windowID = 'uniqueDocMarkdownID' + '-dialog-doc';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    var docPath = 'assets/app/Doc/doc-files/reservoir-levels-group.md';
    var text: boolean, markdown: boolean, html: boolean;
    // Set the type of display the Mat Dialog will show
    markdown = true;

    this.owfCommonService.getPlainText(docPath)
    .pipe(take(1))
    .subscribe((doc: any) => {

      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        doc: doc,
        docPath: docPath,
        docText: text,
        docMarkdown: markdown,
        docHtml: html,
        geoLayerView: 'Doc Markdown Example',
        windowID: windowID
      }
        
      var dialogRef: MatDialogRef<DialogDocComponent, any> = this.dialog.open(DialogDocComponent, {
        data: dialogConfig,
        hasBackdrop: false,
        panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
        height: "725px",
        width: "700px",
        minHeight: "240px",
        minWidth: "550px",
        maxHeight: "90vh",
        maxWidth: "90vw"
      });
      this.windowManager.addWindow(windowID, WindowType.DOC);
    });
  }

  /**
   * 
   */
  public openDocTextExampleDialog(): void {
    var windowID = 'uniqueDocTextID' + '-dialog-doc';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    var docPath = 'assets/app/Doc/doc-files/swrf-line-layer-doc.txt';
    var text: boolean, markdown: boolean, html: boolean;
    // Set the type of display the Mat Dialog will show
    text = true;

    this.owfCommonService.getPlainText(docPath)
    .pipe(take(1))
    .subscribe((doc: any) => {

      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        doc: doc,
        docPath: docPath,
        docText: text,
        docMarkdown: markdown,
        docHtml: html,
        geoLayerView: 'Doc Text Example',
        windowID: windowID
      }
        
      var dialogRef: MatDialogRef<DialogDocComponent, any> = this.dialog.open(DialogDocComponent, {
        data: dialogConfig,
        hasBackdrop: false,
        panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
        height: "725px",
        width: "700px",
        minHeight: "240px",
        minWidth: "550px",
        maxHeight: "90vh",
        maxWidth: "90vw"
      });
      this.windowManager.addWindow(windowID, WindowType.DOC);
    });
  }

  /**
   * 
   */
  public openDocHTMLExampleDialog(): void {
    var windowID = 'uniqueDocHtmlID' + '-dialog-doc';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    var docPath = 'assets/app/Doc/doc-files/cat-ipsum.html';
    var text: boolean, markdown: boolean, html: boolean;
    // Set the type of display the Mat Dialog will show
    html = true;

    this.owfCommonService.getPlainText(docPath)
    .pipe(take(1))
    .subscribe((doc: any) => {

      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        doc: doc,
        docPath: docPath,
        docText: text,
        docMarkdown: markdown,
        docHtml: html,
        geoLayerView: 'Doc HTML Example',
        windowID: windowID
      }
        
      var dialogRef: MatDialogRef<DialogDocComponent, any> = this.dialog.open(DialogDocComponent, {
        data: dialogConfig,
        hasBackdrop: false,
        panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
        height: "725px",
        width: "700px",
        minHeight: "240px",
        minWidth: "550px",
        maxHeight: "90vh",
        maxWidth: "90vw"
      });
      this.windowManager.addWindow(windowID, WindowType.DOC);
    });
  }

  /**
   * 
   */
  public openImageExampleDialog(): void {

    var windowID = 'uniqueImageID' + '-dialog-image';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    var pathObj = {
      absolutePath: "assets/app/",
      relativePath: "img/"
    }

      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        dialogID: windowID,
        imagePath: pathObj.absolutePath + pathObj.relativePath + '402-SNODAS-SnowCover.png',
        imageDescription: ''
      }
      const dialogRef: MatDialogRef<DialogImageComponent, any> = this.dialog.open(DialogImageComponent, {
        data: dialogConfig,
        // This stops the dialog from containing a backdrop, which means the background opacity is set to 0, and the
        // entire InfoMapper is still navigable while having the dialog open. This way, you can have multiple dialogs
        // open at the same time.
        hasBackdrop: false,
        panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
        height: "800px",
        width: "900px",
        minHeight: "500px",
        minWidth: "525px",
        maxHeight: "65vh",
        maxWidth: "80vw"
      });
      this.windowManager.addWindow(windowID, WindowType.DOC);
  }

  /**
   * 
   */
  public openTextExampleDialog(): void {
    var windowID = 'uniqueTextID' + '-dialog-text';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    var pathObj = {
      absolutePath: "assets/app/",
      relativePath: "Text/"
    }

    this.owfCommonService.getPlainText("assets/app/Text/text-files/0300911.H2.xdd").subscribe((text: any) => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        windowID: windowID,
        text: text,
        resourcePath: pathObj.absolutePath + pathObj.relativePath + 'text-files/0300911.H2.xdd'
      }
      const dialogRef: MatDialogRef<DialogTextComponent, any> = this.dialog.open(DialogTextComponent, {
        data: dialogConfig,
        // This stops the dialog from containing a backdrop, which means the background opacity is set to 0, and the
        // entire InfoMapper is still navigable while having the dialog open. This way, you can have multiple dialogs
        // open at the same time.
        hasBackdrop: false,
        panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
        height: "750px",
        width: "900px",
        minHeight: "290px",
        minWidth: "450px",
        maxHeight: "90vh",
        maxWidth: "90vw"
      });
      this.windowManager.addWindow(windowID, WindowType.DOC);
    });

  }

  /**
   * 
   */
  public openTSGraphExampleDialog(): void {

    var pathResolverObj = {
      absolutePath: "assets/app/",
      relativePath: "TSGraph/"
    }
    // Create a MatDialogConfig object to pass to the DialogTSGraphComponent for the graph that will be shown
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      windowID: 'uniqueTSGraphWindowId',
      // featureProperties: featureProperties,
      chartPackage: 'plotly',
      // graphTemplate: graphTemplateObject,
      // graphFilePath: graphFilePath,
      // This cool piece of code uses quite a bit of syntactic sugar. It dynamically sets the saveFile based on the
      // condition that saveFile is defined, using the spread operator. More information was found here:
      // https://medium.com/@oprearocks/what-do-the-three-dots-mean-in-javascript-bc5749439c9a
      // ...(downloadFileName && { downloadFileName: downloadFileName }),
      // TSID_Location: TSID_Location
    }
    const dialogRef: MatDialogRef<DialogTSGraphComponent, any> = this.dialog.open(DialogTSGraphComponent, {
      data: dialogConfig,
      hasBackdrop: false,
      panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
      height: "700px",
      width: "910px",
      minHeight: "700px",
      minWidth: "910px",
      maxHeight: "700px",
      maxWidth: "910px"
    });
  }

}
