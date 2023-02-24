import { Component,
          OnInit }                 from '@angular/core';
import { MatDialog,
          MatDialogConfig,
          MatDialogRef }           from '@angular/material/dialog';

import { DialogD3Component,
          DialogDataTableComponent,
          DialogDocComponent,
          DialogGapminderComponent,
          DialogHeatmapComponent,
          DialogImageComponent,
          DialogTextComponent,
          DialogTSGraphComponent } from '@OpenWaterFoundation/common/ui/dialog';

import { WindowManager,
          WindowType }             from '@OpenWaterFoundation/common/ui/window-manager';
import { D3Chart,
          D3Prop,
          GeoLayerView,
          OwfCommonService,
          Path }                   from '@OpenWaterFoundation/common/services';

import { take }                    from 'rxjs/operators';


@Component({
  selector: 'app-owf-common',
  templateUrl: './owf-common.component.html',
  styleUrls: ['./owf-common.component.css']
})
export class OwfCommonComponent implements OnInit {

  /** The windowManager instance, whose job it will be to create, maintain, and remove
   * multiple open dialogs in an application. */
  windowManager: WindowManager = WindowManager.getInstance();
  /** Whether the application is currently showing the map component. */
  mapDisplay: boolean;
  /** Whether the application is currently showing the dialog menus. */
  menuDisplay: boolean;


  /**
   * 
   * @param dialog 
   * @param commonService 
   */
  constructor(private commonService: OwfCommonService, private dialog: MatDialog) {
    
  }


  ngOnInit(): void {
    this.menuDisplay = true;
  }


  /**
   * Opens the D3 Dialog example.
   */
  openD3ExampleDialog(): void {
    var windowID = 'geoLayerId-dialog-d3';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    this.commonService.getJSONData(this.commonService.buildPath(
    Path.d3P, ['/data-maps/data-ts/d3-treemap-config.json']))
    .subscribe((d3Config: D3Prop) => {
      d3Config.chartType = D3Chart.treemap;
    });

    var geoLayer = {
      name: 'Tree Stuff'
    };

    var colorScheme = ['#b30000', '#ff6600', '#ffb366', '#ffff00', '#59b300', '#33cc33',
      '#b3ff66', '#00ffff', '#66a3ff', '#003cb3'];

    var treeMapConfig: D3Prop = {
      chartType: D3Chart.treemap,
      dataPath: '/data-maps/data-ts/data.json',
      name: 'The name',
      parent: 'Parent Basin',
      children: 'assets',
      title: 'Tree Map Example Graph',
      colorScheme: colorScheme,
      value: 'SWE',
      height: 500,
      width: 500
    };

    var treeConfig: D3Prop = {
      chartType: D3Chart.tree,
      dataPath: '/data-maps/data-ts/data.json',
      name: 'Basin River Name',
      parent: 'Parent Basin',
      children: 'assets',
      title: 'Tree Example Graph',
      height: 3300,
      width: 935
    };

    const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        d3Prop: treeMapConfig,
        geoLayer: geoLayer,
        windowID: windowID
      }
        
      var dialogRef: MatDialogRef<DialogD3Component, any> = this.dialog.open(DialogD3Component, {
        data: dialogConfig,
        hasBackdrop: false,
        panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
        height: "650px",
        width: "815px",
        minHeight: "650px",
        minWidth: "615px",
        maxHeight: "100vh",
        maxWidth: "100vw"
      });

    this.windowManager.addWindow(windowID, WindowType.D3);
  }

  /**
   * 
   */
  openDataTableExampleDialog(): void {
    var windowID = 'geoLayerId-dialog-data-table';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    this.commonService.getJSONData('assets/app/map-layers/municipal-boundaries.geojson')
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
  openDocMarkdownExampleDialog(): void {
    var windowID = 'uniqueDocMarkdownID' + '-dialog-doc';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    var docPath = 'assets/app/Doc/doc-files/reservoir-levels-group.md';
    var text: boolean, markdown: boolean, html: boolean;
    // Set the type of display the Mat Dialog will show
    markdown = true;

    this.commonService.getPlainText(docPath)
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
  openDocTextExampleDialog(): void {
    var windowID = 'uniqueDocTextID' + '-dialog-doc';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    var docPath = 'assets/app/Doc/doc-files/swrf-line-layer-doc.txt';
    var text: boolean, markdown: boolean, html: boolean;
    // Set the type of display the Mat Dialog will show
    text = true;

    this.commonService.getPlainText(docPath)
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
  openDocHTMLExampleDialog(): void {
    var windowID = 'uniqueDocHtmlID' + '-dialog-doc';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    var docPath = 'assets/app/Doc/doc-files/cat-ipsum.html';
    var text: boolean, markdown: boolean, html: boolean;
    // Set the type of display the Mat Dialog will show
    html = true;

    this.commonService.getPlainText(docPath)
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
  openGapminderExampleDialog(): void {
    var windowID = 'uniqueGapminderExampleID' + '-dialog-doc';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    var geoLayer: GeoLayerView = {
      geoLayerId: 'geoLayerId',
      name: 'Gapminder Test'
    }
    this.commonService.setGapminderConfigPath('assets/app/data-maps/data-viz/viz-config/viz-config.json');

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      configPath: 'assets/app/data-maps/data-viz/viz-config/viz-config.json',
      geoLayer: geoLayer,
      windowID: windowID
    }
    const dialogRef: MatDialogRef<DialogGapminderComponent, any> = this.dialog.open(DialogGapminderComponent, {
      data: dialogConfig,
      hasBackdrop: false,
      panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
      height: "750px",
      width: "910px",
      minHeight: "425px",
      minWidth: "675px",
      maxHeight: "100vh",
      maxWidth: "100vw"
    });
    this.windowManager.addWindow(windowID, WindowType.GAP);
  }

  /**
   * Opens up a very basic plotly heatmap graph example dialog.
   */
  openHeatmapExampleDialog(): void {
    // streamflow-graph-template.json
    this.commonService.getJSONData('assets/app/data-maps/data-ts/streamflow-graph-template.json')
    .subscribe((graphTemplateObject: any) => {

      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        // 0300911.DWR.DivTotal.Month.stm
        graphFilePath: 'assets/app/data-maps/data-ts/0300911.DWR.DivTotal.Month.stm',
        graphTemplateObject: graphTemplateObject
      }
      const dialogRef: MatDialogRef<DialogHeatmapComponent, any> = this.dialog.open(DialogHeatmapComponent, {
        data: dialogConfig,
        hasBackdrop: false,
        panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
        height: "750px",
        width: "910px",
        // minHeight: "425px",
        // minWidth: "675px",
        // maxHeight: "70vh",
        // maxWidth: "80vw"
        // Keeping static for now.
        minHeight: "750px",
        minWidth: "910px",
        maxHeight: "750px",
        maxWidth: "910px"
      });

    });

  }

  /**
   * 
   */
  openImageExampleDialog(): void {

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
  openTextExampleDialog(): void {
    var windowID = 'uniqueTextID' + '-dialog-text';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    var pathObj = {
      absolutePath: "assets/app/",
      relativePath: "Text/"
    }

    this.commonService.getPlainText("assets/app/Text/text-files/0300911.H2.xdd").subscribe((text: any) => {
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
  openTSGraphExampleDialog(): void {

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
      // TSIDLocation: TSIDLocation
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
