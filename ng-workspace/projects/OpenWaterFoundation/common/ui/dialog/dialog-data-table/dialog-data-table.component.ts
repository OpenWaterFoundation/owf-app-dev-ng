 import { Component,
          Inject,
          OnDestroy,
          OnInit }                      from '@angular/core';
import { MatDialogRef,
          MAT_DIALOG_DATA }             from '@angular/material/dialog';
import { SelectionModel }               from '@angular/cdk/collections';

import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';

import * as FileSaver                   from 'file-saver';

import { OwfCommonService }             from '@OpenWaterFoundation/common/services';
import * as IM                          from '@OpenWaterFoundation/common/services';
import { WindowManager }                from '@OpenWaterFoundation/common/ui/window-manager';
import { MapLayerManager }              from '@OpenWaterFoundation/common/ui/layer-manager';


@Component({
  selector: 'app-dialog-data-table',
  templateUrl: './dialog-data-table.component.html',
  styleUrls: ['./dialog-data-table.component.css', '../main-dialog-style.css']
})
export class DialogDataTableComponent implements OnInit, OnDestroy {
  /** The filtered address latitude. */
  public addressLat: number;
  /** The filtered address longitude. */
  public addressLng: number;
  /** Holds all features in the layer for determining if an address resides in a polygon. */
  public allLayerFeatures: any;
  /** The original object containing all features in the layer. */
  public attributeTableOriginal: any;
  /**
   * The copied object for displaying data a Material Table's cells. Is an instance of TableVirtualScrollDataSource, needed for
   * using the third party virtual scrolling with an Angular Material Table. It extends the Angular Material DataSource class.
   */
  public attributeTable: TableVirtualScrollDataSource<any>;
  /** Array containing the names of all header columns in the Material Table. */
  public displayedColumns: string[];
  /** The layer's geoLayerId. */
  public geoLayerId: string;
  /** The layer's geoLayerView name. */
  public geoLayerViewName: string;
  /** The type of layer being queried for the data table. Used for determining whether to enable the zoom to address button. */
  public geometryType = 'WKT:Polygon';
  /**
   * Object containing the URL as the key and value, so each link is unique.
   * Used by the template file to use as the link's href.
   */
  public links: {} = {};
  /** The reference to the Map Component's this.mainMap; the Leaflet map. */
  public mainMap: any;
  /**
   * The instance of the MapLayerManager, a helper class that manages MapLayerItem objects with Leaflet layers
   * and other layer data for displaying, ordering, and highlighting.
   */
  public mapLayerManager: MapLayerManager = MapLayerManager.getInstance();
  /** Used by the template file to display how many features are highlighted on the map. */
  public matchedRows: number;
  /** Dynamic string to show in the filter input area to a user. Default is set on initialization. */
  public matInputFilterText = 'Filter all columns using the filter string. Press Enter to execute the filter.';
  /** Used to determine which matInputFilterText option to display. */
  public defaultRadioDisabled = true;
  /**
   * The type of search the filter is currently performing. Can be:
   * * `columns`
   * * `address`
   */
  public searchType = 'columns';
  /**
   * This layer's selectedLayer that extends the Leaflet L.geoJSON class. Highlights and displays under selected features,
   * and resets/hides them.
   */
  public selectedLayer: any;
  /**
   * Object containing the geoLayerId as the key, and the selectedLayer object. If the geoLayerId exists in this object, it means
   * the layer's features can be highlighted.
   */
  public selectedLayers: any;
  // TODO: jpkeahey 2020.10.27 - Commented out. Will be used for row selection
  /**
   * Used by the template file to display how many rows (features in the layer) are selected on the data table.
   */
  // public selectedRows = 0;
  /** Object needed to show and deal with the checkboxes on the data table when selecting each row in the Material Table. */
  public selection: SelectionModel<any>;
  /** A unique string representing the windowID of this Dialog Component in the WindowManager. */
  public windowID: string;
  /** The windowManager instance, which creates, maintains, and removes multiple open dialogs from the InfoMapper. */
  public windowManager: WindowManager = WindowManager.getInstance();


