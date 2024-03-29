 import { Component,
          EventEmitter,
          Inject,
          OnDestroy,
          OnInit,
          Output }                      from '@angular/core';
import { ActivatedRoute }               from '@angular/router';
import { MatDialogRef,
          MAT_DIALOG_DATA }             from '@angular/material/dialog';
import { SelectionModel }               from '@angular/cdk/collections';

import booleanPointInPolygon            from '@turf/boolean-point-in-polygon';
import bbox                             from '@turf/bbox';

import { first, Subject,
          takeUntil }                   from 'rxjs';

import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';
import * as FileSaver                   from 'file-saver';

import { faXmark,
          faMagnifyingGlassPlus }       from '@fortawesome/free-solid-svg-icons';

import { Bounds, CommonLoggerService,
          OwfCommonService, 
          SaveFileType }                from '@OpenWaterFoundation/common/services';
import { DialogService }                from '../dialog.service';
import { WindowManager }                from '@OpenWaterFoundation/common/ui/window-manager';
import { MapLayerManager,
          MapLayerItem }                from '@OpenWaterFoundation/common/ui/layer-manager';
import { HttpErrorResponse } from '@angular/common/http';
// import * as L from 'leaflet';
declare var L: any;


@Component({
  selector: 'app-dialog-data-table',
  templateUrl: './dialog-data-table.component.html',
  styleUrls: ['./dialog-data-table.component.css', '../main-dialog-style.css']
})
export class DialogDataTableComponent implements OnInit, OnDestroy {

  /** The filtered address latitude. */
  addressLat: number;
  /** The filtered address longitude. */
  addressLng: number;
  /** The Leaflet Marker object for displaying when an address is filtered on the
   * map. */
  addressMarker: any;
  /** Whether an address marker is currently being displayed on the map. */
  addressMarkerDisplayed: boolean;
  /** Holds all features in the layer for determining if an address resides in a
   * polygon. */
  allLayerFeatures: any;
  /** The original object containing all features in the layer. */
  attributeTableOriginal: any;
  /** The copied object for displaying data a Material Table's cells. Is an instance
   * of TableVirtualScrollDataSource, needed for using the third party virtual scrolling
   * with an Angular Material Table. It extends the Angular Material DataSource class. */
  attributeTable: TableVirtualScrollDataSource<any>;
  /**
   * 
   */
  currentLayer: any;
  /** Can be set to `true` if the debug query parameter is given for debugging purposes,
   * otherwise will be null. */
  debugFlag: string = null;
   /** Can be set to
    * * `trace` - Will show all logging messages in the application. Meant for
    * in-depth debugging.
    * * `warn` - Will display any warning messages throughout the application. For
    * less in-depth debugging. */
  debugLevelFlag: string = null;
  /** Used to determine which matInputFilterText option to display. */
  defaultRadioDisabled = true;
  /**
   * 
   */
  destroyed = new Subject<void>();
  /** Array containing the names of all header columns in the Material Table. */
  displayedColumns: string[];
  /** EventEmitter that alerts the Map component (parent) that an update has happened,
   * and sends the basin name. */
  @Output() featureHighlighted = new EventEmitter<boolean>();
  /** The layer's geoLayer. */
  geoLayer: any;
  /** The layer's geoLayerView. */
  geoLayerView: any;
  /** Object containing the layer geoLayerId as the ID, and an object of properties
   * set by a user-defined classification file. */
  layerClassificationInfo: any;
  /** Object containing the URL as the key and value, so each link is unique. Used
   * by the template file to use as the link's href. */
  links: {} = {};
  /** The reference to the Map Component's this.mainMap; the Leaflet map. */
  mainMap: any;
  /**
   * 
   */
  mapConfigPath: string;
  /** The instance of the MapLayerManager, a helper class that manages MapLayerItem
   * objects with Leaflet layers and other layer data for displaying, ordering,
   * and highlighting. */
  mapLayerManager: MapLayerManager = MapLayerManager.getInstance();
  /** Used by the template file to display how many features are highlighted on
   * the map. */
  matchedRows: number;
  /** Dynamic string to show in the filter input area to a user. Default is set
   * on initialization. */
  matInputFilterText = 'Filter all columns using the filter string. Press Enter to execute the filter.';
  /**
   * 
   */
  originalStyle: any;
  /**
   * The type of search the filter is currently performing. Can be:
   * * `columns`
   * * `address`
   */
  searchType = 'columns';
  /** This layer's selectedLayer that extends the Leaflet L.geoJSON class. Highlights
   * and displays under selected features, and resets/hides them. */
  selectedLayer: any;
  /** Object containing the geoLayerId as the key, and the selectedLayer object.
   * If the geoLayerId exists in this object, it means the layer's features can
   * be highlighted. */
  selectedLayers: any;
  /** Number to be assigned uniquely to a selected feature layer id. */
  private selectedLeafletID = Number.MAX_SAFE_INTEGER;
  // TODO: jpkeahey 2020.10.27 - Commented out. Will be used for row selection
  /** Used by the template file to display how many rows (features in the layer)
   * are selected on the data table. */
  // selectedRows = 0;
  /** Object needed to show and deal with the checkboxes on the data table when
   * selecting each row in the Material Table. */
  selection: SelectionModel<any>;
  /** A unique string representing the windowId of this Dialog Component in the
   * WindowManager. */
  windowId: string;
  /** The windowManager instance, which creates, maintains, and removes multiple
   * open dialogs in an application. */
  windowManager: WindowManager = WindowManager.getInstance();
  /** All used icons in the DialogDataTableComponent. */
  faXmark = faXmark;
  faMagnifyingGlassPlus = faMagnifyingGlassPlus;


