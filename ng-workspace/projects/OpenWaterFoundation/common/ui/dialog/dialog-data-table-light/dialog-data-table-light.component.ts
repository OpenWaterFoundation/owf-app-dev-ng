import { Component,
          EventEmitter,
          Inject,
          OnInit,
          Output }                      from '@angular/core';
import { MatDialog,
          MatDialogRef,
          MAT_DIALOG_DATA }             from '@angular/material/dialog';
import { SelectionModel }               from '@angular/cdk/collections';

import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';
import * as FileSaver                   from 'file-saver';

import { faXmark }                      from '@fortawesome/free-solid-svg-icons';

import { OwfCommonService }             from '@OpenWaterFoundation/common/services';
import * as IM                          from '@OpenWaterFoundation/common/services';
import { WindowManager }                from '@OpenWaterFoundation/common/ui/window-manager';
import { MapLayerManager,
          MapLayerItem }                from '@OpenWaterFoundation/common/ui/layer-manager';


@Component({
  selector: 'lib-dialog-data-table-light',
  templateUrl: './dialog-data-table-light.component.html',
  styleUrls: ['./dialog-data-table-light.component.css', '../main-dialog-style.css']
})
export class DialogDataTableLightComponent implements OnInit {
  /** The original object containing all features in the layer. */
  public attributeTableOriginal: any;
  /** The copied object for displaying data a Material Table's cells. Is an instance
   * of TableVirtualScrollDataSource, needed for using the third party virtual scrolling
   * with an Angular Material Table. It extends the Angular Material DataSource class. */
  public attributeTable: TableVirtualScrollDataSource<any>;
  /** Used to determine which matInputFilterText option to display. */
  public defaultRadioDisabled = true;
  /** Array containing the names of all header columns in the Material Table. */
  public displayedColumns: string[];
  /** EventEmitter that alerts the Map component (parent) that an update has happened,
   * and sends the basin name. */
  @Output() featureHighlighted = new EventEmitter<boolean>();
  /** The layer's geoLayer. */
  public geoLayer: any;
  /** The name of the geoMap the layer resides in. */
  public geoMapName: string;
  /** Object containing the layer geoLayerId as the ID, and an object of properties
   * set by a user-defined classification file. */
  public layerClassificationInfo: any;
  /** Object containing the URL as the key and value, so each link is unique.
   * Used by the template file to use as the link's href. */
  public links: {} = {};
  /**
   * 
   */
  public mapConfigPath: string;
  /** The instance of the MapLayerManager, a helper class that manages MapLayerItem objects with Leaflet layers
   * and other layer data for displaying, ordering, and highlighting. */
  public mapLayerManager: MapLayerManager = MapLayerManager.getInstance();
  /** Used by the template file to display how many features are highlighted on the map. */
  public matchedRows: number;
  /** Dynamic string to show in the filter input area to a user. Default is set on initialization. */
  public matInputFilterText = 'Filter all columns using the filter string. Press Enter to execute the filter.';

  public originalStyle: any;
  /** Holds the string that was previously entered by the user. */
  private prevSearch = '';
  /**
   * The type of search the filter is currently performing. Can be:
   * * `columns`
   */
  public searchType = 'columns';
  // TODO: jpkeahey 2020.10.27 - Commented out. Will be used for row selection
  /**
   * Used by the template file to display how many rows (features in the layer) are selected on the data table.
   */
  // public selectedRows = 0;
  /** Object needed to show and deal with the checkboxes on the data table when selecting each row in the Material Table. */
  public selection: SelectionModel<any>;
  /** A unique string representing the windowID of this Dialog Component in the WindowManager. */
  public windowID: string;
  /** The windowManager instance, which creates, maintains, and removes multiple open dialogs in an application. */
  public windowManager: WindowManager = WindowManager.getInstance();
  /** All used icons in the DialogDataTableLightComponent. */
  faXmark = faXmark;


