import { Component,
          Inject, 
          OnDestroy, 
          OnInit}                 from '@angular/core';
import { MatDialog,
          MatDialogConfig,
          MatDialogRef,
          MAT_DIALOG_DATA }       from '@angular/material/dialog';

import { Subscription }           from 'rxjs';

import { DialogTSTableComponent } from '../dialog-tstable/dialog-tstable.component';

import { TS }                     from '@OpenWaterFoundation/common/ts';
import { OwfCommonService }       from '@OpenWaterFoundation/common/services';
import * as IM                    from '@OpenWaterFoundation/common/services';
import { WindowManager,
          WindowType }            from '@OpenWaterFoundation/common/ui/window-manager';


@Component({
  selector: 'dialog-TSGraph',
  templateUrl: './dialog-TSGraph.component.html',
  styleUrls: ['./dialog-TSGraph.component.css', '../main-dialog-style.css']
})
export class DialogTSGraphComponent implements OnInit, OnDestroy {

  /** The array of objects to pass to the tstable component for data table creation. */
  public attributeTable: any[] = [];
  /** Object that will be assigned by data passed up from the Chart component, and
   * used to create a TSTable dialog. */
  attributeTableParams: IM.AttributeTableParams;
  /** This variable lets the template file know if neither a CSV, DateValue, or
   * StateMod file is given. */
  public badFile = false;
  /** Object that is sent down to the Chart component for displaying. */
  chartDialog: IM.ChartDialog;
  /** A string representing the chartPackage property given (or not) from a popup
   * configuration file. */
  public chartPackage: string;
  /** A string containing the name to be passed to the TSTableComponent's first
   * column name: DATE or DATE / TIME. */
  public dateTimeColumnName: string;
  /** The graph template object retrieved from the popup configuration file property
   * resourcePath. */
  public graphTemplateObject: any;
  /** The name of the download file for the dialog-tstable component. */
  private downloadFileName: string;
  /** The object containing all of the layer's feature properties. */
  public featureProperties: any;
  /** Subscription to be unsubscribed to at component destruction to prevent memory
   * leaks.*/
  private forkJoinSub$: Subscription;
  /** The absolute or relative path to the data file used to populate the graph
   * being created. */
  public graphFilePath: string;
  /** Boolean for helping dialog-tstable component determine what kind of file needs
   * downloading. */
  public isTSFile: boolean;
  /** A string representing the documentation retrieved from the txt, md, or html
   * file to be displayed for a layer. */
  public mainTitleString: string;
  /** Used as a path resolver and contains the path to the map configuration that
   * is using this TSGraphComponent. To be set in the app service for relative paths. */
  public mapConfigPath: string;
  /** The array of TS objects that was originally read in using the StateMod or DateValue
   * Java converted code. Used as a reference in the dialog-tstable component for
   * downloading to the user's local machine. */
  public TSArrayOGResultRef: TS[];
  /** The string representing the TSID before the first tilde (~) in the graph template
   * object. Used to help create a unique graph ID. */
  public TSIDLocation: string;
  /** An array containing the value header names after the initial DATE / TIME
   * header. To be passed to dialog-tstable for downloading files. */
  public valueColumns: string[] = [];
  /** A string representing the button ID of the button clicked to open this dialog. */
  public windowID: string;
  /** The windowManager instance, which creates, maintains, and removes multiple
   * open dialogs in an application. */
  public windowManager: WindowManager = WindowManager.getInstance();


  /**
   * @constructor for the DialogTSGraph Component.
   * @param commonService Reference to the top level service OwfCommonService.
   * @param dialog Reference to the service that creates Mat dialogs.
   * @param dialogRef Reference to this DialogTSGraphComponent.
   * @param dataObject The incoming templateGraph object containing data about from the graph template file.
   */
  constructor(private commonService: OwfCommonService,
              private dialog: MatDialog,
              private dialogRef: MatDialogRef<DialogTSGraphComponent>,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.windowID = dataObject.data.windowID;
    this.featureProperties = dataObject.data.featureProperties;
    this.chartPackage = dataObject.data.chartPackage;
    this.downloadFileName = dataObject.data.downloadFileName ? dataObject.data.downloadFileName : undefined;
    this.graphTemplateObject = dataObject.data.graphTemplate;
    this.graphFilePath = dataObject.data.graphFilePath;
    this.mapConfigPath = dataObject.data.mapConfigPath;
    this.TSIDLocation = dataObject.data.TSIDLocation;
  }


  

  /**
  * Initial function call when the Dialog component is created. Determines whether
  * a CSV or StateMod file is to be read for graph creation.
  */
  ngOnInit(): void {
    this.commonService.setMapConfigPath(this.mapConfigPath);
    this.commonService.setChartTemplateObject(this.graphTemplateObject);
    this.commonService.setGraphFilePath(this.graphFilePath);
    this.commonService.setTSIDLocation(this.TSIDLocation);

    this.chartDialog = { graphTemplate: this.graphTemplateObject };
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
   * Called once, before the instance is destroyed. If the page is changed or a link
   * is clicked on in the dialog that opens a new map, make sure to close the dialog
   * and remove it from the window manager.
   */
  public ngOnDestroy(): void {
    if (this.forkJoinSub$) {
      this.forkJoinSub$.unsubscribe();
    }
    this.dialogRef.close();
    this.windowManager.removeWindow(this.windowID);
  }

  /**
   * Creates and opens the DialogTSTableComponent dialog container showing the time
   * series table for the selected feature on the Leaflet map.
   */
  openTSTableDialog(): void {
    // Used for testing large data tables
    // for (let i = 0; i < 7; i++) {
    //   this.attributeTable = this.attributeTable.concat(this.attributeTable);
    // }

    var windowID = this.windowID + '-dialog-ts-table';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    // Create and use a MatDialogConfig object to pass to the DialogTSGraphComponent
    // for the graph that will be shown.
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      attributeTable: this.attributeTableParams.attributeTable,
      dateTimeColumnName: this.attributeTableParams.dateTimeColumnName,
      downloadFileName: this.downloadFileName ? this.downloadFileName : undefined,
      featureProperties: this.featureProperties,
      isTSFile: this.isTSFile,
      TSArrayRef: this.TSArrayOGResultRef,
      windowID: windowID,
      valueColumns: this.attributeTableParams.valueColumns
    }
    const dialogRef: MatDialogRef<DialogTSTableComponent, any> = this.dialog.open(DialogTSTableComponent, {
      data: dialogConfig,
      hasBackdrop: false,
      panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
      height: "700px",
      width: "650px",
      minWidth: "450px",
      minHeight: "300px",
      maxHeight: "90vh",
      maxWidth: "90vw"
    });
    this.windowManager.addWindow(windowID, WindowType.TABLE);
  }

  /**
   * Updates when the Chart component builds and sends an object with the necessary
   * data to create, open, and display its contents in a data table dialog.
   * @param attributeTableParams The object that holds the data needed for creating
   * a TSTable dialog component.
   */
  setAttributeTableParams(attributeTableParams: IM.AttributeTableParams): void {
    this.attributeTableParams = attributeTableParams;
  }

}