  /**
   * Constructor for the DialogDataTableComponent.
   * @param actRoute 
   * @param commonService Reference to the injected Common library service.
   * @param dialogRef Reference to the DialogTSGraphComponent. Used for creation
   * and sending of data.
   * @param dialogService 
   * @param logger Reference to the logging service for simpler debugging.
   * @param matDialogData The object containing data passed from the component that
   * created this Dialog.
   */
  constructor(
    private actRoute: ActivatedRoute,
    private commonService: OwfCommonService,
    private dialogRef: MatDialogRef<DialogDataTableComponent>,
    private dialogService: DialogService,
    private logger: CommonLoggerService,
    @Inject(MAT_DIALOG_DATA) private matDialogData: any
  ) {

    this.attributeTable = new TableVirtualScrollDataSource(this.matDialogData.data.allFeatures.features);
    this.attributeTableOriginal = JSON.parse(JSON.stringify(this.matDialogData.data.allFeatures.features));
    this.allLayerFeatures = JSON.parse(JSON.stringify(this.matDialogData.data.allFeatures.features));
    this.currentLayer = L.geoJSON(this.matDialogData.data.allFeatures);
    this.displayedColumns = Object.keys(this.matDialogData.data.allFeatures.features[0].properties);
    // Manually add the select column to the displayed Columns. This way checkboxes can be added below
    // TODO: jpkeahey 2020.10.16 - Uncomment out for checkboxes in data table
    // this.displayedColumns.unshift('select');
    this.geoLayer = this.matDialogData.data.geoLayer;
    this.geoLayerView = this.matDialogData.data.geoLayerView;
    this.layerClassificationInfo = this.matDialogData.data.layerClassificationInfo;
    // This is needed for testing the library.
    // this.geometryType = 'WKT:Polygon';
    this.mainMap = this.matDialogData.data.mainMap;
    this.matchedRows = this.attributeTable.data.length;
    // TODO: jpkeahey 2020.10.16 - Uncomment out for checkboxes in data table
    // this.selection = new SelectionModel<any>(true, []);
    this.windowId = this.geoLayer.geoLayerId + '-dialog-data-table';
  }


  /**
   * Applies the necessary trimming to a filter query from the user.
   * @param event The event passed when a DOM event is detected (user inputs into filter field)
   */
  applyFilter(event: KeyboardEvent) {
    var layerItem: MapLayerItem = this.mapLayerManager.getMapLayerItem(this.geoLayer.geoLayerId);

    // Keyup event is empty. Reset the filter and remove all selected layers.
    if ((event.target as HTMLInputElement).value === '') {
      this.resetFilterAndSelectedLayers((event.target as HTMLInputElement).value);
    }
    // The keyup event is not empty, attempt to populate the selectedLayer object.
    // If either Enter key was pressed, check if the selected layer exists, and highlight
    // the correct features.
    else {
      if (event.code && (event.code.toUpperCase() === 'ENTER' || event.code.toUpperCase() === 'NUMPADENTER')) {
        // Check if any selected layers need to be removed first.
        if (layerItem.hasAnySelectedLayers() === true) {
          layerItem.removeAllSelectedLayers(this.mainMap);
        }

        if (this.searchType === 'columns') {
          const filterValue = (event.target as HTMLInputElement).value;
          this.attributeTable.filter = filterValue.trim().toUpperCase();
          this.matchedRows = this.attributeTable.filteredData.length;

          this.highlightFeatures();
        }
        else if (this.searchType === 'address') {
          const filterValue = (event.target as HTMLInputElement).value;
          // Search for an address using the geocodio service.
          this.filterByAddress(filterValue);
        }

      }
    }
  }