  /**
   * @constructor for the Dialog Data Table.
   * @param commonService The reference to the OwfCommonService injected object.
   * @param dialogRef The reference to the DialogTSGraphComponent. Used for creation and sending of data.
   * @param dataObject The object containing data passed from the Component that created this Dialog.
   */
  constructor(public commonService: OwfCommonService,
              public dialog: MatDialog,
              public dialogRef: MatDialogRef<DialogDataTableLightComponent>,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.attributeTable = new TableVirtualScrollDataSource(dataObject.data.allFeatures);
    this.attributeTableOriginal = JSON.parse(JSON.stringify(dataObject.data.allFeatures));
    this.displayedColumns = Object.keys(dataObject.data.allFeatures[0]);
    // Manually add the select column to the displayed Columns. This way checkboxes can be added below
    // TODO: jpkeahey 2020.10.16 - Uncomment out for checkboxes in data table
    // this.displayedColumns.unshift('select');
    this.geoLayer = dataObject.data.geoLayer;
    this.geoMapName = dataObject.data.geoMapName;
    this.layerClassificationInfo = dataObject.data.layerClassificationInfo;
    // This is needed for testing the library.
    // this.geometryType = 'WKT:Polygon';

    this.matchedRows = this.attributeTable.data.length;

    // TODO: jpkeahey 2020.10.16 - Uncomment out for checkboxes in data table
    // this.selection = new SelectionModel<any>(true, []);
    this.windowID = dataObject.data.windowID;
  }


  /**
   * Function that applies the necessary trimming to a filter query from the user.
   * @param event The event passed when a DOM event is detected (user inputs into filter field)
   */
  public applyFilter(event: KeyboardEvent) {
    var layerItem: MapLayerItem = this.mapLayerManager.getMapLayerItem(this.geoLayer.geoLayerId);

    // TODO jpkeahey 2021.05.17 - This will check to see if the filter value changed. It might be used in the future for 
    // query suppression.
    // if ((event.target as HTMLInputElement).value === this.prevSearch) {
    //   return;
    // }
    

    // If the keyup event is an empty string, then the user has either selected text and deleted it, or backspaced until the
    // search field is empty. In that case, do the table search and if the selected layer exists, reset the highlighting.
    if ((event.target as HTMLInputElement).value === '') {
      const filterValue = (event.target as HTMLInputElement).value;
      this.prevSearch = filterValue;
      this.attributeTable.filter = filterValue.trim().toUpperCase();
      this.matchedRows = this.attributeTable.data.length;
    }
    // If the keyup event is not empty, attempt to populate the selectedLayer object. If the Enter key was not pressed by the user,
    // then don't do anything else. If the Enter key was pressed, check if the selected layer exists, and highlight the correct
    // features if it does. This should hopefully help with large datasets, as it only checks when enter is pressed, and not for
    // every letter that the keyup is detected.
    else {
      if (event.code && (event.code.toUpperCase() === 'ENTER' || event.code.toUpperCase() === 'NUMPADENTER')) {

        if (this.searchType === 'columns') {
          const filterValue = (event.target as HTMLInputElement).value;
          this.prevSearch = filterValue;
          this.attributeTable.filter = filterValue.trim().toUpperCase();
          this.matchedRows = this.attributeTable.filteredData.length;
        }
      }
    }
    return;
  }

  /** The label for the checkbox on the passed row
   * @param row Optional row argument if naming a table cell. Not given if table header cell
   * NOTE: Not currently in use
   */
  public checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  /** Whether the number of selected elements matches the total number of rows.
   * NOTE: Not currently in use
  */
  public isAllSelected(): boolean {
    // If a filter has been done, check to see if all of them have been selected
    if (this.attributeTable.filteredData.length > 0) {
      const numSelected = this.selection.selected.length;
      const numRows = this.attributeTable.filteredData.length;
      return numSelected === numRows;
    }
    // Since no search has been performed, check to see if all rows have been selected
    else {
      const numSelected = this.selection.selected.length;
      const numRows = this.attributeTable.data.length;
      return numSelected === numRows;
    }
    
  }