  /**
   * @constructor for the Dialog Data Table.
   * @param owfCommonService The reference to the OwfCommonService injected object.
   * @param mapService The reference to the map service, for sending data between components and higher scoped map variables.
   * @param dialogRef The reference to the DialogTSGraphComponent. Used for creation and sending of data.
   * @param dataObject The object containing data passed from the Component that created this Dialog.
   */
  constructor(public owfCommonService: OwfCommonService,
              public dialogRef: MatDialogRef<DialogDataTableComponent>,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.attributeTable = new TableVirtualScrollDataSource(dataObject.data.allFeatures.features);
    this.attributeTableOriginal = JSON.parse(JSON.stringify(dataObject.data.allFeatures.features));
    this.allLayerFeatures = JSON.parse(JSON.stringify(dataObject.data.allFeatures.features));
    this.displayedColumns = Object.keys(dataObject.data.allFeatures.features[0].properties);
    // Manually add the select column to the displayed Columns. This way checkboxes can be added below
    // TODO: jpkeahey 2020.10.16 - Uncomment out for checkboxes in data table
    // this.displayedColumns.unshift('select');
    this.geoLayerId = dataObject.data.geoLayerId;
    this.geoLayerViewName = dataObject.data.geoLayerViewName;
    this.geometryType = dataObject.data.geometryType;
    // This is needed for testing the library.
    // this.geometryType = 'WKT:Polygon';
    this.selectedLayers = dataObject.data.selectedLayers;
    this.mainMap = dataObject.data.mainMap;
    this.matchedRows = this.attributeTable.data.length;
    // TODO: jpkeahey 2020.10.16 - Uncomment out for checkboxes in data table
    // this.selection = new SelectionModel<any>(true, []);
    this.windowID = this.geoLayerId + '-dialog-data-table';
  }