  /** The label for the checkbox on the passed row
   * @param row Optional row argument if naming a table cell. Not given if table header cell
   * NOTE: Not currently in use
   */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  /**
   * Creates the polygon or point selected layer to be added to the Leaflet map
   * right on top of the layerItem's original layer.
   * @param geoJsonObj The geoJson object created to be given to the L.geoJSON
   * class to create a selected geoJson layer.
   */
  private createSelectedLeafletClass(geoJsonObj: any): void {

    if (geoJsonObj.features[0].geometry.type.toUpperCase().includes('POLYGON')) {
      var symbolWeight = (
        this.geoLayerView.geoLayerSymbol.properties.weight ?
        this.geoLayerView.geoLayerSymbol.properties.weight :
        this.layerClassificationInfo[this.geoLayer.geoLayerId].weight ?
        this.layerClassificationInfo[this.geoLayer.geoLayerId].weight :
        2
      )

      this.selectedLayer = L.geoJSON(geoJsonObj, {
        style: function(feature: any) {
          return {
            fillOpacity: '0.4',
            fillColor: '#ffff01',
            color: '#ffff01',
            opacity: '0.9',
            weight: parseInt(symbolWeight) + 3
          }
        }
      });
    } else {
      // Attempt to retrieve both the layer's symbol type and size if a point layer.
      // This can be from the map configuration file under geoLayerSymbol, or in a
      // classification file, which is in the layerClassificationInfo object.
      var symbolSizeType = (
        this.geoLayerView.geoLayerSymbol.properties.symbolSize ?
        this.geoLayerView.geoLayerSymbol.properties.symbolSize :
        this.layerClassificationInfo[this.geoLayer.geoLayerId] ?
        this.layerClassificationInfo[this.geoLayer.geoLayerId].symbolSize :
        '4'
      );
      var symbolShapeType = (
        this.geoLayerView.geoLayerSymbol.properties.symbolShape ?
        this.geoLayerView.geoLayerSymbol.properties.symbolShape.toLowerCase() :
        this.layerClassificationInfo[this.geoLayer.geoLayerId] ?
        this.layerClassificationInfo[this.geoLayer.geoLayerId].symbolShape.toLowerCase() :
        'circle'
      )

      this.selectedLayer = L.geoJson(geoJsonObj, {
        pointToLayer: (feature: any, latlng: any) => {
          return L.shapeMarker(latlng, {
            color: 'red',
            fillColor: '#ffff01',
            fillOpacity: '1',
            // Grab the radius from the feature, which was changed on initialization
            // of the selected layer.
            radius: parseInt(symbolSizeType) + 3,
            shape: symbolShapeType,
            opacity: '1',
            weight: 2
          });
        }
      });
    }
    // Obtain the MapLayerItem for this layer and the created selected layer to it.
    var layerItem: MapLayerItem = this.mapLayerManager.getMapLayerItem(this.geoLayer.geoLayerId);    
    layerItem.addSelectedLayerToMainMap(this.selectedLayer, this.mainMap);

    this.mapLayerManager.setLayerOrder();
  }

