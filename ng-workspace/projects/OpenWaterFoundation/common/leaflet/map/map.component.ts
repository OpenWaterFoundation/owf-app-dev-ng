import { AfterViewInit,
          Component,
          Input,
          OnDestroy,
          ViewContainerRef,
          ViewEncapsulation }       from '@angular/core';
import { ActivatedRoute }           from '@angular/router';
import { MatDialog,
          MatDialogRef,
          MatDialogConfig }         from '@angular/material/dialog';
import { MatSlideToggleChange }     from '@angular/material/slide-toggle';

import { DialogD3Component,
          DialogDataTableComponent,
          DialogDocComponent,
          DialogGalleryComponent,
          DialogHeatmapComponent,
          DialogPropertiesComponent,
          DialogTextComponent,
          DialogTSGraphComponent }  from '@OpenWaterFoundation/common/ui/dialog';

import { forkJoin,
          timer,
          interval,
          Observable,
          Subscription }            from 'rxjs';
import { take }                     from 'rxjs/operators';

import { OwfCommonService }         from '@OpenWaterFoundation/common/services';
import { MapLayerManager,
          MapLayerItem }            from '@OpenWaterFoundation/common/ui/layer-manager';
import { WindowManager,
          WindowType }              from '@OpenWaterFoundation/common/ui/window-manager';
import { MapUtil }                  from './map.util';
import { MapManager }               from './map-manager';

import * as IM                      from '@OpenWaterFoundation/common/services';
import * as Papa                    from 'papaparse';
import * as GeoRasterLayer          from 'georaster-layer-for-leaflet';
import geoblaze                     from 'geoblaze';
import * as parse_georaster         from 'georaster';
/** The globally used L object for Leaflet object creation and manipulation. */
// (L as any)
declare var L: any;
// import * as L from 'leaflet';


