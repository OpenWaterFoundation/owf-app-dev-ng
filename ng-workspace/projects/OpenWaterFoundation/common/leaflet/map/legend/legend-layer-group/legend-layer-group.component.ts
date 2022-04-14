import { AfterViewInit,
          Component,
          EventEmitter,
          Input, 
          Output }                   from '@angular/core';

import { MatDialog,
          MatDialogConfig,
          MatDialogRef }             from '@angular/material/dialog';

import { take }                      from 'rxjs/operators';

import { OwfCommonService }          from '@OpenWaterFoundation/common/services';
import * as IM                       from '@OpenWaterFoundation/common/services';
import { DialogDataTableComponent,
          DialogDocComponent, 
          DialogGalleryComponent, 
          DialogPropertiesComponent} from '@OpenWaterFoundation/common/ui/dialog';
import { WindowManager,
          WindowType }               from '@OpenWaterFoundation/common/ui/window-manager';
import { MapLayerItem,
          MapLayerManager }          from '@OpenWaterFoundation/common/ui/layer-manager';
import { MapUtil }                   from '../../map.util';
import * as Papa                     from 'papaparse';


@Component({
  selector: 'legend-layer-group',
  templateUrl: './legend-layer-group.component.html',
  styleUrls: ['./legend-layer-group.component.css']
})
export class LegendLayerGroupComponent implements AfterViewInit {

  /** An object with each geoLayerId as the key, and all features of a geoLayerView,
   * usually a FeatureCollection, as the value. */
  @Input() allFeatures: any;
  /** EventEmitter that alerts the Map component (parent) that an update has happened,
   * and sends the selected background's geoLayerView name property. */
  // TODO: Not being used, can be used for another emitter to the Map Component.
  @Output() callSelectBackgroundLayer = new EventEmitter<any>();
  /** A categorized configuration object with the geoLayerId as key and a list of
   * name followed by color for each feature in the Leaflet layer to be shown in
   * the sidebar. */
  @Input() categorizedLayerColors: any;
  /** An object containing any event actions with their id as the key and the action
   * object itself as the value. */
  @Input() eventActions: any;
  /** The geoLayerViewGroup passed as input from the Map Component when
   * this component is created. */
  @Input() geoLayerViewGroup: any;
  /** An object of Style-like objects containing:
   * key  : geoLayerId
   * value: object with style properties
   * For displaying a graduated symbol in the Leaflet legend. */
  @Input() graduatedLayerColors: any;
  /** Boolean test variable for use with Angular Material slide toggle. */
  isChecked = true;
  /** Represents the Date string since the last time a layer was updated. */
  @Input() lastRefresh: any;
  /** Object containing a layer geoLayerId as the ID, and an object of properties
   * set by a user-defined classification file. */
  @Input() layerClassificationInfo: any;
  /** Reference to the Map Component Leaflet map object. */
  @Input() mainMap: any;
  /** The instance of the MapLayerManager, a helper class that manages MapLayerItem
   * objects with Leaflet layers and other layer data for displaying, ordering, and
   * highlighting. */
  mapLayerManager: MapLayerManager = MapLayerManager.getInstance();
  /** The windowManager instance; To create, maintain, and remove multiple open dialogs. */
  windowManager: WindowManager = WindowManager.getInstance();


  /**
   * The LegendLayerGroup constructor.
   * @param commonService The reference to the injected Common library.
   * @param dialog The reference to the MatDialog service.
   */
  constructor(public commonService: OwfCommonService,
              public dialog: MatDialog) {}

  /**
   * Called right after the constructor.
   */
  ngAfterViewInit(): void {

  }

  /**
  * Determine what layer the user clicked the clear button from, and rest the styling
  * for the highlighted features.
  * @param geoLayerId The geoLayerId to determine which layer style should be reset
  */
  clearSelections(geoLayerId: string): void {
    var layerItem: MapLayerItem = this.mapLayerManager.getMapLayerItem(geoLayerId);
    layerItem.removeAllSelectedLayers(this.mainMap);
  }

