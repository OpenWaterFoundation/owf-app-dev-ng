import { Component,
          Inject,
          OnDestroy,
          OnInit }                      from '@angular/core';
import { MatDialogRef,
          MAT_DIALOG_DATA }             from '@angular/material/dialog';
import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';

import * as FileSaver                   from 'file-saver';

import { OwfCommonService }             from '@OpenWaterFoundation/common/services';
import * as IM                          from '@OpenWaterFoundation/common/services';

import { WriteDelimitedFile_Command }   from '@OpenWaterFoundation/common/ts-command-processor/commands/delimited';
import { DateTimeFormatterType }        from '@OpenWaterFoundation/common/util/time';
import { TS }                           from '@OpenWaterFoundation/common/ts';
import { WindowManager }                from '@OpenWaterFoundation/common/ui/window-manager';


@Component({
  selector: 'app-dialog-tstable',
  templateUrl: './dialog-tstable.component.html',
  styleUrls: ['./dialog-tstable.component.css', '../main-dialog-style.css']
})
export class DialogTSTableComponent implements OnInit, OnDestroy {
  /**
   * The object housing the data to be displayed in the data table as a TableVirtualScrollDataSource instance. Used to virtually
   * scroll large data tables quickly and efficiently.
   */
  public attributeTable: TableVirtualScrollDataSource<any>;
  /** The name of the first column, which could be DATE or DATE / TIME. */
  public dateTimeColumnName: string;
  /** An array of strings of each column name in the data table. */
  public displayedColumns: string[] = [];
  /** A string representing the downloadFile action property from the popup configuration file if one is given. */
  public downloadFileName: string;
  /** The object containing the selected feature's properties as the key, and the description/value as the value. */
  public featureProperties: any;
  /** Shows whether the file trying to be downloaded was originally a TS file. */
  private isTSFile: boolean;
  /**
   * The array of TS objects that was originally read in using the StateMod or DateValue Java converted code. Needed when
   * downloading from a TS file in the writeTimeSeries converted Java function.
   */
  public TSArrayRef: TS[];
  /**
   * An array for holding all column header titles for the data table past the first column.
   * To be used for downloading as a CSV file.
   */
  public valueColumns: string[];
  /** A unique string representing the windowID of this Dialog Component in the WindowManager. */
  public windowID: string;
  /** The windowManager instance, which creates, maintains, and removes multiple open dialogs in an application. */
  public windowManager: WindowManager = WindowManager.getInstance();


  /**
   * 
   * @param dialogRef The reference to the DialogTSGraphComponent. Used for creation and sending of data.
   * @param owfCommonService The reference to the app service, for sending data between components and higher scoped map variables.
   * @param dataObject The object containing data passed from the Component that created this Dialog.
   */
  constructor(public dialogRef: MatDialogRef<DialogTSTableComponent>,
              public owfCommonService: OwfCommonService,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.attributeTable = new TableVirtualScrollDataSource(dataObject.data.attributeTable);
    this.dateTimeColumnName = dataObject.data.dateTimeColumnName;
    this.displayedColumns = Object.keys(this.attributeTable.data[0]);
    this.downloadFileName = dataObject.data.downloadFileName ? dataObject.data.downloadFileName : undefined;
    this.featureProperties = dataObject.data.featureProperties;
    this.isTSFile = dataObject.data.isTSFile;
    this.TSArrayRef = dataObject.data.TSArrayRef;
    this.windowID = dataObject.data.windowID;
    this.valueColumns = dataObject.data.valueColumns;
  }


  /**
   * Function that applies the necessary trimming to a filter query from the user
   * @param event The event passed when a DOM event is detected (user inputs into filter field)
   */
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.attributeTable.filter = filterValue.trim().toUpperCase();
  }

  ngOnInit(): void { }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked, and removes this
   * dialog's window ID from the windowManager.
   */
  public onClose(): void {
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

  /**
   * When the Save button is clicked in the time series data table, call the writeTimeSeries function with the correct arguments
   * so the CSV string can be created to be written to a file.
   */
  public saveDataTable(): void {
    // If the file read in was a Time Series file, call the imported TSTool code to deal with creating the right string for CSV creation
    if (this.isTSFile) {
      var writeDelimited: WriteDelimitedFile_Command = new WriteDelimitedFile_Command();
      var textToSave: string = writeDelimited.writeTimeSeries(this.TSArrayRef, this.dateTimeColumnName, DateTimeFormatterType.C, null,
      this.valueColumns.join(','), null, ',', 2, 'NaN', null, null, [''], ['problems']);
      var data = new Blob([textToSave], { type: 'text/plain;charset=utf-8' });
      // Send the download file name to format it correctly, along with the SaveFileType enum
      FileSaver.saveAs(data, this.owfCommonService.formatSaveFileName(this.downloadFileName, IM.SaveFileType.tstable, this.featureProperties));
    }
    // If the file read in was itself a CSV file, create the correct string for downloading the file again. This is similar
    // to regular data table dialog download
    else {
      var textToSave = '';
      var propertyIndex = 0;
      var columnNameTemp: string[] = [];
      // Iterate over the displayedColumns and create a temporary array to add quotes around each column heading
      this.displayedColumns.forEach((str: string) => {
        columnNameTemp.push('"' + str + '"');
      });
      textToSave += columnNameTemp.join(',') + '\n';

      for (let row of this.attributeTable.data) {
        for (let property in row) {
          // Check to see if at last property so that the delimiter (,) isn't appended
          if (propertyIndex === Object.keys(row).length - 1) {
            // Check if the value is a string; if it is, surround with quotes so any potential commas will be ignored by Excel
            if (typeof row[property] === 'string') {
              // Check the original value for quotes (before potentially adding them below) and if it contains a 
              if (row[property].includes('"')) {
                textToSave += row[property].split('"').join('"""');
              }
              textToSave += "\"" + row[property] + "\"";
            } else {
              textToSave += row[property];
            }
          }
          // The property isn't the last, so append the delimiter (,) to the value
          else {
            if (typeof row[property] === 'string') {
              if (row[property].includes('"')) {
                textToSave += row[property].split('"').join('"""');
              }
              textToSave += "\"" + row[property] + "\",";
            } else {
              textToSave += row[property] + ',';
            }
          }
          ++propertyIndex;
        }
        textToSave += '\n';
      }

      var data = new Blob([textToSave], { type: 'text/plain;charset=utf-8' });
      // Send the download file name to format, along with the SaveFileType enum
      FileSaver.saveAs(data, this.owfCommonService.formatSaveFileName(this.downloadFileName, IM.SaveFileType.tstable));
    }
    
  }

}