@Component({
  selector: 'common-map',
  styleUrls: ['./map.component.css'],
  templateUrl: './map.component.html',
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements AfterViewInit, OnDestroy {
  /**
  * ViewChild is used to inject a reference to components. This provides a reference to the html element
  * <ng-template background-layer-hook></ng-template> found in map.component.html. The following are used for dynamically
  * creating elements in the application. https://angular.io/guide/dynamic-component-loader 
  */
  // @ViewChild('testing', { read: ViewContainerRef }) backgroundLayerComp: any;
  /** Provides a reference to <ng-template side-panel-info-host></ng-template> in map.component.html */
  // @ViewChild(SidepanelInfoDirective, { static: true }) InfoComp: SidepanelInfoDirective;
  /** All features of a geoLayerView. Usually a FeatureCollection. */
  public allFeatures: {} = {};
  /**
   * Template input property used by consuming applications or websites for passing the path
   * to the app configuration file.
   */
  @Input('app-config') appConfig: any;
  /** Application version. */
  public appVersion: string;
  /** Array of background map groups from the map config file. Used for displaying background maps
   * in the sidebar panel. */
  public backgroundMapGroups = [];
  /** Accesses container ref in order to add and remove background layer components dynamically. */
  public backgroundViewContainerRef: ViewContainerRef;
  /** Boolean showing if the path given to some file is incorrect. */
  public badPath = false;
  /** Object that holds the base maps that populates the leaflet sidebar. */
  public baseMaps: {} = {};
  /**
  * A categorized configuration object with the geoLayerId as key and a list of name followed by color for each feature in
  * the Leaflet layer to be shown in the sidebar.
  */
  public categorizedLayerColors = {};
  /** Test variable for divIcon. */
  public count = 1;
  /** Used to indicate which background layer is currently displayed on the map. */
  public currentBackgroundLayer: string;
  /** The number of seconds since the last layer refresh. */
  public elapsedSeconds = 0;
  /** An object containing any event actions with their id as the key and the action object itself as the value. */
  public eventActions: {} = {};
  /** For the Leaflet map's config file subscription object so it can be closed on this component's destruction. */
  private forkJoinSub$ = <any>Subscription;
  /** An array of Style-like objects for displaying a graduated symbol in the Leaflet legend. */
  public graduatedLayerColors = {};
  /** Global value to access container ref in order to add and remove sidebar info components dynamically. */
  public infoViewContainerRef: ViewContainerRef;
  /** Time interval used for resetting the map after a specified time, if defined in the configuration file. */
  public interval: any = null;
  /** Boolean test variable for use with Angular Material slide toggle. */
  public isChecked = false;
  /** Represents the Date string since the last time the layer was updated. */
  public lastRefresh = {};
  /**
   * 
   */
  public layerClassificationInfo = {};
  /** Class variable to access container ref in order to add and remove map layer component dynamically. */
  public layerViewContainerRef: ViewContainerRef;
  /** Global value to access container ref in order to add and remove symbol descriptions components dynamically. */
  public legendSymbolsViewContainerRef: ViewContainerRef;
  /** The reference for the Leaflet map. */
  public mainMap: any;
  /** The map configuration subscription, unsubscribed to on component destruction. */
  private mapConfigSub$ = <any>Subscription;
  /** Determines whether the map config file path was correct, found, and read in.
   * If true, the map will be displayed. If false, the 404 div will let the user
   * know there was an issue with the URL/path to the */
  public mapFilePresent: boolean;
  /** A variable to keep track of whether or not the leaflet map has already been
  * initialized. This is useful for resetting the page and clearing the map using
  * map.remove() which can only be called on a previously initialized map. */
  public mapInitialized: boolean = false;
  /** The current map's ID from the app configuration file. */
  public mapID: string;
  /** The instance of the MapLayerManager, a helper class that manages MapLayerItem
  * objects with Leaflet layers and other layer data for displaying, ordering, and
  * highlighting. */
  public mapLayerManager: MapLayerManager = MapLayerManager.getInstance();
  /** The MapManger singleton instance, that will keep a certain number of Leaflet
  * map instances, so a new map won't have to be created every time the same map
  * button is clicked. */
  public mapManager: MapManager = MapManager.getInstance();
  /** InfoMapper project version. */
  public projectVersion: Observable<any>;
  /** The refresh subscription. Used with the rxjs timer, and unsubscribed on component
   * destruction. */
  private refreshSub$ = new Subscription();
  /** The route subscription, unsubscribed to on component destruction. */
  private routeSub$ = <any>Subscription;
  /** Boolean showing if the URL given for a layer is currently unavailable. */
  public serverUnavailable = false;
  /**
  * Boolean to indicate whether the sidebar has been initialized. Don't need to waste time/resources initializing sidebar twice,
  * but rather edit the information in the already initialized sidebar.
  */
  public sidebarInitialized: boolean = false;
  /** An array to hold sidebar background layer components to easily remove later, when resetting the sidebar.
  * NOTE: Might be able to remove. */
  public sidebarBackgroundLayers: any[] = [];
  /** Boolean of whether or not refresh is displayed. */
  public showRefresh: boolean = true;
  /** The windowManager instance; To create, maintain, and remove multiple open dialogs. */
  public windowManager: WindowManager = WindowManager.getInstance();


  /**
  * @constructor for the Map Component.
  * @param owfCommonService A reference to the common library service.
  * @param componentFactoryResolver Adding components dynamically.
  * @param dialog A reference to the MatDialog for creating and displaying a popup with a chart.
  * @param route Used for getting the parameter 'id' passed in by the url and from the router.
  */
  constructor(public owfCommonService: OwfCommonService,
              public dialog: MatDialog,
              private route: ActivatedRoute) {
    if (window['Cypress']) window['MapComponent'] = this;
  }


  /**
  * Add content to the info tab of the sidebar dynamically. Following the example from the Angular
  * documentation found here: https://angular.io/guide/dynamic-component-loader
  */
  private addInfoToSidebar(): void {
    // let componentFactory = this.componentFactoryResolver.resolveComponentFactory(SidepanelInfoComponent);
    // console.log('this.InfoComp: ' + this.InfoComp);
    // let infoViewContainerRef = this.InfoComp.viewContainerRef;
    // let componentRef = infoViewContainerRef.createComponent(componentFactory);

    // (<SidepanelInfoComponent>componentRef.instance).properties = this.owfCommonService.getProperties();
    // (<SidepanelInfoComponent>componentRef.instance).appVersion = this.owfCommonService.appConfig.version;
    this.appVersion = this.owfCommonService.appConfig.version;
    this.projectVersion = this.owfCommonService.getJSONData('assets/version.json', IM.Path.vP);
  }

  /**
  * Dynamically add the layer information to the sidebar coming in from the map configuration file.
  * @param configFile 
  */
  private addLayerToSidebar(configFile: any) {
    // reset the sidebar components so elements are added on top of each other
    this.resetSidebarComponents();

    // Creates new layerToggle component in sideBar for each layer specified in
    // the config file, sets data based on map service.
    // var geoLayers = configFile.geoMaps[0].geoLayers;

    let mapGroups: any[] = [];
    // let backgroundMapGroups: any[] = [];
    let viewGroups: any = configFile.geoMaps[0].geoLayerViewGroups;
    // var groupNumber = 0;

    viewGroups.forEach((group: any) => {
      if (group.properties.isBackground == undefined ||
        group.properties.isBackground == "false") {
        mapGroups.push(group);
      }
      if (group.properties.isBackground == "true")
        this.backgroundMapGroups.push(group);
    });

    // // Create the each background component asynchronously by using setTimeout. If no time is given to setTimeout, 0 is used by
    // default, which makes sure that viewContainerRef is defined by the time the components are created.
    // setTimeout(() => {
    //   backgroundMapGroups.forEach((backgroundGroup: any) => {
    //     backgroundGroup.geoLayerViews.forEach((backgroundGeoLayerView: any) => {
    //       this.backgroundLayerComp.clear();
    //       // Create the background map layer component
    //       let componentFactory = this.componentFactoryResolver.resolveComponentFactory(BackgroundLayerComponent);
    //       console.log('this.backgroundLayerComp: ' + this.backgroundLayerComp);
    //       this.backgroundViewContainerRef = this.backgroundLayerComp.viewContainerRef;
    //       let componentRef = this.backgroundViewContainerRef.createComponent(componentFactory);
    //       // Initialize the data for the background map layer component
    //       let component = <BackgroundLayerComponent>componentRef.instance;
    //       component.data = backgroundGeoLayerView;
    //       component.mapComponentReference = this;

    //       // Save the reference to this component so it can be removed when resetting the page.
    //       this.sidebarBackgroundLayers.push(componentRef);
    //     });
    //   });
    // });

  }

  /**
  * Add every action ID as the key and the action object as the value of the @var eventActions object, sent to the Gallery
  * Dialog component.
  * @param eventObject The object containing the type of event as the key (e.g. click-eCP) and the entire event object from the
  * popup template file.
  */
  private addToEventActions(eventObject: any): void {
    if (eventObject['click-eCP'] && eventObject['click-eCP'].actions) {
      for (let action of eventObject['click-eCP'].actions) {
        if (action.id) {
          this.eventActions[action.id] = action;
        }
      }
    }
  }

  /**
  * A CSV classification file is given by the user, so use that to create the colorTable to add to the categorizedLayerColors
  * array for creating the legend colors.
  * @param results An array of objects containing information from each row in the CSV file
  * @param geoLayerId The geoLayerId of the given layer. Used for creating legend colors
  */
  private assignCategorizedFileColor(results: any[], geoLayerId: string): void {

    if (!results[0].value) {
      console.warn('The classification file for layer with geoLayerId \'' + geoLayerId + '\' does not contain value as a header, ' +
        'which is required for Categorized classification. The layer\'s legend and/or map layer may not display correctly');
    }

    let colorTable: any[] = [];
    var propertyObject: any;

    for (let line of results) {
      propertyObject = {};
      colorTable.push(line.label);

      if (line.color) {
        propertyObject.color = line.color;
      }
      if (line.fillColor) {
        propertyObject.fillColor = line.fillColor;
      }
      if (line.fillOpacity) {
        propertyObject.fillOpacity = line.fillOpacity;
      }
      if (line.weight) {
        propertyObject.weight = line.weight;
      }

      colorTable.push(propertyObject);
    }

    if (this.categorizedLayerColors[geoLayerId]) {
      this.categorizedLayerColors[geoLayerId] = colorTable;
    }
  }

  /**
  * Assigns the array of objects of each line in the CSV file as the value in the @var graduatedLayerColors with the geoLayerId
  * as the key. Also possibly replaces any ${property} notation variable in the `label` value if it exists.
  * @param results An array of objects that represent each line from the CSV classification file.
  * @param geoLayerId The geoLayerId for the current layer.
  */
  private assignGraduatedFileColor(results: any[], geoLayerId: string): void {

    if (!results[0].valueMin && !results[0].valueMax) {
      console.warn('The classification file for layer with geoLayerId \'' + geoLayerId + '\' does not contain valueMin and ' +
        'valueMax as a header, which is required for Graduated classification. The layer\'s legend and/or map layer may not display correctly');
    }

    var lineArr: any[] = [];
    for (let line of results) {
      // Replace all user-defined ${property} notation in the label with the correct 
      if (line.label) {
        line.label = MapUtil.obtainPropertiesFromLine(line.label, line, geoLayerId, true);
      }
      lineArr.push(line);
    }

    this.graduatedLayerColors[geoLayerId] = lineArr;
  }

  /**
  * The entry point and main foundation for building the Leaflet map using the data from the configuration file. Contains the
  * building and positioning of the map, raster and/or vector layers on the map and all necessary Leaflet functions for the
  * creation and styling of shapes, polygons and images on the map (among other options).
  */
  private buildMap(): void {

    this.mapInitialized = true;
    var _this = this;

    // Create background layers from the configuration file.
    let backgroundLayers: any[] = this.owfCommonService.getBackgroundLayers();
    // Iterate over each background layer, create them using tileLayer, and add them to the baseMaps class object
    backgroundLayers.forEach((geoLayer: IM.GeoLayer) => {
      let leafletBackgroundLayer = L.tileLayer(geoLayer.sourcePath, {
        attribution: geoLayer.properties.attribution,
        maxZoom: geoLayer.properties.zoomLevelMax ? parseInt(geoLayer.properties.zoomLevelMax) : 18
      });
      this.baseMaps[this.owfCommonService.getBkgdGeoLayerViewFromId(geoLayer.geoLayerId).name] = leafletBackgroundLayer;

      var bkgdGeoLayerView = this.owfCommonService.getBkgdGeoLayerViewFromId(geoLayer.geoLayerId);
      
      if (bkgdGeoLayerView.properties.refreshInterval) {
        var refreshInterval = this.owfCommonService.getRefreshInterval(bkgdGeoLayerView.geoLayerId);
        var refreshOffset = this.owfCommonService.getRefreshOffset(bkgdGeoLayerView.geoLayerId, refreshInterval);
        // Check if the parsing was successful. 
        if (isNaN(refreshInterval)) {
        } else {
          this.refreshLayer(refreshOffset, refreshInterval, geoLayer, IM.RefreshType.tile,
            null, null, leafletBackgroundLayer);
        }
  
      }
    });

    // Create a Leaflet Map and set the default layers.
    this.mainMap = L.map('mapID', {
      layers: [this.baseMaps[this.owfCommonService.getDefaultBackgroundLayer()]],
      // We're using our own zoom control for the map, so we don't need the default
      zoomControl: false,
      wheelPxPerZoomLevel: 150,
      zoomSnap: 0.1
    });

    // Retrieve the initial extent from the config file and set the map view
    let extentInitial = this.owfCommonService.getExtentInitial();
    this.mainMap.setView([extentInitial[1], extentInitial[0]], extentInitial[2]);

    // Set the default layer radio check to true
    this.setDefaultBackgroundLayer();

    // Add the background layers to the maps control in the topright
    if (this.owfCommonService.getBackgroundLayersMapControl()) {
      L.control.layers(this.baseMaps).addTo(this.mainMap);
    }

    // baselayerchange is fired when the base layer is changed through the layer control. So when a radio button is pressed and
    // the basemap changes, update the currentBackgroundLayer and check the radio button
    this.mainMap.on('baselayerchange', (backgroundLayer: any) => {
      this.setBackgroundLayer(backgroundLayer.name);
    });

    // Get the map name from the config file.
    let mapName: string = this.owfCommonService.getGeoMapName();
    // Create the control on the Leaflet map
    var mapTitle = L.control({ position: 'topleft' });
    // Add the title to the map in a div whose class name is 'info'
    mapTitle.onAdd = function () {
      this._div = L.DomUtil.create('div', 'info');
      this._div.id = 'title-card';
      this.update();
      // Without this, the mouse cannot select what's in the info div. With it, it can. This hopefully helps with the
      // flashing issues that have been happening when a user hovers over a feature on the map. NOTE: It didn't
      // L.DomEvent.disableClickPropagation(this._div);
      return this._div;
    };
    // When the title-card is created, have it say this
    mapTitle.update = function () {
      this._div.innerHTML = ('<h4>' + mapName + '</h4>');
    };
    mapTitle.addTo(this.mainMap);

    // Display the zoom level on the map
    let mapZoom = L.control({ position: 'bottomleft' });
    mapZoom.onAdd = function () {
      // Have Leaflet create a div with the class name zoomInfo
      this._container = L.DomUtil.create('div', 'zoomInfo');
      // When the map is created for the first time, call update to display zoom
      this.update();
      // On subsequent zoom events (at the end of the zoom) update the innerHTML again, and round to tenths
      _this.mainMap.on('zoomend', function () {
        this._container.innerHTML = '<div id="zoomInfo">Zoom Level: ' + _this.mainMap.getZoom().toFixed(1) + '</div>';
      }, this);
      return this._container;
    };
    mapZoom.update = function () {
      this._container.innerHTML = '<div id="zoomInfo">Zoom Level: ' + _this.mainMap.getZoom().toFixed(1) + '</div>';
    };
    // jpkeahey might have to turn the event listener off when a map is removed
    // mapZoom.onRemove = function() {
    //   L.DomUtil.remove(this._container);
    //   map.off('zoomend', )
    // }

    // Add home and zoom in/zoom out control to the top right corner
    L.Control.zoomHome({
      position: 'topright',
      zoomHomeTitle: 'Zoom to initial extent'
    }).addTo(this.mainMap);

    // Show the lat and lang of mouse position in the bottom left corner
    var mousePosition = L.control.mousePosition({
      position: 'bottomleft',
      lngFormatter: (num: number) => {
        let direction = (num < 0) ? 'W' : 'E';
        let formatted = Math.abs(num).toFixed(6) + '&deg ' + direction;
        return formatted;
      },
      latFormatter: (num: number) => {
        let direction = (num < 0) ? 'S' : 'N';
        let formatted = Math.abs(num).toFixed(6) + '&deg ' + direction;
        return formatted;
      }
    });

    // The next three lines of code makes sure that each control in the bottom left is created on the map in a specific order
    this.mainMap.addControl(mousePosition);
    this.mainMap.addControl(mapZoom);
    // Bottom Left corner control that shows the scale in km and miles of the map.
    L.control.scale({ position: 'bottomleft', imperial: true }).addTo(this.mainMap);

    updateTitleCard();
    /**
    * Updates the title card in the top left corner of the map.
    */
    function updateTitleCard(): void {
      let div = L.DomUtil.get('title-card');
      let instruction: string = "Move over or click on a feature for more information";
      let divContents: string = "";

      divContents = ('<h4 id="geoLayerView">' + mapName + '</h4>' + '<p id="point-info"></p>');
      if (instruction != "") {
        divContents += ('<hr class="normal-hr"/>' + '<p id="instructions"><i>' + instruction + '</i></p>');
      }
      div.innerHTML = divContents;
    }

    var geoLayerViewGroups: IM.GeoLayerViewGroup[] = this.owfCommonService.getLayerGroups();

    // Iterate through each geoLayerView in every geoLayerViewGroup, and create & add a Leaflet map layer for them.
    geoLayerViewGroups.forEach((geoLayerViewGroup: IM.GeoLayerViewGroup) => {
      if (geoLayerViewGroup.properties.isBackground === undefined || geoLayerViewGroup.properties.isBackground === 'false') {

        for (let geoLayerView of geoLayerViewGroup.geoLayerViews) {

          // Obtain the geoLayer for use in creating this Leaflet layer
          let geoLayer: IM.GeoLayer = this.owfCommonService.getGeoLayerFromId(geoLayerView.geoLayerId);
          // Obtain the symbol data for use in creating this Leaflet layer
          let symbol: IM.GeoLayerSymbol = this.owfCommonService.getSymbolDataFromID(geoLayer.geoLayerId);
          // A geoLayerSymbol object was not provided in the geoLayerView, so leave the user an error message and log an
          // error message that one needs to be added to show something other than default styling.
          if (!symbol) {
            console.error('Layer with geoLayerId \'' + geoLayer.geoLayerId + '\' was not given a geoLayerSymbol, ' +
              'which must be used to create the layer using the \'classificationType\' property.');
            return;
          }
          // Obtain the event handler information from the geoLayerView for use in creating this Leaflet layer
          let eventHandlers: IM.EventHandler[] = this.owfCommonService.getGeoLayerViewEventHandler(geoLayer.geoLayerId);

          var asyncData: Observable<any>[] = [];

          // // Displays a web feature service from Esri. 
          // if (geoLayer.sourceFormat && geoLayer.sourceFormat.toUpperCase() === 'WFS') {
          // }

          // Put the path to the layer data file no matter what. If file is for a raster,
          // the handleError function in the owfCommonService will skip it and won't log any errors.
          asyncData.push(
            this.owfCommonService.getJSONData(
              this.owfCommonService.buildPath(IM.Path.gLGJP, [geoLayer.sourcePath]), IM.Path.gLGJP, geoLayer.geoLayerId
            )
          );
          // Push each event handler onto the async array if there are any.
          if (eventHandlers.length > 0) {
            eventHandlers.forEach((event: IM.EventHandler) => {
              // TODO: jpkeahey 2020.10.22 - popupConfigPath will be deprecated, but will still work for now, just with a warning
              // message displayed to the user.
              if (event.properties.popupConfigPath) {
                console.warn('The Event Handler property \'popupConfigPath\' is deprecated. \'eventConfigPath\' will replace ' +
                  'it, will be supported in the future, and should be used instead');
                // Use the http GET request function and pass it the returned formatted path.
                asyncData.push(
                  this.owfCommonService.getJSONData(
                    this.owfCommonService.buildPath(IM.Path.eCP, [event.properties.popupConfigPath]), IM.Path.eCP, this.mapID
                  )
                );
              }
              else if (event.properties.eventConfigPath) {
                // Use the http GET request function and pass it the returned formatted path.
                asyncData.push(
                  this.owfCommonService.getJSONData(
                    this.owfCommonService.buildPath(IM.Path.eCP, [event.properties.eventConfigPath]), IM.Path.eCP, this.mapID
                  )
                );
              }
            });
          }
          // Use forkJoin to go through the array and be able to subscribe to every
          // element and get the response back in the results array when finished.
          this.forkJoinSub$ = forkJoin(asyncData).subscribe((results) => {
            // The scope of this does not reach the leaflet event functions. _this will allow a reference to this.
            var _this = this;
            // The first element in the results array will always be the features
            // returned from the geoJSON file. If it's undefined, it's for an Image
            // layer. An error occurred if an error attribute exists in the object.
            if (results[0] && !results[0].error) {
              this.allFeatures[geoLayer.geoLayerId] = results[0];
            }
            
            // There was an error retrieving the layer JSON data.
            if (results[0] && results[0].error) {
              console.error('An error retrieving the "' + geoLayer.geoLayerId +
              '" layer data occurred. Error code: ' + results[0].error.code +
              '. Error message: "' + results[0].error.message + '". Turning layer off.');
              this.owfCommonService.addLayerError(geoLayer.geoLayerId);
              return;
            }

            // Prints out how many features each geoLayerView contains. Helpful for debugging.
            if (this.allFeatures[geoLayer.geoLayerId]) {
              console.log(geoLayerView.name, 'contains', this.allFeatures[geoLayer.geoLayerId].features.length,
                (this.allFeatures[geoLayer.geoLayerId].features.length === 1 ? 'feature' : 'features'));
            }

            var eventObject: any = {};
            // Go through each event and assign the retrieved template output to each event type in an eventObject
            if (eventHandlers.length > 0) {
              for (let i = 0; i < eventHandlers.length; i++) {
                eventObject[eventHandlers[i].eventType + '-eCP'] = results[i + 1];
              }
            }
            this.addToEventActions(eventObject);

            // If the layer is a Raster, create it separately.
            if (geoLayer.layerType.toUpperCase().includes('RASTER')) {
              this.createRasterLayer(geoLayer, symbol, geoLayerView, geoLayerViewGroup, eventObject);
            }
            // If the layer is a LINESTRING or SINGLESYMBOL POLYGON, create it here.
            else if (geoLayer.geometryType.toUpperCase().includes('LINESTRING') ||
              geoLayer.geometryType.toUpperCase().includes('POLYGON') &&
              symbol.classificationType.toUpperCase().includes('SINGLESYMBOL')) {
              // TODO: jkeahey 2021.5.11 - Is anything in this conditional necessary?
              if (symbol.properties.classificationFile) {
                Papa.parse(this.owfCommonService.buildPath(IM.Path.cP, [symbol.properties.classificationFile]), {
                  delimiter: ",",
                  download: true,
                  comments: "#",
                  skipEmptyLines: true,
                  header: true,
                  complete: (result: any, file: any) => {
                    // Check if classified as CATEGORIZED.
                    if (symbol.classificationType.toUpperCase() === 'CATEGORIZED') {
                      // Populate the categorizedLayerColors object with the results from the classification file if the
                      // geoLayerSymbol attribute classificationType is Categorized.
                      this.assignCategorizedFileColor(result.data, geoLayer.geoLayerId);
                    }
                    // Check if classified as GRADUATED.
                    else if (symbol.classificationType.toUpperCase() === 'GRADUATED') {
                      // Populate the graduatedLayerColors array with the results from the classification file if the
                      // geoLayerSymbol attribute classificationType is Graduated.
                      this.assignGraduatedFileColor(result.data, geoLayer.geoLayerId);
                    }

                    var data = L.geoJson(this.allFeatures[geoLayer.geoLayerId], {
                      style: function (feature: any) {
                        return MapUtil.addStyle({
                          feature: feature,
                          symbol: symbol,
                          results: result.data,
                          geoLayer: geoLayer
                        })
                      },
                      onEachFeature: onEachFeature
                    });
                    // Add the newly created Leaflet layer to the MapLayerManager, and if it has the selectedInitial field set
                    // to true (or it's not given) add it to the Leaflet map. If false, don't show it yet.
                    this.mapLayerManager.addLayerItem(data, geoLayer, geoLayerView, geoLayerViewGroup);
                    let layerItem: MapLayerItem = this.mapLayerManager.getLayerItem(geoLayer.geoLayerId);
                    if (layerItem.isSelectInitial()) {
                      layerItem.initItemLeafletLayerToMainMap(this.mainMap);
                      if (layerItem.getItemSelectBehavior().toUpperCase() === 'SINGLE') {
                        this.mapLayerManager.toggleOffOtherLayersOnMainMap(geoLayer.geoLayerId, this.mainMap,
                          geoLayerViewGroup.geoLayerViewGroupId, 'init');
                      }
                    }

                    this.mapLayerManager.setLayerOrder();
                  }
                });

              } else {
                var data = L.geoJson(this.allFeatures[geoLayer.geoLayerId], {
                  onEachFeature: onEachFeature,
                  style: MapUtil.addStyle({
                    feature: this.allFeatures[geoLayer.geoLayerId],
                    geoLayer: geoLayer,
                    symbol: symbol
                  })
                });
                // Add the newly created Leaflet layer to the MapLayerManager, and if it has the selectedInitial field set
                // to true (or it's not given) add it to the Leaflet map. If false, don't show it yet.
                this.mapLayerManager.addLayerItem(data, geoLayer, geoLayerView, geoLayerViewGroup);
                let layerItem: MapLayerItem = this.mapLayerManager.getLayerItem(geoLayer.geoLayerId);
                if (layerItem.isSelectInitial()) {
                  layerItem.initItemLeafletLayerToMainMap(this.mainMap);
                  if (layerItem.getItemSelectBehavior().toUpperCase() === 'SINGLE') {
                    this.mapLayerManager.toggleOffOtherLayersOnMainMap(geoLayer.geoLayerId, this.mainMap,
                      geoLayerViewGroup.geoLayerViewGroupId, 'init');
                  }
                }

                this.mapLayerManager.setLayerOrder();
              }
            }
            // If the layer is a POLYGON, create it here.
            else if (geoLayer.geometryType.toUpperCase().includes('POLYGON')) {

              this.categorizedLayerColors[geoLayer.geoLayerId] = [];

              if (symbol.properties.classificationFile) {

                Papa.parse(this.owfCommonService.buildPath(IM.Path.cP, [symbol.properties.classificationFile]), {
                  delimiter: ",",
                  download: true,
                  comments: "#",
                  skipEmptyLines: true,
                  header: true,
                  complete: (result: any, file: any) => {
                    // Check if classified as CATEGORIZED.
                    if (symbol.classificationType.toUpperCase() === 'CATEGORIZED') {
                      // Populate the categorizedLayerColors object with the results from the classification file if the
                      // geoLayerSymbol attribute classificationType is Categorized.
                      this.assignCategorizedFileColor(result.data, geoLayer.geoLayerId);
                    }
                    // Check if classified as GRADUATED.
                    else if (symbol.classificationType.toUpperCase() === 'GRADUATED') {
                      // Populate the graduatedLayerColors array with the results from the classification file if the
                      // geoLayerSymbol attribute classificationType is Graduated.
                      this.assignGraduatedFileColor(result.data, geoLayer.geoLayerId);
                    }

                    this.layerClassificationInfo[geoLayer.geoLayerId] = {
                      weight: result.data[0].weight
                    };

                    var geoLayerView = this.owfCommonService.getGeoLayerViewFromId(geoLayer.geoLayerId);
                    var results = result.data;

                    let data = new L.geoJson(this.allFeatures[geoLayer.geoLayerId], {
                      onEachFeature: onEachFeature,
                      style: function (feature: any) {
                        return MapUtil.addStyle({
                          feature: feature,
                          symbol: symbol,
                          results: results,
                          geoLayerView: geoLayerView
                        })
                      }
                    });
                    // Add the newly created Leaflet layer to the MapLayerManager, and if it has the selectedInitial field set
                    // to true (or it's not given) add it to the Leaflet map. If false, don't show it yet.
                    this.mapLayerManager.addLayerItem(data, geoLayer, geoLayerView, geoLayerViewGroup);
                    let layerItem: MapLayerItem = this.mapLayerManager.getLayerItem(geoLayer.geoLayerId);
                    if (layerItem.isSelectInitial()) {
                      layerItem.initItemLeafletLayerToMainMap(this.mainMap);
                      if (layerItem.getItemSelectBehavior().toUpperCase() === 'SINGLE') {
                        this.mapLayerManager.toggleOffOtherLayersOnMainMap(geoLayer.geoLayerId, this.mainMap,
                          geoLayerViewGroup.geoLayerViewGroupId, 'init');
                      }
                    }

                    this.mapLayerManager.setLayerOrder();
                  }
                });

              } else {
                // Default color table is made here
                let colorTable = MapUtil.assignColor(this.allFeatures[geoLayer.geoLayerId].features, symbol);
                this.categorizedLayerColors[geoLayer.geoLayerId] = colorTable;

                // If there is no classificationFile, create a default colorTable
                let data = L.geoJson(this.allFeatures[geoLayer.geoLayerId], {
                  onEachFeature: onEachFeature,
                  style: (feature: any, layerData: any) => {
                    let classificationAttribute: any = feature['properties'][symbol.classificationAttribute];
                    return {
                      color: MapUtil.verify(MapUtil.getColor(symbol, classificationAttribute, colorTable), IM.Style.color),
                      fillOpacity: MapUtil.verify(symbol.properties.fillOpacity, IM.Style.fillOpacity),
                      opacity: MapUtil.verify(symbol.properties.opacity, IM.Style.opacity),
                      stroke: symbol.properties.outlineColor === "" ? false : true,
                      weight: MapUtil.verify(parseInt(symbol.properties.weight), IM.Style.weight)
                    }
                  }
                });

                // Add the newly created Leaflet layer to the MapLayerManager, and if it has the selectedInitial field set
                // to true (or it's not given) add it to the Leaflet map. If false, don't show it yet.
                this.mapLayerManager.addLayerItem(data, geoLayer, geoLayerView, geoLayerViewGroup);
                let layerItem: MapLayerItem = this.mapLayerManager.getLayerItem(geoLayer.geoLayerId);
                if (layerItem.isSelectInitial()) {
                  layerItem.initItemLeafletLayerToMainMap(this.mainMap);
                  if (layerItem.getItemSelectBehavior().toUpperCase() === 'SINGLE') {
                    this.mapLayerManager.toggleOffOtherLayersOnMainMap(geoLayer.geoLayerId, this.mainMap,
                      geoLayerViewGroup.geoLayerViewGroupId, 'init');
                  }
                }

                this.mapLayerManager.setLayerOrder();
              }
            }
            // Display an image on the map.
            else if (geoLayer.layerType.toUpperCase().includes('IMAGE')) {
              var imageLayer = L.imageOverlay(
                this.owfCommonService.buildPath(IM.Path.iP, [geoLayer.sourcePath]),
                MapUtil.parseImageBounds(geoLayerView.properties.imageBounds),
                {
                  opacity: MapUtil.verify(symbol.properties.opacity, IM.Style.opacity)
                }
              );

              // Add the newly created Leaflet layer to the MapLayerManager, and if it has the selectedInitial field set
              // to true (or it's not given) add it to the Leaflet map. If false, don't show it yet.
              this.mapLayerManager.addLayerItem(imageLayer, geoLayer, geoLayerView, geoLayerViewGroup);
              let layerItem: MapLayerItem = this.mapLayerManager.getLayerItem(geoLayer.geoLayerId);
              if (layerItem.isSelectInitial()) {
                layerItem.initItemLeafletLayerToMainMap(this.mainMap);
                if (layerItem.getItemSelectBehavior().toUpperCase() === 'SINGLE') {
                  this.mapLayerManager.toggleOffOtherLayersOnMainMap(geoLayer.geoLayerId, this.mainMap,
                    geoLayerViewGroup.geoLayerViewGroupId, 'init');
                }
              }

              this.mapLayerManager.setLayerOrder();

              // Check if the image layer needs to be refreshed.
              if (geoLayerView.properties.refreshInterval) {
                var refreshInterval = this.owfCommonService.getRefreshInterval(geoLayerView.geoLayerId);
                var refreshOffset = this.owfCommonService.getRefreshOffset(geoLayerView.geoLayerId, refreshInterval);
                // Confirm the parsing was successful by checking if getRefreshInterval returned a number.
                if (!isNaN(refreshInterval)) {
                  this.refreshLayer(refreshOffset, refreshInterval, geoLayer, IM.RefreshType.image,
                                      geoLayerView, symbol);
                }
              }
            }
            // Display a Leaflet marker or custom point/SHAPEMARKER
            else {
              // If the point layer contains a classification file for styling.
              if (symbol.properties.classificationFile) {
                Papa.parse(this.owfCommonService.buildPath(IM.Path.cP, [symbol.properties.classificationFile]), {
                  delimiter: ",",
                  download: true,
                  comments: "#",
                  skipEmptyLines: true,
                  header: true,
                  complete: (result: any, file: any) => {
                    // Check if classified as CATEGORIZED.
                    if (symbol.classificationType.toUpperCase() === 'CATEGORIZED') {
                      // Populate the categorizedLayerColors object with the results from the classification file if the
                      // geoLayerSymbol attribute classificationType is Categorized.
                      this.assignCategorizedFileColor(result.data, geoLayer.geoLayerId);
                    }
                    // Check if classified as GRADUATED.
                    else if (symbol.classificationType.toUpperCase() === 'GRADUATED') {
                      // Populate the graduatedLayerColors array with the results from the classification file if the
                      // geoLayerSymbol attribute classificationType is Graduated.
                      this.assignGraduatedFileColor(result.data, geoLayer.geoLayerId);
                    }

                    this.layerClassificationInfo[geoLayer.geoLayerId] = {
                      symbolShape: result.data[0].symbolShape,
                      symbolSize: result.data[0].symbolSize,
                      weight: result.data[0].weight
                    };

                    var data = L.geoJson(this.allFeatures[geoLayer.geoLayerId], {
                      pointToLayer: (feature: any, latlng: any) => {
                        // Create a shapemarker layer
                        if (geoLayer.geometryType.toUpperCase().includes('POINT') &&
                          !symbol.properties.symbolImage && !symbol.properties.builtinSymbolImage) {
                          return L.shapeMarker(latlng, MapUtil.addStyle({
                            feature: feature,
                            geoLayer: geoLayer,
                            results: result.data,
                            symbol: symbol
                          }));
                        }
                        // Create a user-provided marker image layer
                        else if (symbol.properties.symbolImage) {

                          let markerIcon = new L.icon({
                            iconUrl: this.owfCommonService.getAppPath() + this.owfCommonService.formatPath(symbol.properties.symbolImage, IM.Path.sIP),
                            iconAnchor: MapUtil.createAnchorArray(symbol.properties.symbolImage, symbol.properties.imageAnchorPoint)
                          });

                          let leafletMarker = L.marker(latlng, { icon: markerIcon });
                          // Determine if there are eventHandlers on this layer by checking its geoLayerView object.
                          var geoLayerView = this.owfCommonService.getGeoLayerViewFromId(geoLayer.geoLayerId);

                          MapUtil.createLayerTooltips(leafletMarker, eventObject, geoLayerView.properties.imageGalleryEventActionId,
                            geoLayerView.geoLayerSymbol.properties.labelText, this.count);
                          ++this.count;

                          return leafletMarker;
                        }
                        // Create a built-in (default) marker image layer
                        else if (symbol.properties.builtinSymbolImage) {
                          let markerIcon = new L.icon({
                            iconUrl: this.owfCommonService.formatPath(symbol.properties.builtinSymbolImage, IM.Path.bSIP),
                            iconAnchor: MapUtil.createAnchorArray(symbol.properties.builtinSymbolImage, symbol.properties.imageAnchorPoint)
                          });
                          return L.marker(latlng, { icon: markerIcon })
                        }
                      },
                      onEachFeature: onEachFeature
                    });
                    // Add the newly created Leaflet layer to the MapLayerManager, and if it has the selectedInitial field set
                    // to true (or it's not given) add it to the Leaflet map. If false, don't show it yet.
                    this.mapLayerManager.addLayerItem(data, geoLayer, geoLayerView, geoLayerViewGroup);
                    let layerItem: MapLayerItem = this.mapLayerManager.getLayerItem(geoLayer.geoLayerId);
                    if (layerItem.isSelectInitial()) {
                      layerItem.initItemLeafletLayerToMainMap(this.mainMap);
                      if (layerItem.getItemSelectBehavior().toUpperCase() === 'SINGLE') {
                        this.mapLayerManager.toggleOffOtherLayersOnMainMap(geoLayer.geoLayerId, this.mainMap,
                          geoLayerViewGroup.geoLayerViewGroupId, 'init');
                      }
                    }
                    this.mapLayerManager.setLayerOrder();
                  }
                });
              } else {
                var data = L.geoJson(this.allFeatures[geoLayer.geoLayerId], {
                  pointToLayer: (feature: any, latlng: any) => {
                    // Create a shapemarker layer
                    if (geoLayer.geometryType.toUpperCase().includes('POINT') &&
                      !symbol.properties.symbolImage && !symbol.properties.builtinSymbolImage) {
                      return L.shapeMarker(latlng, MapUtil.addStyle({
                        feature: feature,
                        geoLayer: geoLayer,
                        symbol: symbol
                      }));
                    }
                    // Create a user-provided marker image layer
                    else if (symbol.properties.symbolImage) {

                      let markerIcon = new L.icon({
                        iconUrl: this.owfCommonService.getAppPath() + this.owfCommonService.formatPath(symbol.properties.symbolImage, IM.Path.sIP),
                        iconAnchor: MapUtil.createAnchorArray(symbol.properties.symbolImage, symbol.properties.imageAnchorPoint)
                      });

                      let leafletMarker = L.marker(latlng, { icon: markerIcon });
                      // Determine if there are eventHandlers on this layer by checking its geoLayerView object.
                      var geoLayerView = this.owfCommonService.getGeoLayerViewFromId(geoLayer.geoLayerId);

                      MapUtil.createLayerTooltips(leafletMarker, eventObject, geoLayerView.properties.imageGalleryEventActionId,
                        geoLayerView.geoLayerSymbol.properties.labelText, this.count);
                      ++this.count;

                      return leafletMarker;
                    }
                    // Create a built-in (default) marker image layer
                    else if (symbol.properties.builtinSymbolImage) {
                      let markerIcon = new L.icon({
                        iconUrl: this.owfCommonService.formatPath(symbol.properties.builtinSymbolImage, IM.Path.bSIP),
                        iconAnchor: MapUtil.createAnchorArray(symbol.properties.builtinSymbolImage, symbol.properties.imageAnchorPoint)
                      });
                      return L.marker(latlng, { icon: markerIcon })
                    }
                  },
                  onEachFeature: onEachFeature
                });
                // Add the newly created Leaflet layer to the MapLayerManager, and if it has the selectedInitial field set
                // to true (or it's not given) add it to the Leaflet map. If false, don't show it yet.
                this.mapLayerManager.addLayerItem(data, geoLayer, geoLayerView, geoLayerViewGroup);
                let layerItem: MapLayerItem = this.mapLayerManager.getLayerItem(geoLayer.geoLayerId);
                if (layerItem.isSelectInitial()) {
                  layerItem.initItemLeafletLayerToMainMap(this.mainMap);
                  if (layerItem.getItemSelectBehavior().toUpperCase() === 'SINGLE') {
                    this.mapLayerManager.toggleOffOtherLayersOnMainMap(geoLayer.geoLayerId, this.mainMap,
                      geoLayerViewGroup.geoLayerViewGroupId, 'init');
                  }
                }

                this.mapLayerManager.setLayerOrder();
              }
            }
            // Refresh a map vector layer based on the refreshInterval property in the map config file.
            // Make sure to check if it is a vector layer.
            if (geoLayerView.properties.refreshInterval && geoLayer.layerType.toUpperCase().includes('VECTOR')) {
              var refreshInterval = this.owfCommonService.getRefreshInterval(geoLayerView.geoLayerId);
              var refreshOffset = this.owfCommonService.getRefreshOffset(geoLayerView.geoLayerId, refreshInterval);
              // Confirm the parsing was successful by checking if getRefreshInterval
              // returned a number.
              if (!isNaN(refreshInterval)) {
                this.refreshLayer(refreshOffset, refreshInterval, geoLayer, IM.RefreshType.vector);
              }
            }

            /**
             * Adds event listeners to each feature in the Leaflet layer. 
             * @param feature The feature object and all its properties in the layer.
             * @param layer The reference to the layer object the feature comes from.
             */
            function onEachFeature(feature: any, layer: any): void {
              // If the geoLayerView has its own custom events, use them here
              if (eventHandlers.length > 0) {
                // If the map config file has event handlers, use them
                eventHandlers.forEach((eventHandler: any) => {
                  switch (eventHandler.eventType.toUpperCase()) {
                    case "CLICK":
                      var multipleEventsSet: boolean;
                      var popup: any;

                      for (let value of Object.values(eventHandlers)) {
                        if (typeof value['eventType'] === 'string') {
                          if (value['eventType'].toUpperCase() === 'HOVER') {
                            multipleEventsSet = true;
                          }
                        }
                      }
                      layer.on({
                        // If only click is given for an event, default should be to display all features and show them.
                        mouseover: function (e: any) {
                          if (multipleEventsSet === true) {
                            return;
                          } else {
                            MapUtil.updateFeature(e, geoLayer, geoLayerView);
                          }
                        },
                        mouseout: function (e: any) {
                          if (multipleEventsSet === true) {
                            return;
                          } else {
                            if (!feature.geometry.type.toUpperCase().includes('POLYGON')) {
                              MapUtil.resetFeature(e, geoLayer, geoLayerView, _this.owfCommonService.getGeoMapName());
                            }
                          }
                        },
                        click: ((e: any) => {
                          var divContents = '';
                          var featureIndex: number;
                          var featureProperties: Object = e.target.feature.properties;
                          var popupTemplateId = eventObject[eventHandler.eventType + '-eCP'].id;
                          var layerAttributes = eventObject[eventHandler.eventType + '-eCP'].layerAttributes;
                          var numberOfActions = eventObject[eventHandler.eventType + '-eCP'].actions.length;
                          var chartPackageArray: any[] = [];
                          var firstAction = true;
                          var actionArray: string[] = [];
                          var actionLabelArray: string[] = [];
                          var graphFilePath: string;
                          var TSID_Location: string;
                          var resourcePathArray: string[] = [];
                          var downloadFileNameArray: any[] = [];
                          var windowID: string;

                          if (e.target.getTooltip()) {
                            featureIndex = parseInt(e.target.getTooltip()._content);
                          }

                          // If there is no action OR there is an empty list, just show the HTML in the Leaflet popup
                          if (!eventObject[eventHandler.eventType + '-eCP'].actions ||
                            eventObject[eventHandler.eventType + '-eCP'].actions.length === 0) {
                            divContents = MapUtil.buildPopupHTML(popupTemplateId, null, layerAttributes, featureProperties, null);
                            // Create the Leaflet popup and show on the map with a set size
                            layer.unbindPopup().bindPopup(divContents, {
                              maxHeight: 300,
                              maxWidth: 300
                            });

                            popup = e.target.getPopup();
                            popup.setLatLng(e.latlng).openOn(_this.mainMap);
                            return;
                          }

                          // Iterate over the action array from the popup template file
                          for (let action of eventObject[eventHandler.eventType + '-eCP'].actions) {
                            downloadFileNameArray.push(action.downloadFile);
                            resourcePathArray.push(action.resourcePath);
                            actionLabelArray.push(action.label);
                            actionArray.push(action.action);
                            chartPackageArray.push(action.chartPackage);

                            if (firstAction) {
                              divContents +=
                                MapUtil.buildPopupHTML(popupTemplateId, action, layerAttributes, featureProperties, true);
                              firstAction = false;
                            } else {
                              divContents +=
                                MapUtil.buildPopupHTML(popupTemplateId, action, layerAttributes, featureProperties, false);
                            }

                          }
                          layer.unbindPopup().bindPopup(divContents, {
                            maxHeight: 300,
                            maxWidth: 300
                          });

                          popup = e.target.getPopup();
                          popup.setLatLng(e.latlng).openOn(_this.mainMap);

                          for (let i = 0; i < numberOfActions; i++) {
                            windowID = popupTemplateId + '-' + actionLabelArray[i];
                            L.DomEvent.addListener(L.DomUtil.get(windowID), 'click', function (e: any) {
                              windowID = popupTemplateId + '-' + actionLabelArray[i];
                              // If this button has already been clicked and resides in the windowManager, don't do anything.
                              if (_this.windowManager.windowExists(windowID)) {
                                return;
                              }

                              // Display a plain text file in a Dialog popup.
                              if (actionArray[i].toUpperCase() === 'DISPLAYTEXT') {
                                // Since the popup template file is not replacing any ${properties}, replace the ${property}
                                // for the resourcePath only
                                var resourcePath = MapUtil.obtainPropertiesFromLine(resourcePathArray[i], featureProperties);
                                let fullResourcePath = _this.owfCommonService.buildPath(IM.Path.rP, [resourcePath]);
                                // Add this window ID to the windowManager so a user can't open it more than once.
                                _this.windowManager.addWindow(windowID, WindowType.TEXT);

                                _this.owfCommonService.getPlainText(fullResourcePath, IM.Path.rP).subscribe((text: any) => {
                                  _this.openTextDialog(text, fullResourcePath, windowID);
                                });
                              }
                              // Display a Time Series graph in a Dialog popup
                              else if (actionArray[i].toUpperCase() === 'DISPLAYTIMESERIES') {

                                let fullResourcePath = _this.owfCommonService.buildPath(IM.Path.rP, [resourcePathArray[i]]);
                                // Add this window ID to the windowManager so a user can't open it more than once.
                                _this.windowManager.addWindow(windowID, WindowType.TSGRAPH);

                                _this.owfCommonService.getJSONData(fullResourcePath, IM.Path.rP, _this.mapID)
                                  .subscribe((graphTemplateObject: Object) => {
                                    // Replaces all ${} property notations with the correct feature in the TSTool graph template object
                                    MapUtil.replaceProperties(graphTemplateObject, featureProperties);

                                    if (graphTemplateObject['product']['subProducts'][0]['data'][0]['properties'].TSID) {
                                      let TSID: string = graphTemplateObject['product']['subProducts'][0]['data'][0]['properties'].TSID;
                                      // Split on the ~ and set the actual file path we want to use so our dialog-content component
                                      // can determine what kind of file was given.
                                      TSID_Location = TSID.split('~')[0];
                                      // If the TSID has one tilde (~), set the path using the correct index compared to if the 
                                      // TSID contains two tildes.
                                      if (TSID.split('~').length === 2) {
                                        graphFilePath = TSID.split("~")[1];
                                      } else if (TSID.split('~').length === 3) {
                                        graphFilePath = TSID.split("~")[2];
                                      }
                                    } else console.error('The TSID has not been set in the graph template file');

                                    _this.openTSGraphDialog(graphTemplateObject, graphFilePath, TSID_Location, chartPackageArray[i],
                                      featureProperties, downloadFileNameArray[i] ? downloadFileNameArray[i] : null, windowID);
                                  });
                              }
                              // Display a Heatmap Dialog.
                              else if (actionArray[i].toUpperCase() === 'DISPLAYHEATMAP') {
                                let fullResourcePath = _this.owfCommonService.buildPath(IM.Path.rP, [resourcePathArray[i]]);

                                _this.owfCommonService.getJSONData(fullResourcePath).subscribe((graphTemplateObject: any) => {
                                  // Replaces all ${} property notations with the correct feature in the TSTool graph template object
                                  MapUtil.replaceProperties(graphTemplateObject, featureProperties);

                                  if (graphTemplateObject['product']['subProducts'][0]['data'][0]['properties'].TSID) {
                                    let TSID: string = graphTemplateObject['product']['subProducts'][0]['data'][0]['properties'].TSID;
                                    // Split on the ~ and set the actual file path we want to use so our dialog-content
                                    // component can determine what kind of file was given.
                                    TSID_Location = TSID.split('~')[0];
                                    // If the TSID has one tilde (~), set the path using the correct index compared to
                                    // if the TSID contains two tildes.
                                    if (TSID.split('~').length === 2) {
                                      graphFilePath = TSID.split("~")[1];
                                    } else if (TSID.split('~').length === 3) {
                                      graphFilePath = TSID.split("~")[2];
                                    }
                                  } else console.error('The TSID has not been set in the graph template file');
                                  _this.openHeatmapDialog(geoLayer, graphTemplateObject, graphFilePath);
                                });
                                
                              } else if (actionArray[i].toUpperCase() === 'DISPLAYD3VIZ') {
                                var fullVizPath = _this.owfCommonService.buildPath(IM.Path.d3P, [resourcePathArray[i]])
                                _this.owfCommonService.getJSONData(fullVizPath).subscribe((d3Prop: IM.D3Prop) => {
                                  _this.openD3VizDialog(geoLayer, d3Prop);
                                });
                              }
                              // Display a Map Feature Gallery Dialog.
                              else if (actionArray[i].toUpperCase() === 'DISPLAYIMAGEGALLERY') {
                                _this.openImageGalleryDialog(geoLayer, feature, featureIndex, resourcePathArray[i],
                                  geoLayerViewGroup.geoLayerViews[i], eventObject);
                              }
                              // Display a Gapminder Visualization
                              else if (actionArray[i].toUpperCase() === 'DISPLAYGAPMINDER') {
                                _this.openGapminderDialog(geoLayer.geoLayerId, resourcePathArray[i]);
                              }
                              // If the attribute is neither displayTimeSeries nor displayText
                              else {
                                console.error(
                                  'Action attribute is not supplied or incorrect. Please specify a supported action:\n' +
                                  '  displayText\n' +
                                  '  displayTimeSeries\n' +
                                  '  displayHeatmap\n' +
                                  '  displayD3Viz\n' +
                                  '  displayImageGallery'
                                );
                              }
                            });
                          }
                          // Not needed?
                          layer.getPopup().on('remove', function () {
                            for (let i = 0; i < numberOfActions; i++) {
                              L.DomEvent.removeListener(L.DomUtil.get(popupTemplateId + '-' + actionLabelArray[i], 'click', function (e: any) { }));
                            }
                          });
                        })
                      });
                      break;
                    case "HOVER":
                      var multipleEventsSet: boolean;

                      for (let value of Object.values(eventHandlers)) {
                        if (typeof value.eventType === 'string') {
                          if (value.eventType.toUpperCase() === 'CLICK') {
                            multipleEventsSet = true;
                          }
                        }
                      }
                      layer.on({
                        // If a hover event is given, default should be to display all features.
                        mouseover: function (e: any) {
                          MapUtil.updateFeature(e, geoLayer, geoLayerView, eventObject['hover-eCP'].layerAttributes);
                        },
                        mouseout: function (e: any) {
                          MapUtil.resetFeature(e, geoLayer, geoLayerView, _this.owfCommonService.getGeoMapName());
                        },
                        click: ((e: any) => {
                          if (multipleEventsSet === true) {
                            return;
                          } else {
                            var divContents = '';
                            var featureProperties: Object = e.target.feature.properties;
                            var popupTemplateId = eventObject[eventHandler.eventType + '-eCP'].id;
                            var layerAttributes = eventObject[eventHandler.eventType + '-eCP'].layerAttributes;
                            // If there is no action, just show the HTML in the Leaflet popup
                            if (!eventObject[eventHandler.eventType + '-eCP'].actions) {
                              // Add the last optional argument hoverEvent boolean telling the buildPopupHTML function that the hover
                              // event is the alone event in the popup config file, and all features should be shown
                              divContents = MapUtil.buildPopupHTML(popupTemplateId, null, layerAttributes, featureProperties, null, true);
                              // Create the Leaflet popup and show on the map with a set size
                              layer.unbindPopup().bindPopup(divContents, {
                                maxHeight: 300,
                                maxWidth: 300
                              });

                              popup = e.target.getPopup();
                              popup.setLatLng(e.latlng).openOn(_this.mainMap);
                              return;
                            }
                          }
                        })
                      });
                      break;
                    // If built in eventTypes are not found in the eventType property, (e.g. hover, click) then default to only
                    // having mouseover and mouseout showing all features in the Control div popup.
                    default:
                      layer.on({
                        mouseover: function (e: any) {
                          MapUtil.updateFeature(e, geoLayer, geoLayerView);
                        },
                        mouseout: function (e: any) {
                          MapUtil.resetFeature(e, geoLayer, geoLayerView, _this.owfCommonService.getGeoMapName());
                        },
                        click: ((e: any) => {

                          var divContents = '';
                          var featureProperties: Object = e.target.feature.properties;
                          var popupTemplateId = eventObject[eventHandler.eventType + '-eCP'].id;
                          var layerAttributes = eventObject[eventHandler.eventType + '-eCP'].layerAttributes;
                          // If there is no action, just show the HTML in the Leaflet popup
                          if (!eventObject[eventHandler.eventType + '-eCP'].actions) {
                            divContents = MapUtil.buildPopupHTML(popupTemplateId, null, layerAttributes, featureProperties, null);
                            // Create the Leaflet popup and show on the map with a set size
                            layer.unbindPopup().bindPopup(divContents, {
                              maxHeight: 300,
                              maxWidth: 300
                            });

                            popup = e.target.getPopup();
                            popup.setLatLng(e.latlng).openOn(_this.mainMap);
                            return;
                          }
                        })
                      });
                  }
                });
              } else {
                // If the map config does NOT have any event handlers at all, use a default
                layer.on({
                  mouseover: function (e: any) {
                    MapUtil.updateFeature(e, geoLayer, geoLayerView);
                  },
                  mouseout: function (e: any) {
                    MapUtil.resetFeature(e, geoLayer, geoLayerView, _this.owfCommonService.getGeoMapName());
                  },
                  click: ((e: any) => {
                    // Create the default HTML property popup.
                    var divContents = MapUtil.buildDefaultDivContentString(e.target.feature.properties);
                    // Show the popup on the map. It must be unbound first, or else will only show on the first click.
                    layer.unbindPopup().bindPopup(divContents, {
                      maxHeight: 300,
                      maxWidth: 300
                    });

                    var popup = e.target.getPopup();
                    popup.setLatLng(e.latlng).openOn(_this.mainMap);
                  })
                });
              }
            }

          });
          this.badPath = false;
          this.serverUnavailable = false;

          // // Shows rain radar worldwide.
          // // var corner1 = L.latLng(36.99908337779402, -109.04522295278505),
          // // corner2 = L.latLng(41.002358615428534, -102.05171697502318),
          // // bounds = L.latLngBounds(corner1, corner2);

          // var radar = L.tileLayer('https://tilecache.rainviewer.com/v2/radar/1629323400/256/{z}/{x}/{y}/2/1_1.png',
          //   {
          //     // bounds: bounds
          //   }).addTo(this.mainMap);
          // // To have the tileLayer clear all tiles and request them again, call the following.
          // const delay = timer(15000, 60000);

          // const test = delay.subscribe(() => {
          //   radar.redraw();
          // });
        }
      }
    });
    // Retrieve the expandedInitial and set to collapse if false or not present. If true, show all background layers
    if (this.owfCommonService.getBackgroundExpandedInitial() === false) {
      setTimeout(() => {
        document.getElementById('collapse-background').setAttribute('class', 'collapse');
      });
    }
    // If the sidebar has not already been initialized once then do so.
    if (this.sidebarInitialized == false) { this.createSidebar(); }
  } // END OF MAP BUILDING.

  public checkIfHighlighted(geoLayerId: string): boolean {
    return;
  }

  /**
  * Removes all highlighted layers from the map.
  */
  public clearAllSelections(): void {
    this.mainMap.eachLayer((layer: any) => {
      if (layer.options.fillColor === '#ffff01') {
        this.mainMap.removeLayer(layer);
      }
    });
  }

  /**
  * Determine what layer the user clicked the clear button from, and rest the styling for the highlighted features
  * @param geoLayerId The geoLayerId to determine which layer style should be reset
  */
  public clearSelections(geoLayerId: string): void {
    var layerItem: MapLayerItem = this.mapLayerManager.getLayerItem(geoLayerId);
    layerItem.removeAllSelectedLayers(this.mainMap);
  }

  /**
  * Asynchronously creates a raster layer on the Leaflet map.
  * @param geoLayer The geoLayer object from the map configuration file
  * @param symbol The Symbol data object from the geoLayerView
  */
  private createRasterLayer(geoLayer: IM.GeoLayer, symbol: IM.GeoLayerSymbol, geoLayerView: IM.GeoLayerView,
                            geoLayerViewGroup: IM.GeoLayerViewGroup, eventObject?: any): void {
    if (!symbol) {
      console.warn('The geoLayerSymbol for geoLayerId: "' + geoLayerView.geoLayerId + '" and name: "' + geoLayerView.name +
        '" does not exist, and should be added to the geoLayerView for legend styling. Displaying the default.');
    }
    var _this = this;

    // Uses the fetch API with the given path to get the tiff file in assets to create the raster layer.
    fetch(this.owfCommonService.buildPath(IM.Path.raP, [geoLayer.sourcePath]))
    .then((response: any) => response.arrayBuffer())
    .then((arrayBuffer: any) => {
      parse_georaster(arrayBuffer).then((georaster: any) => {
        // The classificationFile attribute exists in the map configuration file, so use that file path for Papaparse.
        if (symbol && symbol.properties.classificationFile) {
          this.categorizedLayerColors[geoLayer.geoLayerId] = [];

          Papa.parse(this.owfCommonService.buildPath(IM.Path.cP, [symbol.properties.classificationFile]), {
            delimiter: ",",
            download: true,
            comments: "#",
            skipEmptyLines: true,
            header: true,
            complete: (result: any, file: any) => {

              if (symbol.classificationType.toUpperCase() === 'CATEGORIZED') {
                // Populate the categorizedLayerColors object with the results from the classification file if the geoLayerSymbol
                // attribute classificationType is Categorized.
                this.assignCategorizedFileColor(result.data, geoLayer.geoLayerId);
              } else if (symbol.classificationType.toUpperCase() === 'GRADUATED') {
                // Populate the graduatedLayerColors array with the results from the classification file if the geoLayerSymbol
                // attribute classificationType is Graduated.
                this.assignGraduatedFileColor(result.data, geoLayer.geoLayerId);
              }

              // Create a single band Raster layer.
              if (georaster.numberOfRasters === 1) {
                var geoRasterLayer = MapUtil.createSingleBandRaster(georaster, result, symbol)
              }
              // If there are multiple bands in the raster, take care of them accordingly.
              else {
                var geoRasterLayer = MapUtil.createMultiBandRaster(georaster, geoLayerView, result, symbol);
              }

              // Add the newly created Leaflet layer to the MapLayerManager, and if it has the selectedInitial field set
              // to true (or it's not given) add it to the Leaflet map. If false, don't show it yet.
              this.mapLayerManager.addLayerItem(geoRasterLayer, geoLayer, geoLayerView, geoLayerViewGroup, true);
              let layerItem: MapLayerItem = this.mapLayerManager.getLayerItem(geoLayer.geoLayerId);
              if (layerItem.isSelectInitial()) {
                layerItem.initItemLeafletLayerToMainMap(this.mainMap);
                if (layerItem.getItemSelectBehavior().toUpperCase() === 'SINGLE') {
                  this.mapLayerManager.toggleOffOtherLayersOnMainMap(geoLayer.geoLayerId, this.mainMap,
                    geoLayerViewGroup.geoLayerViewGroupId, 'init');
                }
              }
              // With the help of GeoBlaze, use Leaflet Map Events for clicking and/or hovering over a raster layer.
              const blaze = geoblaze.load(this.owfCommonService.buildPath(IM.Path.raP, [geoLayer.sourcePath]))
              .then((georaster: any) => {
                let layerItem = _this.mapLayerManager.getLayerItem(geoLayerView.geoLayerId);

                Object.keys(eventObject).forEach((key: any) => {
                  if (key === 'hover-eCP') {
                    let div = L.DomUtil.get('title-card');
                    var originalDivContents: string = div.innerHTML;

                    _this.mainMap.on('mousemove', (e: any) => {
                      MapUtil.displayMultipleHTMLRasterCells(e, georaster, geoLayerView, originalDivContents,
                        layerItem, symbol);

                    });
                  }
                  // Click events on a raster layer have not been implemented yet.
                  else if (key === 'click-eCP') {
                    // _this.mainMap.on('click', (e: any) => {
                    //   const latlng = [e.latlng.lng, e.latlng.lat];
                    //   const results = geoblaze.identify(georaster, latlng);
                    //   _this.mainMap.openPopup('<b>Raster:</b> ' +
                    //                           geoLayerView.name + '<br>' +
                    //                           '<b>Cell Value:</b> ' +
                    //                           results[0],
                    //                           [e.latlng.lat, e.latlng.lng])
                    // });
                  }
                })
              });
            }
          });
        }
        // No classificationFile attribute was given in the config file, so just create a default raster layer.
        else {
          var geoRasterLayer = new GeoRasterLayer({
            // Create a custom drawing scheme for the raster layer. This might overwrite pixelValuesToColorFn()
            customDrawFunction: ({ context, values, x, y, width, height }) => {
              if (values[0] === 255 || values[0] === 0) {
                context.fillStyle = `rgba(${values[0]}, ${values[0]}, ${values[0]}, 0)`;
              } else {
                context.fillStyle = `rgba(${values[0]}, ${values[0]}, ${values[0]}, 0.7)`;
              }
              context.fillRect(x, y, width, height);
            },
            debugLevel: 2,
            georaster: georaster,
            opacity: 0.7
          });
          // If the CRS given is not 4326, log the error and let the user know the layer won't be shown.
          if (geoRasterLayer.projection !== 4326) {
            console.error('InfoMapper requires raster layers to use EPSG:4326 CRS. Layer \'' + geoLayerView.geoLayerId +
              '\' is using EPSG:' + geoRasterLayer.projection + '. Layer will not be displayed on map.');
          }
          // Add the newly created Leaflet layer to the MapLayerManager, and if
          // it has the selectedInitial field set to true (or it's not given) add
          // it to the Leaflet map. If false, don't show it yet.
          this.mapLayerManager.addLayerItem(geoRasterLayer, geoLayer, geoLayerView, geoLayerViewGroup, true);
          let layerItem: MapLayerItem = this.mapLayerManager.getLayerItem(geoLayer.geoLayerId);
          if (layerItem.isSelectInitial()) {
            layerItem.initItemLeafletLayerToMainMap(this.mainMap);
            if (layerItem.getItemSelectBehavior().toUpperCase() === 'SINGLE') {
              this.mapLayerManager.toggleOffOtherLayersOnMainMap(geoLayer.geoLayerId, this.mainMap,
                geoLayerViewGroup.geoLayerViewGroupId, 'init');
            }
          }
        }
      });
    });
    // Check to see if the layer needs to be refreshed. Don't need to check if it's a raster
    // layer, it has to be to get to this code.
    if (geoLayerView.properties.refreshInterval) {
      var refreshInterval = this.owfCommonService.getRefreshInterval(geoLayerView.geoLayerId);
      var refreshOffset = this.owfCommonService.getRefreshOffset(geoLayerView.geoLayerId, refreshInterval);
      // Check if the parsing was successful. 
      if (isNaN(refreshInterval)) {
      } else {
        this.refreshLayer(refreshOffset, refreshInterval, geoLayer,
                          IM.RefreshType.raster, geoLayerView, symbol);
      }

    }
  }

  /**
  * Creates the side bar on the left side of the map using the third party npm package `leaflet-sidebar-v2`
  */
  private createSidebar(): void {
    this.sidebarInitialized = true;
    // Create the sidebar instance and add it to the map. 
    let sidebar = L.control.sidebar({
      container: 'sidebar'
    }).addTo(this.mainMap).open('home');

    // Add panels dynamically to the sidebar
    // sidebar.addPanel({
    //     id:   'testPane',
    //     tab:  '<i class="fa fa-gear"></i>',
    //     title: 'JS API',
    //     pane: '<div class="leaflet-sidebar-pane" id="home"></div>'
    // });    
    this.addInfoToSidebar();
  }

  /**
  * 
  */
  public findFromAddress() {
    var testAddress = 'https://api.geocod.io/v1.6/geocode?q=1109+N+Highland+St%2c+Arlington+VA&api_key=e794ffb42737727f9904673702993bd96707bf6';
    this.owfCommonService.getJSONData(testAddress).subscribe((address: any) => {
    });
  }

  /**
  * @returns the value from the badPath object with the matching geoLayerId as the key
  * @param geoLayerId The geoLayerId of the layer
  */
  public getBadPath(geoLayerId: string): string {
    return this.owfCommonService.getBadPath(geoLayerId);
  }

  /**
  * @returns the geometryType of the current geoLayer to determine what shape should be drawn in the legend
  * @param geoLayerId The id of the current geoLayer
  */
  public getGeometryType(geoLayerId: string): any {
    return this.owfCommonService.getGeometryType(geoLayerId);
  }

  /**
   * 
   */
  private initMapSettings(standalone?: boolean): void {
    let fullMapConfigPath = this.owfCommonService.getAppPath() +
    this.owfCommonService.getFullMapConfigPath(this.mapID, standalone);

    this.mapConfigSub$ = this.owfCommonService.getJSONData(fullMapConfigPath, IM.Path.fMCP, this.mapID)
    .subscribe((mapConfig: any) => {
      // this.owfCommonService.setGeoMapID(mapConfig.geoMaps[0].geoMapId);
      // console.log(this.mapManager.mapAlreadyCreated(this.owfCommonService.getGeoMapID()));

      // Set the configuration file class variable for the map service.
      this.owfCommonService.setMapConfig(mapConfig);
      // Once the mapConfig object is retrieved and set, set the order in which they should be displayed.
      this.owfCommonService.setMapConfigLayerOrder();
      // Add components to the sidebar.
      this.addLayerToSidebar(mapConfig);
      // Create the map.
      this.buildMap();
    });
  }

  /**
  * @returns a boolean on whether the layer on the Leaflet map has a bad path so a red triangle is displayed
  * on the layer's side bar legend
  */
  public isBadPath(geoLayerId: string): boolean {
    return this.owfCommonService.isBadPath(geoLayerId);
  }

  /**
  * @returns a boolean on whether the layer on the Leaflet map's service URL is unavailable
  * @param geoLayerId The geoLayerId for the layer
  */
  public isServerUnavailable(geoLayerId: string): boolean {
    return this.owfCommonService.isServerUnavailable(geoLayerId);
  }

  private startCounter(): void {
    var test = interval(1000).subscribe(() => {
      this.elapsedSeconds += 1;
    });
  }

  /**
  * This function is called on initialization of the map component, after the constructor.
  */
  public ngAfterViewInit() {

    this.startCounter();
    // When the parameters in the URL are changed the map will refresh and load according to new configuration data.
    this.routeSub$ = this.route.params.subscribe(() => {
      this.resetMapVariables();

      this.mapID = this.route.snapshot.paramMap.get('id');

      // Standalone Map.
      if (this.appConfig) {
        this.owfCommonService.getJSONData(this.appConfig).subscribe((appConfig: any) => {
          this.owfCommonService.setAppConfig(appConfig);
          this.initMapSettings(true);
        });
      } else if (!this.appConfig) {
        // TODO: jpkeahey 2020.05.13 - This shows how the map config path isn't
        // set on a hard refresh because of async issues. Fix has been found and
        // now just needs to be implemented. Follow the APP_INITIALIZER token found
        // in the SNODAS app to read all static files before the app initializes,
        // therefore all info will have already been received.
        setTimeout(() => {
          this.initMapSettings();
        }, 500);
      } else {
        console.error('Error!');
      }
    });
  }

  // public ngAfterViewInit() {
  //   // When the parameters in the URL are changed the map will refresh and load according to new configuration data.
  //   this.routeSub$ = this.activatedRoute.params.subscribe(() => {

  //     this.resetMapVariables();

  //     this.mapID = this.activatedRoute.snapshot.paramMap.get('id');
  //     if (this.mapID === null) return;

  //     // Standalone Map.
  //     if (this.appConfig) {
  //       this.owfCommonService.getJSONData(this.appConfig).subscribe((appConfig: any) => {
  //         this.owfCommonService.setAppConfig(appConfig);
  //         this.initMapSettings(true);
  //       });
  //     } else if (!this.appConfig) {
  //       // TODO: jpkeahey 2020.05.13 - This shows how the map config path isn't
  //       // set on a hard refresh because of async issues. Fix has been found and
  //       // now just needs to be implemented. Follow the APP_INITIALIZER token found
  //       // in the SNODAS app to read all static files before the app initializes,
  //       // therefore all info will have already been received.
  //       setTimeout(() => {
  //         this.initMapSettings();
  //       }, 500);
  //     } else {
  //       console.error('Error!');
  //     }
  //   });
  // }

  /**
  * Called once, before this Map Component instance is destroyed.
  */
  public ngOnDestroy(): void {
    // Unsubscribe from all subscriptions that occurred in the Map Component.
    this.routeSub$.unsubscribe();
    this.forkJoinSub$.unsubscribe();
    this.refreshSub$.unsubscribe();
    this.mapConfigSub$.unsubscribe();
    // If a popup is open on the map and a Content Page button is clicked on, then
    // this Map Component will be destroyed. Instead of resetting the map variables,
    // close the popup before the map is destroyed.
    this.mainMap.closePopup();
    // Destroy the map and all attached event listeners.
    this.mainMap.remove();
  }

  /**
   * Opens a D3 visualization Dialog with the necessary configuration data.
   * @param geoLayer The layer geoLayer object.
   * @param d3Prop The D3 visualization's property object from the config file.
   */
  public openD3VizDialog(geoLayer: IM.GeoLayer, d3Prop: IM.D3Prop): void {
    var windowID = geoLayer.geoLayerId + '-dialog-d3-viz';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        d3Prop: d3Prop,
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
  * Opens an attribute (data) table Dialog with the necessary configuration data.
  * @param geoLayerId The geoLayerView's geoLayerId to be matched so the correct features are displayed
  */
  public openDataTableDialog(geoLayerView: any): void {
    var windowID = geoLayerView.geoLayerId + '-dialog-data-table';
    if (this.windowManager.windowExists(windowID) || this.allFeatures[geoLayerView.geoLayerId] === undefined) {
      return;
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      allFeatures: this.allFeatures[geoLayerView.geoLayerId],
      geoLayer: this.owfCommonService.getGeoLayerFromId(geoLayerView.geoLayerId),
      geoLayerView: geoLayerView,
      geoMapName: this.owfCommonService.getGeoMapName(),
      layerClassificationInfo: this.layerClassificationInfo,
      mapConfigPath: this.owfCommonService.getMapConfigPath(),
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
  * When the info button by the side bar slider is clicked, it will either show a popup or separate tab containing the documentation
  * for the selected geoLayerViewGroup or geoLayerView.
  * @param docPath The string representing the path to the documentation
  * @param 
  */
  public openDocDialog(docPath: string, geoId: string, geoName: string): void {
    var windowID = geoId + '-dialog-doc';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    var text: boolean, markdown: boolean, html: boolean;
    // Set the type of display the Mat Dialog will show
    if (docPath.includes('.txt')) text = true;
    else if (docPath.includes('.md')) markdown = true;
    else if (docPath.includes('.html')) html = true;

    this.owfCommonService.getPlainText(this.owfCommonService.buildPath(IM.Path.dP, [docPath]), IM.Path.dP)
      .pipe(take(1))
      .subscribe((doc: any) => {

        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
          doc: doc,
          docPath: docPath,
          docText: text,
          docMarkdown: markdown,
          docHtml: html,
          fullMarkdownPath: this.owfCommonService.getFullMarkdownPath(),
          geoId: geoId,
          geoName: geoName,
          mapConfigPath: this.owfCommonService.getMapConfigPath(),
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
  * When a Gapminder button is clicked from the Leaflet popup, create the Gapminder Dialog and sent it the data it needs.
  * @param resourcePath The resourcePath string representing the absolute or relative path to the 
  */
  private openGapminderDialog(geoLayerId: string, resourcePath: string): any {
    // var windowID = geoLayerId + '-' + resourcePath;
    // // if (this.windowManager.windowExists(windowID)) {
    // //   return;
    // // }
    // let fullResourcePath = this.owfCommonService.buildPath(IM.Path.rP, [resourcePath]);
    // const dialogConfig = new MatDialogConfig();
    // dialogConfig.data = {
    //   windowID: windowID,
    //   resourcePath: fullResourcePath
    // }

    // const dialogRef: MatDialogRef<DialogGapminderComponent, any> = this.dialog.open(DialogGapminderComponent, {
    //   data: dialogConfig,
    //   hasBackdrop: false,
    //   panelClass: ['custom-dialog-container', 'mat-elevation-z24'],
    //   height: "900px",
    //   width: "910px",
    //   minHeight: "900px",
    //   minWidth: "910px",
    //   maxHeight: "900px",
    //   maxWidth: "910px"
    // });

    // // this.windowManager.addWindow(windowID, WindowType.GAP);
  }

  /**
   * 
   * @param geoLayer The geoLayer object from the map configuration file.
   */
  private openHeatmapDialog(geoLayer: any, graphTemplateFile: string, graphFilePath: string): void {

    var windowID = geoLayer.geoLayerId + '-dialog-heatmap';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      geoLayer: geoLayer,
      graphFilePath: graphFilePath,
      graphTemplateObject: graphTemplateFile,
      windowID: windowID
    }
    const dialogRef: MatDialogRef<DialogHeatmapComponent, any> = this.dialog.open(DialogHeatmapComponent, {
      data: dialogConfig,
      hasBackdrop: false,
      panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
      height: "750px",
      width: "910px",
      minHeight: "425px",
      minWidth: "675px",
      maxHeight: "70vh",
      maxWidth: "80vw"
    });

    this.windowManager.addWindow(windowID, WindowType.HEAT);
  }

  /**
  * Gets data asynchronously for creating and opening a Material Dialog that displays an Image Gallery. 
  * @param dialog The reference to the MatDialog object.
  * @param geoLayer The geoLayer object from the map configuration file.
  * @param feature The feature object containing this feature's properties and values.
  * @param featureIndex A number representing the index of the image clicked on.
  * @param resourcePath A string representation of the path to the CSV configuration file for the Image Gallery.
  */
  private openImageGalleryDialog(geoLayer: any, feature: any, featureIndex: number, resourcePath: string,
    geoLayerView: any, eventObject: any): void {

    var windowID = geoLayer.geoLayerId + '-dialog-gallery';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    let fullResourcePath = this.owfCommonService.buildPath(IM.Path.rP, [resourcePath]);

    Papa.parse(fullResourcePath, {
      delimiter: ",",
      download: true,
      comments: "#",
      skipEmptyLines: true,
      header: true,
      complete: (result: any, file: any) => {

        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
          allFeatures: this.allFeatures[geoLayer.geoLayerId],
          eventActions: this.eventActions,
          eventObject: eventObject,
          feature: feature,
          featureIndex: featureIndex,
          geoLayerId: geoLayer.geoLayerId,
          geoLayerView: geoLayerView,
          mainMap: this.mainMap,
          mapConfigPath: this.owfCommonService.getMapConfigPath(),
          papaResult: result.data
        }
        const dialogRef: MatDialogRef<DialogGalleryComponent, any> = this.dialog.open(DialogGalleryComponent, {
          data: dialogConfig,
          hasBackdrop: false,
          panelClass: ['custom-dialog-container', 'mat-elevation-z24'],
          height: "650px",
          width: "910px",
          minHeight: "450px",
          minWidth: "650px",
          maxHeight: "700px",
          maxWidth: "1000px"
        });

        this.windowManager.addWindow(windowID, WindowType.GAL);
      }
    });

  }

  /**
  * Retrieves data asynchronously and creates an Image Gallery Dialog opened from the Leaflet side bar kebab menu.
  * @param geoLayer The geoLayer object from the selected layer.
  * @param geoLayerView The geoLayerView object from the selected layer.
  */
  public openImageGalleryDialogFromKebab(geoLayerId: any, geoLayerView: any): void {
    var windowID = geoLayerId + '-dialog-gallery';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    var resourcePath = this.eventActions[geoLayerView.properties.imageGalleryEventActionId].resourcePath;
    let fullResourcePath = this.owfCommonService.buildPath(IM.Path.rP, [resourcePath]);

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
          mapConfigPath: this.owfCommonService.getMapConfigPath(),
          papaResult: result.data
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
  * Creates the data dialog config object, adds it to the dialog ref object, and sets all other necessary options
  * to create and open the layer properties dialog
  */
  public openPropertyDialog(geoLayerId: string, geoLayerViewName: any): void {

    var windowID = geoLayerId + '-dialog-properties';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    let layerItem: MapLayerItem = this.mapLayerManager.getLayerItem(geoLayerId);
    if (layerItem === null) return;

    // Create a MatDialogConfig object to pass to the DialogPropertiesComponent for the graph that will be shown
    const dialogConfig = new MatDialogConfig();

    if (layerItem.isRasterLayer()) {
      dialogConfig.data = {
        geoLayer: this.owfCommonService.getGeoLayerFromId(geoLayerId),
        geoLayerId: geoLayerId,
        geoLayerViewName: geoLayerViewName,
        layerProperties: [],
        mapConfigPath: this.owfCommonService.getMapConfigPath()
      }
    } else {
      dialogConfig.data = {
        geoLayer: this.owfCommonService.getGeoLayerFromId(geoLayerId),
        geoLayerId: geoLayerId,
        geoLayerViewName: geoLayerViewName,
        layerProperties: Object.keys(this.allFeatures[geoLayerId].features[0].properties),
        mapConfigPath: this.owfCommonService.getMapConfigPath()
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
      // vh = view height = 1% of the browser's height, so the max height will be 90% of the browser's height
      maxHeight: "90vh",
      // vw = view width = 1% of the browser's width, so the max width will be 90% of the browser's width
      maxWidth: "90vw"
    });

    this.windowManager.addWindow(windowID, WindowType.TEXT);
  }

  /**
  * Creates the Dialog object to show the graph in and passes the info needed for it.
  * @param dialog The dialog object needed to create the Dialog popup
  * @param graphTemplateObject The template config object of the current graph being shown
  * @param graphFilePath The file path to the current graph that needs to be read
  */
  private openTSGraphDialog(graphTemplateObject: any, graphFilePath: string, TSID_Location: string,
    chartPackage: string, featureProperties: any, downloadFileName?: string, windowID?: string): void {

    // Create a MatDialogConfig object to pass to the DialogTSGraphComponent for the graph that will be shown
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      windowID: windowID,
      chartPackage: chartPackage,
      featureProperties: featureProperties,
      graphTemplate: graphTemplateObject,
      graphFilePath: graphFilePath,
      mapConfigPath: this.owfCommonService.getMapConfigPath(),
      // This cool piece of code uses quite a bit of syntactic sugar. It dynamically sets the saveFile based on the
      // condition that saveFile is defined, using the spread operator. More information was found here:
      // https://medium.com/@oprearocks/what-do-the-three-dots-mean-in-javascript-bc5749439c9a
      ...(downloadFileName && { downloadFileName: downloadFileName }),
      TSID_Location: TSID_Location
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

  /**
  * Creates a Dialog object to show a plain text file and passes the info needed for it.
  * @param dialog The dialog object needed to create the Dialog popup
  * @param text The text retrieved from the text file to display in the Dialog Content popup
  * @param resourcePath The path to the text file so the file name can be extracted in the dialog-text component
  * @param windowID A string representing the button ID of the button clicked to open this dialog.
  */
  private openTextDialog(text: any, resourcePath: string, windowID: string): void {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      windowID: windowID,
      mapConfigPath: this.owfCommonService.getMapConfigPath(),
      resourcePath: resourcePath,
      text: text
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
  }

  /**
   * Creates the rxjs timer with the delay between refreshes for a given layer.
   * @param refreshInterval The number in seconds to wait for each layer refresh.
   * @param geoLayer The geoLayer object from the map configuration file.
   */
  private refreshLayer(refreshOffset: number, refreshInterval: number, geoLayer: IM.GeoLayer,
                        refreshType: IM.RefreshType, geoLayerView?: IM.GeoLayerView, symbol?: IM.GeoLayerSymbol,
                        bgLayer?: any): void {
    // Wait the refreshInterval, then keep waiting by the refreshInterval from then on.
    const delay = timer(refreshOffset, refreshInterval);
    // Adds each refresh subscription after the first as child subscriptions
    // (in case of multiple refreshing layers), so when unsubscribing occurs
    // at component destruction, all are unsubscribed from.
    this.refreshSub$.add(delay.subscribe(() => {
      // Update the MatTooltip date display string on the sidebar geoLayerView name.
      this.lastRefresh[geoLayer.geoLayerId] = new Date(Date.now()).toTimeString().split(" ")[0];
      // Vector layer refresh.
      if (refreshType === IM.RefreshType.vector) {
        
        this.owfCommonService.getJSONData(
          this.owfCommonService.buildPath(IM.Path.gLGJP, [geoLayer.sourcePath])
        ).subscribe((geoJsonData: any) => {

          // Use the Map Layer Manager to remove all layers from the Leaflet layer, and then add the new
          // data back. This way, the layer will still be known to the manager.
          this.mapLayerManager.getLayerItem(geoLayer.geoLayerId).getItemLeafletLayer().clearLayers();
          this.mapLayerManager.getLayerItem(geoLayer.geoLayerId).getItemLeafletLayer().addData(geoJsonData);
          // Reset the layer order.
          this.mapLayerManager.setLayerOrder();
  
          this.elapsedSeconds = 0;
        });
      }
      // Raster layer refresh.
      else if (refreshType === IM.RefreshType.raster) {
        // First remove the raster layer.
        this.mapLayerManager.getLayerItem(geoLayer.geoLayerId).getItemLeafletLayer().remove();
        
        // Uses the fetch API with the given path to get the tiff file in assets to create the raster layer.
        fetch(this.owfCommonService.buildPath(IM.Path.raP, [geoLayer.sourcePath]))
        .then((response: any) => response.arrayBuffer())
        .then((arrayBuffer: any) => {
          parse_georaster(arrayBuffer).then((georaster: any) => {
            // The classificationFile attribute exists in the map configuration file, so use that file path for Papaparse.
            if (symbol && symbol.properties.classificationFile) {
              this.categorizedLayerColors[geoLayer.geoLayerId] = [];

              Papa.parse(this.owfCommonService.buildPath(IM.Path.cP, [symbol.properties.classificationFile]), {
                delimiter: ",",
                download: true,
                comments: "#",
                skipEmptyLines: true,
                header: true,
                complete: (result: any, file: any) => {

                  if (symbol.classificationType.toUpperCase() === 'CATEGORIZED') {
                    // Populate the categorizedLayerColors object with the results from the classification file if the geoLayerSymbol
                    // attribute classificationType is Categorized.
                    this.assignCategorizedFileColor(result.data, geoLayer.geoLayerId);
                  } else if (symbol.classificationType.toUpperCase() === 'GRADUATED') {
                    // Populate the graduatedLayerColors array with the results from the classification file if the geoLayerSymbol
                    // attribute classificationType is Graduated.
                    this.assignGraduatedFileColor(result.data, geoLayer.geoLayerId);
                  }

                  // Create a single band Raster layer.
                  if (georaster.numberOfRasters === 1) {
                    var geoRasterLayer = MapUtil.createSingleBandRaster(georaster, result, symbol)
                  }
                  // If there are multiple bands in the raster, take care of them accordingly.
                  else {
                    var geoRasterLayer = MapUtil.createMultiBandRaster(georaster, geoLayerView, result, symbol);
                  }
                  this.mapLayerManager.getLayerItem(geoLayer.geoLayerId).addLeafletLayer(geoRasterLayer, this.mainMap);
                }
              });
            }
            // No classificationFile attribute was given in the config file, so just create a default raster layer.
            else {
              var geoRasterLayer = new GeoRasterLayer({
                // Create a custom drawing scheme for the raster layer. This might overwrite pixelValuesToColorFn()
                customDrawFunction: ({ context, values, x, y, width, height }) => {
                  if (values[0] === 255 || values[0] === 0) {
                    context.fillStyle = `rgba(${values[0]}, ${values[0]}, ${values[0]}, 0)`;
                  } else {
                    context.fillStyle = `rgba(${values[0]}, ${values[0]}, ${values[0]}, 0.7)`;
                  }
                  context.fillRect(x, y, width, height);
                },
                debugLevel: 2,
                georaster: georaster,
                opacity: 0.7
              });
              // If the CRS given is not 4326, log the error and let the user know the layer won't be shown.
              if (geoRasterLayer.projection !== 4326) {
                console.error('InfoMapper requires raster layers to use EPSG:4326 CRS. Layer \'' + geoLayerView.geoLayerId +
                  '\' is using EPSG:' + geoRasterLayer.projection + '. Layer will not be displayed on map.');
              }
              // Add the newly created Leaflet layer to the MapLayerManager, and if
              // it has the selectedInitial field set to true (or it's not given) add
              // it to the Leaflet map. If false, don't show it yet.
              this.mapLayerManager.getLayerItem(geoLayer.geoLayerId).addLeafletLayer(geoRasterLayer, this.mainMap);
            }
          });
        });
      }
      // Tile layer refresh.
      else if (refreshType === IM.RefreshType.tile) {
        bgLayer.redraw();
      }
      // Refresh an image layer.
      else if (refreshType === IM.RefreshType.image) {
        this.mapLayerManager.getLayerItem(geoLayer.geoLayerId).getItemLeafletLayer().remove();

        var imageLayer = L.imageOverlay(
          this.owfCommonService.buildPath(IM.Path.iP, [geoLayer.sourcePath]),
          MapUtil.parseImageBounds(geoLayerView.properties.imageBounds),
          {
            opacity: MapUtil.verify(symbol.properties.opacity, IM.Style.opacity)
          }
        );

        // Add the newly created Leaflet layer to the MapLayerManager.
        this.mapLayerManager.getLayerItem(geoLayer.geoLayerId).addLeafletLayer(imageLayer, this.mainMap);
        this.mapLayerManager.setLayerOrder();
      }
      
    }));
  }

  /**
  * Refreshes and/or reinitializes map global variables when a new map component instance is created.
  */
  private resetMapVariables(): void {
    // First clear the map
    if (this.mapInitialized === true) {
      // Before the map is removed - and there can only be one popup open at a time on the map - close it. This is used
      // when another map menu button is clicked on, and the Map Component is not destroyed.
      this.mainMap.closePopup();
      // Remove all event listeners on the map and destroy the map
      this.mainMap.remove();
    }
    // Since a new Leaflet map is created, it needs to be reinitialized.
    this.mapInitialized = false;
    // Reset the mapConfigLayerOrder variable in the owfCommonService, which contains the list of ordered geoLayerView geoLayerId's
    // for ordering the layers on the map. If it isn't reset, the array will keep being appended to.
    this.mapLayerManager.resetMapLayerManagerVariables();
    // Reset the count for numbering each feature in a layer that contains an Image Gallery, as the count is only set to 0 when
    // ngAfterViewInit is called. It won't be called if another menu in the InfoMapper is clicked on and changed to another map.
    this.count = 1;

    clearInterval(this.interval);
  }

  /**
  * Clears the current data displayed in the sidebar. This makes sure that the sidebar is cleared when
  * adding new components due to a page refresh.
  */
  private resetSidebarComponents(): void {
    if (this.layerViewContainerRef && this.backgroundViewContainerRef) {
      if (this.layerViewContainerRef.length > 1 || this.backgroundViewContainerRef.length > 1) {
        this.layerViewContainerRef.clear();
        this.backgroundViewContainerRef.clear();
      }
    }
  }

  /**
  * Replaces the background layer on the Leaflet map with the layer selected
  * @param name The name of the background selected to set the @var currentBackgroundLayer as
  */
  public selectBackgroundLayer(name: string): void {
    this.mainMap.removeLayer(this.baseMaps[this.currentBackgroundLayer]);
    this.mainMap.addLayer(this.baseMaps[name]);
    this.currentBackgroundLayer = name;

    // When a new background layer is selected, the raster layer was being covered up by the new tile layer. This
    // sets the z index of the raster so that it stays on top of the background, but behind the vector.
    this.mainMap.eachLayer((layer: any) => {
      if (layer instanceof L.GridLayer && layer.debugLevel) {
        layer.setZIndex(10);
      }
    });

  }

  /**
  * Sets the @var currentBackgroundLayer to the name of the background layer given, and sets the radio check in the side bar
  * to checked so that background layer is set on the Leaflet map.
  * @param name The name of the background layer selected
  */
  private setBackgroundLayer(name: string): void {
    this.currentBackgroundLayer = name;
    let radio: any = document.getElementById(name + "-radio");
    radio.checked = "checked";
  }

  /**
  * Sets the default background layer for the leaflet map by creating a MutationObserver and listens for when the DOM element
  * defaultName + '-radio' is not undefined. When the if statement is true, it calls the handleCanvas function, set the now
  * creating canvas elementId to 'checked', stops the observer from observing, and returns.
  */
  private setDefaultBackgroundLayer(): void {

    let defaultName: string = this.owfCommonService.getDefaultBackgroundLayer();
    this.currentBackgroundLayer = defaultName;

    // Callback executed when canvas was found
    function handleCanvas(canvas: any) {
      canvas.checked = "checked";
    }
    // Set up the mutation observer
    var observer = new MutationObserver(function (mutations, me) {
      // `mutations` is an array of mutations that occurred
      // `me` is the MutationObserver instance
      var canvas = document.getElementById(defaultName + "-radio");
      if (canvas) {
        handleCanvas(canvas);
        me.disconnect(); // stop observing
        return;
      }
    });
    // Start observing
    observer.observe(document, {
      childList: true,
      subtree: true
    });
  }

  public styleInnerShape(symbolProperties: any, styleType: string): Object {
    switch (styleType) {
      case 'g':
        return {
          fill: MapUtil.verify(symbolProperties.fillColor, IM.Style.fillColor),
          fillOpacity: MapUtil.verify(symbolProperties.fillOpacity, IM.Style.fillOpacity),
        }
    }
  }

  /**
  * Style's the current legend object in the sidebar.
  * @param symbolProperties The display style object for the current layer's legend.
  * @param styleType A string or character differentiating between single symbol, categorized, and graduated style legend objects.
  */
  public styleOuterShape(symbolProperties: any, styleType: string): Object {

    switch (styleType) {
      // Return the styling object for a SingleSymbol classificationType map configuration property.
      case 'ss':
        return {
          fill: MapUtil.verify(symbolProperties.properties.fillColor, IM.Style.fillColor),
          fillOpacity: MapUtil.verify(symbolProperties.properties.fillOpacity, IM.Style.fillOpacity),
          opacity: MapUtil.verify(symbolProperties.properties.opacity, IM.Style.opacity),
          stroke: MapUtil.verify(symbolProperties.properties.color, IM.Style.color),
          strokeWidth: MapUtil.verify(symbolProperties.properties.weight, IM.Style.weight)
        };
      // Return a styling object for a Categorized classificationType map configuration property.
      case 'c':
        return {
          fill: MapUtil.verify(symbolProperties.fillColor, IM.Style.fillColor),
          fillOpacity: MapUtil.verify(symbolProperties.fillOpacity, IM.Style.fillOpacity),
          stroke: MapUtil.verify(symbolProperties.color, IM.Style.color),
          strokeWidth: MapUtil.verify(symbolProperties.weight, IM.Style.weight)
        };
      // Return a styling object for a Graduated classificationType map configuration property.
      case 'g':
        return {
          fillOpacity: '0',
          stroke: MapUtil.verify(symbolProperties.color, IM.Style.color),
          strokeOpacity: MapUtil.verify(symbolProperties.opacity, IM.Style.opacity),
          strokeWidth: MapUtil.verify(symbolProperties.weight, IM.Style.weight)
        }
      // Stands for 'symbol missing'. Returns a default styling object.
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
  * Toggles Leaflet layer visibility, side bar description & symbol, and slide toggle button when it is clicked. Keeps the layer
  * order integrity and (soon) the selectBehavior Single property. This is when either zero or one layer at most can be showing
  * in a view group
  * @param geoLayerId The current geoLayer ID
  */
  public toggleLayer(geoLayerId: string, geoLayerViewGroupId: string): void {
    // Obtain the MapLayerItem for this layer.
    var layerItem: MapLayerItem = this.mapLayerManager.getLayerItem(geoLayerId);
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
}