  /**
   * Query the Geocodio API with the provided user address and add a Selected layer
   * to the Leaflet map if found in a polygon.
   * @param filterAddress The search value entered in by a user.
   */
  private filterByAddress(filterAddress: string): void {
    // Replace all spaces and commas with URI-encoded characters using regex.
    var encodedAddress = filterAddress.replace(/ /g, '+').replace(/,/g, '%2c');
    // TODO: jpkeahey 2021.04.14 - This is using an OWF employee API key necessary for the query. What to do?
    var addressQuery = 'https://api.geocod.io/v1.6/geocode?q=' + encodedAddress + '&api_key=e794ffb42737727f9904673702993bd96707bf6';
    this.commonService.getJSONData(addressQuery).pipe(first()).subscribe({
      next: (geoCodeResponse: any) => {

        if (geoCodeResponse instanceof HttpErrorResponse) {
          this.addressLat = -1;
          this.addressLng = -1;
          this.attributeTable.filter = filterAddress;
          return;
        }
        
        if (geoCodeResponse.results[0] === undefined) {
          this.addressLat = -1;
          this.addressLng = -1;
        } else {
          // Set the returned lat and long values so they can be used in the filter
          // function. From GeoCodIO's documentation, use the first result in the
          // array, as it will be the most accurate.
          this.addressLat = geoCodeResponse.results[0].location.lat;
          this.addressLng = geoCodeResponse.results[0].location.lng;
        }
        this.logger.print('trace', 'DialogDataTableComponent.filterByAddress - GeoCodIO result:',
        this.debugFlag, this.debugLevelFlag);
        this.logger.print('trace', geoCodeResponse.results[0], this.debugFlag, this.debugLevelFlag);

        // Call the filter function for addresses. Set the data rows to show by using
        // the filtered data. This uses the custom filter predicate function in updateFilterAlgorithm,
        // and therefore must be called after the setting of the class variables
        // for lat and long set above.
        this.attributeTable.filter = filterAddress.trim().toUpperCase();
        this.matchedRows = this.attributeTable.filteredData.length;
        
        // This uses type casting so that a 'correct' GeoJsonObject is created for
        // the L.geoJSON function.
        // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/37370#issuecomment-577504151
        var geoJsonObj = {
          type: "FeatureCollection" as const,
          bbox: [],
          features: []
        };
  
        // Iterate over the array of filtered features from the data table, and if
        // the address is found in one, add it to the map and push it into the geoJson
        // object to be used for selecting and styling the feature it's in.
        this.attributeTable.filteredData.forEach((feature: any) => {
          if (booleanPointInPolygon([this.addressLng, this.addressLat], feature.geometry) === true) {
            // Create and add the Marker and tooltip to the map.
            var defaultIcon = L.icon({
              className: 'selectedMarker',
              iconUrl: 'assets/app/img/default-marker-25x41.png',
              iconAnchor: [12, 41]
            });
            var addressMarker = L.marker([this.addressLat, this.addressLng], { icon: defaultIcon }).addTo(this.mainMap);
            addressMarker.bindTooltip(geoCodeResponse.results[0].formatted_address, {
              className: 'address-marker',
              direction: 'right',
              permanent: true
            });
            // Obtain the MapLayerItem for this layer and the created selected layer to it.
            var layerItem: MapLayerItem = this.mapLayerManager.getMapLayerItem(this.geoLayer.geoLayerId);
            layerItem.addAddressMarker(addressMarker);
            this.addressMarkerDisplayed = true;
            // Add it to the geoJson object.
            geoJsonObj.features.push(feature);
          }
        });
  
        // Check to see if anything was actually found.
        if (geoJsonObj.features.length > 0) {
          // Create the selected layer.
          this.createSelectedLeafletClass(geoJsonObj);
        }

      }
    });

  }