  /** Selects all rows, or all filtered rows, if they are not all selected; otherwise clear selection.
   * NOTE: Not currently in use
  */
  public masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      // this.selectedRows = 0;
    } else {
      if (this.attributeTable.filteredData.length > 0) {
        this.attributeTable.filteredData.forEach((filteredRow: any) => {
          this.selection.select(filteredRow);
          // this.selectedRows = this.attributeTable.filteredData.length;
        });
      } else {
        this.attributeTable.data.forEach((row: any) => this.selection.select(row));
        // this.selectedRows = this.attributeTableOriginal.length;
      }
    }
  }

  ngOnInit(): void {
    this.updateFilterAlgorithm();
    this.formatAttributeTable();
  }

  /**
   * By default, go through all the fields in the Attribute Table object and if they are 'double' numbers,
   * set their precision to 4 decimal places for every one. Also truncates any URL's, since they tend to be longer
   * and don't play well with the fixed length of the table columns.
   */
  private formatAttributeTable(): void {

    for (let feature of this.attributeTable.data) {
      for (let property in feature.properties) {
        // TODO: jpkeahey 2020.09.09 - This conditional will need to be updated, since there is a special ID number that will
        // return true from this and will be incorrect. Also, this changes the data; think about making a copy somehow
        if (typeof feature.properties[property] === 'number' && !Number.isInteger(feature.properties[property])) {
          feature.properties[property] = feature.properties[property].toFixed(4);
        } else if (typeof feature.properties[property] === 'string') {
          if (feature.properties[property].startsWith('http://') || feature.properties[property].startsWith('https://')) {
            this.links[feature.properties[property]] = feature.properties[property];
          } else if (feature.properties[property].startsWith('www')) {
            // feature.properties[property] = 'http://' + feature.properties[property];
          }
        }
      }
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
   * When the Download button is clicked in the data table dialog, save the table as a CSV file.
   */
  public saveDataTable(): void {

    var textToSave = '';
    var propertyIndex = 0;

    var columnNameTemp: string[] = [];
    // Iterate over the displayedColumns and create a temporary array to add quotes around each column heading
    this.displayedColumns.forEach((str: string) => {
      columnNameTemp.push('"' + str + '"');
    });
    textToSave += columnNameTemp.join(',') + '\n';

    for (let row of this.attributeTableOriginal) {
      for (let property in row.properties) {
        // Check to see if at last property so that the delimiter (,) isn't appended
        if (propertyIndex === Object.keys(row.properties).length - 1) {
          // Check if the value is a string; if it is, surround with quotes so any potential commas will be ignored by Excel
          if (typeof row.properties[property] === 'string') {
            // Check the original value for quotes (before potentially adding them below) and if found, replace with three
            // quotes for excel CSV formatting
            if (row.properties[property].includes('"')) {
              textToSave += row.properties[property].split('"').join('"""');
            }
            if (!isNaN(row.properties[property])) {
              textToSave += row.properties[property];
            } else {
              textToSave += "\"" + row.properties[property] + "\"";
            }
          } else if (row.properties[property] === null) {
            textToSave += ','
          } else {
            textToSave += row.properties[property];
          }
        }
        // The property isn't the last, so append the delimiter (,) to the value
        else {
          if (typeof row.properties[property] === 'string') {
            if (row.properties[property].includes('"')) {
              textToSave += row.properties[property].split('"').join('"""');
            }
            if (!isNaN(row.properties[property])) {
              textToSave += row.properties[property] + ',';
            } else {
              textToSave += '"' + row.properties[property] + '",';
            }
          } else if (row.properties[property] === null) {
            textToSave += ','
          } else {
            textToSave += row.properties[property] + ',';
          }
        }
        ++propertyIndex;
      }
      textToSave += '\n';
    }

    var data = new Blob([textToSave], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(data, this.commonService.formatSaveFileName(this.geoLayer.geoLayerId, IM.SaveFileType.dataTable));
  }

  /**
   * 
   * @param event 
   * @param row 
   * NOTE: Not currently in use
   */
  public updateClickedRow(event: MouseEvent, row: any): void {
    event.stopPropagation();
    if (this.selection.isSelected(row)) {
      // --this.selectedRows;
    } else {
      // ++this.selectedRows;
    }
  }

  /**
   * A function that returns whether the filtered input from a user matches that in the Material Table. Can be updated so
   * that only specific columns are used.
   * Note: Right now, the default is all columns
   */
  private updateFilterAlgorithm(): void {    
    // This is for filtering.
    this.attributeTable.filterPredicate = (data: any, filter: string) => {
      // Filter for searching all columns.
      if (this.searchType === 'columns') {
        for (let property in data) {
          if (data[property] === null) {
            continue;
          } else {
            if (typeof data[property] === 'string') {
              if (data[property].toUpperCase().includes(filter)) {
                return true;
              } else continue;
            } else if (typeof data[property] === 'number') {
              if (data[property].toString().includes(filter)) {
                return true;
              } else continue;
            }
          }
        }
        return false;
      }
    }
  }

}