  /**
   * Verifies that only the kebab icon button is clicked, otherwise the event will
   * bubble up the DOM tree and expand the geoLayerViewGroup Mat Expansion Panel.
   * @param $event The MouseEvent object passed from the template file when the
   * geoLayerViewGroup kebab icon button is clicked.
   */
  clickIconButtonOnly($event: MouseEvent): void {
    $event.stopPropagation();
  }

  /**
  * @returns the value from the badPath object with the matching geoLayerId as the key
  * @param geoLayerId The geoLayerId of the layer
  */
  getBadPath(geoLayerId: string): string {
    return this.commonService.getBadPath(geoLayerId);
  }

  /**
  * @returns The geometryType of the current geoLayer to determine what shape should
  * be drawn in the legend.
  * @param geoLayerId The current geoLayerId.
  */
  getGeometryType(geoLayerId: string): any {
    return this.commonService.getGeometryType(geoLayerId);
  }

  /**
  * @returns Boolean on whether the layer on the Leaflet map has a bad path so a
  * red triangle is displayed on the layer's side bar legend.
  */
  isBadPath(geoLayerId: string): boolean {
    return this.commonService.isBadPath(geoLayerId);
  }

  /**
  * @returns Boolean on whether the layer on the Leaflet map's service URL is unavailable.
  * @param geoLayerId The geoLayerId for the layer
  */
  isServerUnavailable(geoLayerId: string): boolean {
    return this.commonService.isServerUnavailable(geoLayerId);
  }