  /**
   * By default, go through all the fields in the Attribute Table object and if
   * they are 'double' numbers, set their precision to 4 decimal places for every
   * one. Also truncates any URL's, since they tend to be longer and don't play
   * well with the fixed length of the table columns.
   */
  private formatAttributeTable(): void {

    for (let feature of this.attributeTable.data) {
      for (let property in feature.properties) {
        // TODO: jpkeahey 2020.09.09 - This conditional will need to be updated,
        // since there is a special ID number that will return true from this and
        // will be incorrect. Also, this changes the data; think about making a copy somehow.
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
   * Looks through each feature and its properties to determine which should be
   * highlighted on the Leaflet map.
   */
  private highlightFeatures(): void {

    // This uses type casting so that a 'correct' GeoJsonObject is created for the L.geoJSON function.
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/37370#issuecomment-577504151
    var geoJsonObj = {
      type: "FeatureCollection" as const,
      bbox: [],
      features: []
    };

    // this.selectedLayer = L.geoJSON();
    

    // var layerItem: MapLayerItem = this.mapLayerManager.getMapLayerItem(this.geoLayer.geoLayerId);

    // layerItem.getItemLeafletLayer().eachLayer((layer: any) => {
    //   if (layer.feature.properties.DISTRICT === 64) {
    //     var copiedLayer = lodash.cloneDeep(layer);
    //     copiedLayer._leaflet_id = --this.selectedLeafletID;
    //     copiedLayer.setStyle({
    //       fillOpacity: 0,
    //       color: '#00ffff',
    //       opacity: '0.8',
    //       weight: parseInt(layer.options.weight) + 2
    //     });
    //     this.selectedLayer.addLayer(copiedLayer);
    //   }
    // });

    // Iterate over the DataSource's filtered data array that matched the user input and add each feature to the
    // geoJsonObj to be given for selected layer creation.
    this.attributeTable.filteredData.forEach((feature: any) => {
      geoJsonObj.features.push(feature);
    });

    // this.selectedLayer.setStyle({
    //     fillOpacity: 0,
    //     color: '#00ffff',
    //     opacity: '0.8',
    //     weight: 4
    // });
    // this.selectedLayer.eachLayer((layer: any) => {
    // });

    // layerItem.addSelectedLayerToMainMap(this.selectedLayer, this.mainMap);

    // this.mapLayerManager.setLayerOrder();
    // Check to see if anything was actually found.
    if (geoJsonObj.features.length > 0) {
      this.createSelectedLeafletClass(geoJsonObj);
    }
    
  }

  /**
   * Whether the number of selected elements matches the total number of rows.
   * NOTE: Not currently in use
  */
  isAllSelected(): boolean {
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
   * Selects all rows, or all filtered rows, if they are not all selected; otherwise clear selection.
   * NOTE: Not currently in use
  */
  masterToggle(): void {
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

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive. Called after the constructor.
   */
  ngOnInit(): void {

    this.actRoute.paramMap.pipe(takeUntil(this.destroyed)).subscribe(() => {
      this.debugFlag = this.actRoute.snapshot.queryParamMap.get('debug');
      this.debugLevelFlag = this.actRoute.snapshot.queryParamMap.get('debugLevel');
      this.logger.print('trace',
      'DialogDataTableComponent.ngOnInit - Setting Debug & DebugLevel flags.',
      this.debugFlag, this.debugLevelFlag);

      this.updateFilterAlgorithm();
      this.formatAttributeTable();
    });
    
  }

  /**
   * Called once, before the instance is destroyed. If the page is changed or a
   * link is clicked on in the dialog that opens a new map, make sure to close the
   * dialog and remove it from the window manager.
   */
  ngOnDestroy(): void {

    this.destroyed.next();
    this.destroyed.complete();
    this.dialogRef.close();
    this.windowManager.removeWindow(this.windowId);
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
   * 
   * @param filterValue 
   * @param layerItem 
   */
  private resetFilterAndSelectedLayers(filterValue: string): void {
    var layerItem: MapLayerItem = this.mapLayerManager.getMapLayerItem(this.geoLayer.geoLayerId);

    this.attributeTable.filter = filterValue.trim().toUpperCase();
    this.matchedRows = this.attributeTable.data.length;
    
    if (this.selectedLayer) {
      layerItem.removeAllSelectedLayers(this.mainMap);
      this.selectedLayer = undefined;
      this.addressMarkerDisplayed = false;
    }
  }

  /**
   * When the Download button is clicked in the data table dialog, save the table
   * as a CSV file.
   */
  saveDataTable(): void {

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
    FileSaver.saveAs(data, this.commonService.formatSaveFileName(this.geoLayer.geoLayerId, SaveFileType.dataTable));
  }
  
  /**
   * Toggles the Data Table input search field text when the option for multiple
   * radio buttons are shown and clicked.
   */
  toggleSearchInfo() {

    this.resetFilterAndSelectedLayers('');

    if (this.searchType === 'columns') {
      this.defaultRadioDisabled = true;
      this.matInputFilterText = 'Filter by an address. Press Enter to execute the filter.';
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
  updateClickedRow(event: MouseEvent, row: any): void {
    event.stopPropagation();
    if (this.selection.isSelected(row)) {
      // --this.selectedRows;
    } else {
      // ++this.selectedRows;
    }
  }

  /**
   * A function that returns whether the filtered input from a user matches that
   * in the Material Table. Can be updated so that only specific columns are used.
   * Note: Right now, the default is all columns.
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
        // Check if a point of coordinates reside in the currently searched polygon, given into the booleanPointWithinPolygon
        // function from the @turf/boolean-point-within-polygon module.
        return booleanPointInPolygon([this.addressLng, this.addressLat], data);
      }
      
      // For returning all results that contain the filter in the IncidentName
      // return data.properties['IncidentName'] === null ? false : data.properties['IncidentName'].toUpperCase().includes(filter);
    }
  }

  /**
   * Uses the Leaflet-provided flyTo() method to use an animation that zooms in
   * to the current address latitude and longitude.
   */
  zoomToAddress(): void {
    this.mainMap.flyTo([this.addressLat, this.addressLng], 16,
      {
        duration: 3
      });
  }

  /**
   * When the kebab Zoom button is clicked on, get the correct coordinate bounds
   * and zoom to them on the Leaflet map.
   */
  zoomToFeatures(): void {
    // Create the Bounds object that will be overridden and used for the feature
    // bounds to zoom in on.
    var bounds: Bounds = {
      NEMaxLat: Number.NEGATIVE_INFINITY,
      NEMaxLong: Number.NEGATIVE_INFINITY,
      SWMinLat: Number.POSITIVE_INFINITY,
      SWMinLong: Number.POSITIVE_INFINITY
    }
    // If the selected (or highlighted) layer exists, zoom to it on the map.
    if (this.selectedLayer) {
      // Check if the layer is a polygon layer.
      if (this.attributeTable.filteredData &&
          this.attributeTable.filteredData[0].geometry.type.toUpperCase().includes('POLYGON')) {
            // Fly to the box surrounding all features of the layer.
            if (this.attributeTable.filteredData.length === this.attributeTableOriginal.length) {
              // If the selectedLayer variable is created (if the Leaflet layer
              // supports it e.g. Points, Markers, Images) then fly to the layer
              // bounds on the map.
              this.mainMap.flyToBounds(this.selectedLayer.getBounds(), {
                animate: true,
                duration: 1.5,
                // easeLinearity: 1,
                padding: [475, 0]
              });
              
            }
            // More than one feature was found, so determine the overarching bounds
            // object to be used to zoom so that all features are displayed.
            else if (this.attributeTable.filteredData.length > 1) {
              // Iterate over each found feature and determine what the bounds should be.
              this.attributeTable.filteredData.forEach((feature: any) => {
                var feature_bbox = bbox(feature);
                this.dialogService.setZoomBounds(feature_bbox[3], feature_bbox[2], bounds);
                this.dialogService.setZoomBounds(feature_bbox[1], feature_bbox[0], bounds);
              });

              // The Lat and Long Bounds members have been set, and can be used
              // as the bounds for the selected features.
              var zoomBounds = [[bounds.NEMaxLat, bounds.NEMaxLong],
                                [bounds.SWMinLat, bounds.SWMinLong]];
              // Use the Leaflet map reference to fly to the bounds
              this.mainMap.flyToBounds(zoomBounds, {
              animate: true,
              duration: 1.5,
              padding: [475, 0]
              });
            } else if (this.attributeTable.filteredData.length === 1) {
              var feature_bbox = bbox(this.attributeTable.filteredData[0]);
              
              var zoomBounds = [[feature_bbox[3], feature_bbox[2]],
                                [feature_bbox[1], feature_bbox[0]]]
              this.mainMap.flyToBounds(zoomBounds, {
                animate: true,
                duration: 1.5,
                padding: [475, 0]
              });
            }
            return;
          }
      // Fly to the box surrounding all features of the layer.
      if (this.attributeTable.filteredData.length === this.attributeTableOriginal.length) {
        // If the selectedLayer variable is created (if the Leaflet layer supports
        // it e.g. Points, Markers, Images) then fly to the layer bounds on the map.
        this.mainMap.flyToBounds(this.selectedLayer.getBounds(), {
          animate: true,
          duration: 1.5,
          // easeLinearity: 1,
          padding: [475, 0]
        });
        
      }
      // If there are more than one returned row from the filter, get the bounding
      // box and fly to it.
      else if (this.attributeTable.filteredData.length > 1) {

        this.attributeTable.filteredData.forEach((feature: any) => {
          // Check to see if the bbox property exists in the feature
          if (feature.bbox) {
            this.dialogService.setZoomBounds(feature.bbox[1], feature.bbox[0], bounds);
          } else if (feature.geometry.coordinates) {
            this.dialogService.setZoomBounds(feature.geometry.coordinates[1], feature.geometry.coordinates[0], bounds);
          }
        });

        // The Lat and Long Bounds members have been set, and can be used as the
        // bounds for the selected features
        var zoomBounds = [[bounds.NEMaxLat, bounds.NEMaxLong],
                          [bounds.SWMinLat, bounds.SWMinLong]];
        // Use the Leaflet map reference to fly to the bounds
        this.mainMap.flyToBounds(zoomBounds, {
          animate: true,
          duration: 1.5,
          padding: [475, 0]
        });
      }
      // If there's only one row returned from the filtering, add some padding on
      // all sides of the feature and don't fly to the maximum possible zoom.
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