  /**
   * Function that applies the necessary trimming to a filter query from the user
   * @param event The event passed when a DOM event is detected (user inputs into filter field)
   */
  public applyFilter(event: KeyboardEvent) {
    // If the keyup event is an empty string, then the user has either selected text and deleted it, or backspaced until the
    // search field is empty. In that case, do the table search and if the selected layer exists, reset the highlighting.
    if ((event.target as HTMLInputElement).value === '') {
      const filterValue = (event.target as HTMLInputElement).value;
      this.attributeTable.filter = filterValue.trim().toUpperCase();
      this.matchedRows = this.attributeTable.data.length;
      if (this.selectedLayer) {
        this.selectedLayer.setSelectedStyleInit();
      }
    }
    // If the keyup event is not empty, attempt to populate the selectedLayer object. If the Enter key was not pressed by the user,
    // then don't do anything else. If the Enter key was pressed, check if the selected layer exists, and highlight the correct
    // features if it does. This should hopefully help with large datasets, as it only checks when enter is pressed, and not for
    // every letter that the keyup is detected.
    else {
      // TODO: jpkeahey 2021-04-20 - Update to also take Enter from the numpad Enter.
      if (event.code.toUpperCase() === 'ENTER') {
        this.selectedLayer = this.selectedLayers[this.geoLayerId];
        if (this.selectedLayer) {
          const filterValue = (event.target as HTMLInputElement).value;
          this.attributeTable.filter = filterValue.trim().toUpperCase();
          this.matchedRows = this.attributeTable.filteredData.length;

          this.highlightFeatures();
        } else {
          const filterValue = (event.target as HTMLInputElement).value;
          // Search for columns (default).
          if (this.searchType === 'columns') {
            this.attributeTable.filter = filterValue.trim().toUpperCase();
            this.matchedRows = this.attributeTable.filteredData.length;
          }
          // Search for an address using the geocodio service.
          else if (this.searchType === 'address') {
            this.filterByAddress(filterValue);
          }
        }

        
      }
    }
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

  /**
   * 
   * @param filterValue 
   */
  private filterByAddress(filterAddress: string): void {
    // Replace all spaces and commas with URI-encoded characters using regex.
    var encodedAddress = filterAddress.replace(/ /g, '+').replace(/,/g, '%2c');
    // TODO: jpkeahey 2021.04.14 - This is using an OWF employee API key necessary for the query. What to do?
    var addressQuery = 'https://api.geocod.io/v1.6/geocode?q=' + encodedAddress + '&api_key=e794ffb42737727f9904673702993bd96707bf6';
    this.owfCommonService.getJSONData(addressQuery).subscribe((resultJSON: any) => {
      if (resultJSON.results[0] === undefined) {
        this.addressLat = -1;
        this.addressLng = -1;
      } else {
        // Set the returned lat and long values so they can be used in the filter function. From GeoCodIO's documentation,
        // use the first result in the array, as it will be the most accurate.
        this.addressLat = resultJSON.results[0].location.lat;
        this.addressLng = resultJSON.results[0].location.lng;
      }
      console.log('GeoCodIO result ->', resultJSON);
      // Call the filter function for addresses. The user given input itself won't be used, but this is how the function
      // is called. Set the data rows to show by using the filtered data.
      this.attributeTable.filter = filterAddress.trim().toUpperCase();
      this.matchedRows = this.attributeTable.filteredData.length;
    });
  }

  /**
   * Looks through each feature and each feature property to determine which feature should be highlighted on the Leaflet
   * map. Not the fastest at the moment.
   */
  private highlightFeatures(): void {

    this.selectedLayer.bringToBack();

    // Iterate through each feature in the layer
    this.selectedLayer.eachLayer((featureLayer: any) => {
      
      featureLayer.setStyle({
        fillOpacity: '0',
        opacity: '0'
      });
      // Iterate over each property in the feature
      for (let property in featureLayer.feature.properties) {
        if (featureLayer.feature.properties[property] !== null) {
          if (typeof featureLayer.feature.properties[property] === 'string') {
            if (featureLayer.feature.properties[property].toUpperCase().includes(this.attributeTable.filter)) {
              featureLayer.setStyle({
                color: 'red',
                fillColor: 'yellow',
                fillOpacity: '1',
                radius: featureLayer.options.radius,
                opacity: '1',
                weight: 2
              });
              break;
            }
          } else if (typeof featureLayer.feature.properties[property] === 'number') {
            if ((featureLayer.feature.properties[property] + '').indexOf(this.attributeTable.filter) > -1) {
              featureLayer.setStyle({
                color: 'red',
                fillColor: 'yellow',
                fillOpacity: '1',
                radius: featureLayer.options.radius,
                opacity: '1',
                weight: 2
              });
              break;
            }
          }
        }
      }
    });
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

  /**
   * Uses the Ray Casting Algorithm to determine whether a set of coordinates exist inside a given polygon. It contains
   * a second `for` loop so that it also works on donut shaped polygons. Ref: https://stackoverflow.com/a/42532563/11854796
   * @param lat 
   * @param lng 
   * @param poly 
   * @returns A boolean showing whether the given lat and long is inside the provided polygon or donut polygon.
   */
  private isInsidePolygon(lat: number, lng: number, poly: any): boolean {
    var inside = false;
    var x = lat, y = lng;
    for (var ii=0; ii < poly.length; ii++){
        var polyPoints = poly[ii];
        for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
            var xi = polyPoints[i][1], yi = polyPoints[i][0];
            var xj = polyPoints[j][1], yj = polyPoints[j][0];

            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
    }

    return inside;
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
   * Closes the Mat Dialog popup when the Close button is clicked.
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
    FileSaver.saveAs(data, this.owfCommonService.formatSaveFileName(this.geoLayerId, IM.SaveFileType.dataTable));
  }

  private setZoomBounds(lat: number, long: number, bounds: IM.Bounds): void {

    if (lat > bounds.NEMaxLat) {
      bounds.NEMaxLat = lat;
    }
    if (lat < bounds.SWMinLat) {
      bounds.SWMinLat = lat;
    }
    if (long > bounds.NEMaxLong) {
      bounds.NEMaxLong = long;
    }
    if (long < bounds.SWMinLong) {
      bounds.SWMinLong = long;
    }
  }
  
  /**
   * 
   */
  public toggleSearchInfo() {
    // console.log(this.defaultRadioDisabled);

    // if (this.defaultRadioDisabled === true) {
    //   this.defaultRadioDisabled = false;
    //   this.matInputFilterText = 'Filter by an address. Press Enter to execute the filter.'
    // } else if (this.defaultRadioDisabled === false) {
    //   this.defaultRadioDisabled = true;
    //   this.matInputFilterText = 'Filter all columns using the filter string. Press Enter to execute the filter.';
    // }
    
    if (this.searchType === 'columns') {
      this.defaultRadioDisabled = true;
      this.matInputFilterText = 'Filter by an address. Press Enter to execute the filter.'
    } else if (this.searchType === 'address') {
      this.defaultRadioDisabled = false;
      this.matInputFilterText = 'Filter all columns using the filter string. Press Enter to execute the filter.';
    }
    
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

    // This is for filtering 
    this.attributeTable.filterPredicate = (data: any, filter: string) => {
      // Filter for searching all columns.
      if (this.searchType === 'columns') {
        for (let property in data.properties) {
          if (data.properties[property] === null) {
            continue;
          } else {
            if (typeof data.properties[property] === 'string') {
              if (data.properties[property].toUpperCase().includes(filter)) {
                return true;
              } else continue;
            } else if (typeof data.properties[property] === 'number') {
              if (data.properties[property].toString().includes(filter)) {
                return true;
              } else continue;
            }
          }
        }
        return false;
      }
      // Filter for searching for an address.
      else if (this.searchType === 'address') {
        // If a bad query/address was given, don't return anything.
        if (this.addressLat === -1 || this.addressLng === -1) {
          return false;
        }
        // This function (filterPredicate) is called for each feature, so iterate over each polygon or multi-polygon array(s)
        // and, using the the lat and long obtained from the geocodio query, determine whether they're inside.
        for (let coordArr = 0; coordArr < data['geometry']['coordinates'].length; ++coordArr) {
          if (this.isInsidePolygon(this.addressLat, this.addressLng, data['geometry']['coordinates'][coordArr]) === true) {
            return true;
          }
        }
        return false;
      }
      
      // For returning all results that contain the filter in the IncidentName
      // return data.properties['IncidentName'] === null ? false : data.properties['IncidentName'].toUpperCase().includes(filter);
    }
  }

  /**
   * 
   */
  public zoomToAddress(): void {
    this.mainMap.flyTo([this.addressLat, this.addressLng], 16,
      {
        duration: 3
      });
  }

  /**
   * When the kebab Zoom button is clicked on, get the correct coordinate bounds and zoom the map to them.
   */
  public zoomToFeatures(): void {
    // Attempt to create the selectedLayer object.
    this.selectedLayer = this.selectedLayers[this.geoLayerId];
    //
    var bounds: IM.Bounds = {
      NEMaxLat : Number.NEGATIVE_INFINITY,
      NEMaxLong : Number.NEGATIVE_INFINITY,
      SWMinLat : Number.POSITIVE_INFINITY,
      SWMinLong : Number.POSITIVE_INFINITY
    }
    // If the selected (or highlighted) layer exists, zoom to it on the map.
    if (this.selectedLayer) {
      // Fly to the box surrounding all features of the layer.
      if (this.attributeTable.filteredData.length === this.attributeTableOriginal.length) {
      
        // If the selectedLayer variable is created (if the Leaflet layer supports it e.g. Points, Markers, Images) then fly
        // to the layer bounds on the map
        this.mainMap.flyToBounds(this.selectedLayer.getBounds(), {
          animate: true,
          duration: 1.5,
          // easeLinearity: 1,
          padding: [475, 0]
        });
        
      }
      // If there are more than one returned row from the filter, get the bounding box and fly to it.
      else if (this.attributeTable.filteredData.length > 1) {

        this.attributeTable.filteredData.forEach((feature: any) => {
          // Check to see if the bbox property exists in the feature
          if (feature.bbox) {
            this.setZoomBounds(feature.bbox[1], feature.bbox[0], bounds);
          } else if (feature.geometry.coordinates) {
            this.setZoomBounds(feature.geometry.coordinates[1], feature.geometry.coordinates[0], bounds);
          }
        });

        // The Lat and Long Bounds members have been set, and can be used as the bounds for the selected features
        var zoomBounds = [[bounds.NEMaxLat, bounds.NEMaxLong],
                          [bounds.SWMinLat, bounds.SWMinLong]];
        // Use the Leaflet map reference to fly to the bounds
        this.mainMap.flyToBounds(zoomBounds, {
          animate: true,
          duration: 1.5,
          padding: [475, 0]
        });
      }
      // If there's only one row returned from the filtering, add some padding on all sides of the feature and don't fly to the
      // maximum possible zoom.
      else if (this.attributeTable.filteredData.length === 1) {
        var latLng: number[] = [];
        if (this.attributeTable.filteredData[0].bbox) {
          latLng.push(this.attributeTable.filteredData[0].bbox[1], this.attributeTable.filteredData[0].bbox[0]);
        } else if (this.attributeTable.filteredData[0].geometry.coordinates) {
          latLng.push(this.attributeTable.filteredData[0].geometry.coordinates[1], this.attributeTable.filteredData[0].geometry.coordinates[0]);
        }
        this.mainMap.flyTo(latLng, 13.5, {
          animate: true,
          duration: 1.5,
          padding: [475, 0]
        });
      }
    }
  }

}