  /**
  * When the info button by the side bar slider is clicked, it will either show a
  * popup or separate tab containing the documentation for the selected geoLayerViewGroup
  * or geoLayerView.
  * @param docPath The string representing the path to the documentation file.
  * @param geoId The geoMapId, geoLayerViewGroupId, or geoLayerViewId property.
  * @param geoName The geoMap, geoLayerViewGroup, or geoLayerView name property.
  */
  openDocDialog(docPath: string, geoId: string, geoName: string): void {
    var windowID = geoId + '-dialog-doc';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    var text: boolean, markdown: boolean, html: boolean;
    // Set the type of display the Mat Dialog will show.
    if (docPath.includes('.txt')) { text = true; }
    else if (docPath.includes('.md')) { markdown = true; }
    else if (docPath.includes('.html')) { html = true; }

    this.commonService.getPlainText(this.commonService.buildPath(IM.Path.dP, [docPath]), IM.Path.dP)
      .pipe(take(1))
      .subscribe((doc: any) => {

        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
          doc: doc,
          docPath: docPath,
          docText: text,
          docMarkdown: markdown,
          docHtml: html,
          fullMarkdownPath: this.commonService.getFullMarkdownPath(),
          geoId: geoId,
          geoName: geoName,
          mapConfigPath: this.commonService.getMapConfigPath(),
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
  * Opens an attribute (data) table Dialog with the necessary configuration data.
  * @param geoLayerView The current geoLayerView object.
  */
  openDataTableDialog(geoLayerView: any): void {
    var windowID = geoLayerView.geoLayerId + '-dialog-data-table';
    if (this.windowManager.windowExists(windowID) || this.allFeatures[geoLayerView.geoLayerId] === undefined) {
      return;
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      allFeatures: this.allFeatures[geoLayerView.geoLayerId],
      geoLayer: this.commonService.getGeoLayerFromId(geoLayerView.geoLayerId),
      geoLayerView: geoLayerView,
      geoMapName: this.commonService.getGeoMapName(),
      layerClassificationInfo: this.layerClassificationInfo,
      mapConfigPath: this.commonService.getMapConfigPath(),
      mainMap: this.mainMap
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
  }

  /**
  * Retrieves data asynchronously and creates an Image Gallery Dialog opened from
  * the Leaflet side bar kebab menu.
  * @param geoLayerId The geoLayer object from the selected layer.
  * @param geoLayerView The geoLayerView object from the selected layer.
  */
  openImageGalleryDialogFromKebab(geoLayerId: any, geoLayerView: any): void {
    var windowID = geoLayerId + '-dialog-gallery';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    var resourcePath = this.eventActions[geoLayerView.properties.imageGalleryEventActionId].resourcePath;
    let fullResourcePath = this.commonService.buildPath(IM.Path.rP, [resourcePath]);

    Papa.parse(fullResourcePath, {
      delimiter: ",",
      download: true,
      comments: "#",
      skipEmptyLines: true,
      header: true,
      complete: (result: any, file: any) => {

        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
          allFeatures: this.allFeatures[geoLayerId],
          eventActions: this.eventActions,
          geoLayerId: geoLayerId,
          geoLayerView: geoLayerView,
          mainMap: this.mainMap,
          papaResult: result.data,
          mapLayerItem: this.mapLayerManager.getMapLayerItem(geoLayerId)
        }
        const dialogRef: MatDialogRef<DialogGalleryComponent, any> = this.dialog.open(DialogGalleryComponent, {
          data: dialogConfig,
          hasBackdrop: false,
          panelClass: ['custom-dialog-container', 'mat-elevation-z24'],
          height: "700px",
          width: "910px",
          minHeight: "515px",
          minWidth: "650px",
          maxHeight: "700px",
          maxWidth: "910px"
        });

        this.windowManager.addWindow(windowID, WindowType.GAL);
      }
    });
  }

  /**
   * Creates the data dialog config object, adds it to the dialog ref object, and
   * sets all other necessary options to create and open the layer properties dialog.
   * @param geoLayerId The geoLayerView's geoLayerId.
   * @param geoLayerViewName The geoLayerView's geoLayerViewName.
   */
  public openPropertyDialog(geoLayerId: string, geoLayerViewName: any): void {

    var windowID = geoLayerId + '-dialog-properties';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    let layerItem: MapLayerItem = this.mapLayerManager.getMapLayerItem(geoLayerId);
    if (layerItem === null) return;

    // Create a MatDialogConfig object to pass to the DialogPropertiesComponent
    // for the graph that will be shown.
    const dialogConfig = new MatDialogConfig();

    if (layerItem.isRasterLayer()) {
      dialogConfig.data = {
        geoLayer: this.commonService.getGeoLayerFromId(geoLayerId),
        geoLayerId: geoLayerId,
        geoLayerViewName: geoLayerViewName,
        layerProperties: [],
        mapConfigPath: this.commonService.getMapConfigPath()
      }
    } else {
      dialogConfig.data = {
        geoLayer: this.commonService.getGeoLayerFromId(geoLayerId),
        geoLayerId: geoLayerId,
        geoLayerViewName: geoLayerViewName,
        layerProperties: Object.keys(this.allFeatures[geoLayerId].features[0].properties),
        mapConfigPath: this.commonService.getMapConfigPath()
      }
    }

    const dialogRef: MatDialogRef<DialogPropertiesComponent, any> = this.dialog.open(DialogPropertiesComponent, {
      data: dialogConfig,
      hasBackdrop: false,
      panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
      height: "700px",
      width: "910px",
      minHeight: "290px",
      minWidth: "550px",
      // vh = view height = 1% of the browser's height.
      maxHeight: "90vh",
      // vw = view width = 1% of the browser's width.
      maxWidth: "90vw"
    });

    this.windowManager.addWindow(windowID, WindowType.TEXT);
  }

  /**
   * Styles the inner shape section of a legend geoLayerView feature.
   * @param symbolProperties 
   * @param styleType A string representing 
   * @returns A style object for the legend shape.
   */
  styleInnerShape(symbolProperties: any, styleType: string): Object {
    switch (styleType) {
      // Graduated classificationType map configuration property.
      case 'g':
        return {
          fill: MapUtil.verify(symbolProperties.fillColor, IM.Style.fillColor),
          fillOpacity: MapUtil.verify(symbolProperties.fillOpacity, IM.Style.fillOpacity),
        }
    }
  }

  /**
  * Styles the outer shape section of a legend geoLayerView feature.
  * @param symbolProperties The display style object for the current layer's legend.
  * @param styleType A string differentiating between style objects.
  */
  styleOuterShape(symbolProperties: any, styleType: string): Object {

    switch (styleType) {
      // SingleSymbol classificationType map configuration property.
      case 'ss':
        return {
          fill: MapUtil.verify(symbolProperties.properties.fillColor, IM.Style.fillColor),
          fillOpacity: MapUtil.verify(symbolProperties.properties.fillOpacity, IM.Style.fillOpacity),
          opacity: MapUtil.verify(symbolProperties.properties.opacity, IM.Style.opacity),
          stroke: MapUtil.verify(symbolProperties.properties.color, IM.Style.color),
          strokeWidth: MapUtil.verify(symbolProperties.properties.weight, IM.Style.weight)
        };
      // Categorized classificationType map configuration property.
      case 'c':
        return {
          fill: MapUtil.verify(symbolProperties.fillColor, IM.Style.fillColor),
          fillOpacity: MapUtil.verify(symbolProperties.fillOpacity, IM.Style.fillOpacity),
          stroke: MapUtil.verify(symbolProperties.color, IM.Style.color),
          strokeWidth: MapUtil.verify(symbolProperties.weight, IM.Style.weight)
        };
      // Graduated classificationType map configuration property.
      case 'g':
        return {
          fillOpacity: '0',
          stroke: MapUtil.verify(symbolProperties.color, IM.Style.color),
          strokeOpacity: MapUtil.verify(symbolProperties.opacity, IM.Style.opacity),
          strokeWidth: MapUtil.verify(symbolProperties.weight, IM.Style.weight)
        }
      // If symbol is missing (sm), return a default styling object.
      case 'sm':
        return {
          fill: MapUtil.verify(undefined, IM.Style.fillColor),
          fillOpacity: MapUtil.verify(undefined, IM.Style.fillOpacity),
          opacity: MapUtil.verify(undefined, IM.Style.opacity),
          stroke: MapUtil.verify(undefined, IM.Style.color),
          strokeWidth: MapUtil.verify(undefined, IM.Style.weight)
        }
    }

  }

  /**
  * Toggles Leaflet layer visibility, side bar description & symbol, and slide toggle
  * button when it is clicked. Keeps the layer order integrity and (soon) the selectBehavior
  * Single property. This is when either zero or one layer at most can be showing
  * in a view group.
  * @param geoLayerId The current geoLayerId.
  * @param geoLayerViewGroupId The geoLayerViewGroupIf of the current geoLayerId.
  */
  toggleLayer(geoLayerId: string, geoLayerViewGroupId: string): void {
    // Obtain the MapLayerItem for this layer.
    var layerItem: MapLayerItem = this.mapLayerManager.getMapLayerItem(geoLayerId);
    // If the layer hasn't been added to the map yet, layerItem will be null. Keep the checked attribute set to false so that
    // nothing is done when the toggle button is clicked.
    if (layerItem === null) {
      (<HTMLInputElement>document.getElementById(geoLayerId + "-slider")).checked = false;
      return;
    }
    let checked = (<HTMLInputElement>document.getElementById(geoLayerId + "-slider")).checked;

    if (!checked) {
      layerItem.removeItemLeafletLayerFromMainMap(this.mainMap);
    }
    // If checked
    else {
      // Check to see if the layer has already been added to the Leaflet map. If it has, add the layer again. If it hasn't
      // (because of not being initially selected) use the addTo method on the layer and add to the map using the MapLayerItem
      if (layerItem.isAddedToMainMap()) {
        layerItem.addItemLeafletLayerToMainMap(this.mainMap);
        if (layerItem.getItemSelectBehavior().toUpperCase() === 'SINGLE') {
          this.mapLayerManager.toggleOffOtherLayersOnMainMap(geoLayerId, this.mainMap, geoLayerViewGroupId);
        }
      } else {
        layerItem.initItemLeafletLayerToMainMap(this.mainMap);
        if (layerItem.getItemSelectBehavior().toUpperCase() === 'SINGLE') {
          this.mapLayerManager.toggleOffOtherLayersOnMainMap(geoLayerId, this.mainMap, geoLayerViewGroupId);
        }
      }
      // When the slider is checked again, re-sort the layers so layer order is preserved.
      this.mapLayerManager.setLayerOrder();
    }
  }

  toggleLayerTest($event: any, geoLayerId: string): void {

  }

}
