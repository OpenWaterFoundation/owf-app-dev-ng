import { AfterViewInit,
          Component,
          Inject,
          Input,
          OnDestroy,
          ViewEncapsulation }      from '@angular/core';
import { DOCUMENT }                from '@angular/common';
import { ActivatedRoute,
          NavigationExtras,
          ParamMap,
          Router }                 from '@angular/router';
import { MatDialog,
          MatDialogRef,
          MatDialogConfig }        from '@angular/material/dialog';
import { BreakpointObserver,
          Breakpoints }            from '@angular/cdk/layout';

import { DialogD3Component,
          DialogDocComponent,
          DialogGalleryComponent,
          DialogGapminderComponent,
          DialogHeatmapComponent,
          DialogTextComponent,
          DialogTSGraphComponent } from '@OpenWaterFoundation/common/ui/dialog';

import { forkJoin,
          timer,
          Observable,
          Subscription, 
          Subject }                from 'rxjs';
import { first,
          take,
          takeUntil }              from 'rxjs/operators';

import { faCaretLeft,
          faInfoCircle,
          faLayerGroup }           from '@fortawesome/free-solid-svg-icons';

import { CommonLoggerService,
          DialogParams,
          OwfCommonService }       from '@OpenWaterFoundation/common/services';
import { MapLayerManager,
          MapLayerItem }           from '@OpenWaterFoundation/common/ui/layer-manager';
import { WindowManager,
          WindowType }             from '@OpenWaterFoundation/common/ui/window-manager';
import { MapUtil }                 from './map.util';
import { MapManager }              from './map-manager';

import * as IM                     from '@OpenWaterFoundation/common/services';
import * as Papa                   from 'papaparse';
import * as GeoRasterLayer         from 'georaster-layer-for-leaflet';
import geoblaze                    from 'geoblaze';
import parseGeoRaster              from 'georaster';
/** The globally used L object for Leaflet object creation and manipulation. */
declare var L: any;


@Component({
  selector: 'common-map',
  styleUrls: ['./map.component.css'],
  templateUrl: './map.component.html',
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements AfterViewInit, OnDestroy {
  
  /** All features of a geoLayerView. Usually a FeatureCollection. */
  allFeatures: {} = {};
  /** Template input property used by consuming applications or websites for passing
   * the path to the app configuration file. */
  @Input('app-config') appConfigStandalonePath: any;
  /** Application version. */
  appVersion: string;
  /** Boolean showing if the path given to some file is incorrect. */
  badPath = false;
  /** Object that holds the base maps that populates the leaflet sidebar. */
  mapBackgroundLayers = {};
  /** A categorized configuration object with the geoLayerId as key and a list of
   * name followed by color for each feature in the Leaflet layer to be shown in
   * the sidebar. */
  categorizedLayerColors = {};
  /** Test variable for divIcon. */
  count = 1;
  /** Used to indicate which background layer is currently displayed on the map. */
  currentBackgroundLayer: string;
  /** Represents the current screen size. Used for dialog's to determine if they
   * should be shown for desktop or mobile screens. */
  currentScreenSize: string;
  /** Can be set to `true` if the debug query parameter is given for debugging purposes,
   * otherwise will be null. */
  debugFlag: string = null;
  /** Can be set to
   * * `trace` - Will show all logging messages in the application. Meant for
   * in-depth debugging.
   * * `warn` - Will display any warning messages throughout the application. For
   * less in-depth debugging. */
  debugLevelFlag: string = null;
  /** Subject that is completed when this component is destroyed. The breakpoint
   * observer will stop listening to screen size at that time. */
  destroyed = new Subject<void>();
  /** Set to true if this map is currently being shown in a story, and new actions
   * will need to be performed. */
  @Input('story') displayedInStory = false;
  /** An object containing any event actions with their id as the key and the action
   * object itself as the value. */
  eventActions = {};
  /** All used icons in the MapComponent. */
  faCaretLeft = faCaretLeft;
  faInfoCircle = faInfoCircle;
  faLayerGroup = faLayerGroup;
  /** For the Leaflet map's config file subscription object so it can be closed on
   * this component's destruction. */
  private forkJoinSub = null;
  /** An object of Style-like objects containing:
   *     key  : geoLayerId
   *     value: object with style properties
   * For displaying a graduated symbol in the Leaflet legend. */
  graduatedLayerColors = {};
  /** Represents the Date string since the last time a layer was updated. */
  lastRefresh = {};
  /** Object containing a layer geoLayerId as the ID, and an object of properties
   * set by a user-defined classification file. */
  layerClassificationInfo = {};
  /** Unique string for this Map component's Leaflet div Id attribute. */
  leafletMapContainerId: string;
  /** The reference for the Leaflet map. */
  mainMap: any;
  /** The map configuration object read in as this component's map configuration file. */
  mapConfig: IM.GeoMapProject;
  /** Template input property used by consuming applications,websites, or other Angular
   * modules for passing the path to the map configuration file. */
  @Input('map-config') mapConfigStandalonePath: string;
  /** A variable to keep track of whether or not the leaflet map has already been
   * initialized. This is useful for resetting the page and clearing the map using
   * map.remove() which can only be called on a previously initialized map. */
  mapInitialized: boolean = false;
  /** The current map's ID from the app configuration file. */
  mapID: string;
  /** The instance of the MapLayerManager, a helper class that manages MapLayerItem
   * objects with Leaflet layers and other layer data for displaying, ordering, and
   * highlighting. */
  mapLayerManager: MapLayerManager = MapLayerManager.getInstance();
  /** The MapManger singleton instance, that will keep a certain number of Leaflet
   * map instances, so a new map won't have to be created every time the same map
   * button is clicked. NOT IN USE. */
  mapManager: MapManager = MapManager.getInstance();
  /** InfoMapper project version. */
  projectVersion: Observable<any>;
  /** Boolean showing if the URL given for a layer is currently unavailable. */
  serverUnavailable = false;
  /** Boolean to indicate whether the sidebar has been initialized. Don't need to
   * waste time/resources initializing sidebar twice, but rather edit the information
   * in the already initialized sidebar. */
  sidebarInitialized: boolean = false;
  /** Subscription for all URL and query parameter changes. Unsubscribed from on
   * component destruction. */
  private paramMapSub = null;
  /** Subscription for using the activated route to listen for query parameter changes. */
  private queryParamMapSub: Subscription;
  /** The windowManager instance; To create, maintain, and remove multiple open dialogs. */
  windowManager: WindowManager = WindowManager.getInstance();
  /** Component class variable set so it can be used by the component's template file. */
  windowTypeImport = WindowType;
  /** Determines whether the map is shown, or a specialized 404 page component if
   * an invalid URL map id is provided (e.g. the map id does not exist). */
  validMapID: boolean;


  /**
  * @constructor Creates the Map Component instance.
  * @param actRoute Used for getting the parameter 'id' passed in by the url and from
  * the router.
  * @param breakpointObserver Angular provided utility for checking the matching
  * state of @media queries.
  * @param commonService A reference to the common library service.
  * @param dialog A reference to the MatDialog for creating and displaying a popup
  * dialog with a chart.
  * @param document
  * @param logger 
  * @param router A service that provides navigation among views and URL manipulation
  * capabilities.
  */
  constructor(
    private actRoute: ActivatedRoute,
    private breakpointObserver: BreakpointObserver,
    private commonService: OwfCommonService,
    private dialog: MatDialog,
    @Inject(DOCUMENT) private document: Document,
    private logger: CommonLoggerService,
    private router: Router
  ) {

    if (window['Cypress']) window['MapComponent'] = this;

    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge,
    ])
    .pipe(takeUntil(this.destroyed))
    .subscribe((result: any) => {
      for (const query of Object.keys(result.breakpoints)) {
        if (result.breakpoints[query]) {
          this.currentScreenSize = query;
        }
      }
    });
  }


  /**
   * @returns All geoLayerViewGroups from the FIRST geoMap.
   */
  get allGeoLayerViewGroups(): IM.GeoLayerViewGroup[] {
    return this.mapConfig.geoMaps[0].geoLayerViewGroups;
  }

  /**
   * @returns The geoMap docPath property from the FIRST geoMap.
   */
  get geoMapDocPath(): string {
    return this.mapConfig.geoMaps[0].properties.docPath;
  }

  /**
   * @returns The geoMapId property from the FIRST geoMap.
   */
  get geoMapId(): string {
    if (this.mapConfig) {
      return this.mapConfig.geoMaps[0].geoMapId;
    }
  }

  /**
   * @returns The name property from the FIRST geoMap.
   */
  get geoMapName(): string {
    if (this.mapConfig) {
      if (this.mapConfig.geoMaps[0].name.length < 30) {
        return this.mapConfig.geoMaps[0].name;
      }
      else return this.mapConfig.geoMaps[0].name.substring(0, 30) + '...';
    }
  }

  /**
   * 
   */
  get queryParamKey(): string {
    return this.windowManager.queryParamKey;
  }

  /**
   * Creates all Leaflet Controls on the map and ensures that they're drawn in the
   * correct order.
   */
  private addAllMapControls(): void {

    // Add background layers to the map in the topright.
    L.control.layers(this.mapBackgroundLayers).addTo(this.mainMap);
    // Add home & zoom in/zoom out to the map in the topright.
    this.addZoomHomeControl();
    // Conditionally add a mouse toggle control if the map is shown in a story.
    if (this.displayedInStory) {
      this.addMouseScrollToggleControl();
    }

    // Create the zoom level control.
    var mapZoom = this.createZoomLevelControl();
    // Create the lat and long of the mouse position.
    var mousePosition = this.createMousePositionControl();
    // Bottom Left corner control that shows the scale in km and miles of the map.
    var mapScale = L.control.scale({ position: 'bottomleft', imperial: true });

    // Add each control in the desired order. From top to bottom on the map (they
    // are stacked on top of each other):
    //   Scale
    //   Map zoom level
    //   Mouse Position / Coordinates
    this.mainMap.addControl(mousePosition);
    this.mainMap.addControl(mapZoom);
    this.mainMap.addControl(mapScale);
  }

  /**
  * Add content to the info tab of the sidebar dynamically. Following the example
  * from the Angular documentation found here: https://angular.io/guide/dynamic-component-loader.
  */
  private addInfoToSidebar(): void {
    this.appVersion = this.commonService.appConfig.version;
    this.projectVersion = this.commonService.getJSONData('assets/version.json', IM.Path.vP);
  }

  /**
   * Creates the div that displays the Map title and layer feature information.
   */
  private addMapTitle(): void {

    var _this = this;

    // Create the control on the Leaflet map.
    var mapTitle = L.control({ position: 'topleft' });
    // Add the title to the map in a div whose class name is 'upper-left-map-info'.
    mapTitle.onAdd = function () {
      this._div = L.DomUtil.create('div', 'upper-left-map-info');
      this._div.id = _this.geoMapId + '-title-card';
      this.update();
      return this._div;
    };
    // When the title-card is created, have it show the following.
    mapTitle.update = function () {
      this._div.innerHTML = ('<h4>' + _this.geoMapName + '</h4>');
    };
    mapTitle.addTo(this.mainMap);
  }

  /**
   * Disables this map's mouse scroll and creates & adds the ability to toggle the
   * mouse scroll in the upper right side of the map.
   */
   private addMouseScrollToggleControl(): any {

    var _this = this;

    this.mainMap.scrollWheelZoom.disable();

    let toggleScrollControl = L.control({ position: 'topright' });

    toggleScrollControl.onAdd = function() {
      this._div = L.DomUtil.create('div', 'scroll-toggle');
      
      L.DomEvent.disableClickPropagation(this._div)
      .disableClickPropagation(this._div);

		  this._div.innerHTML = '<a class="' + _this.mapConfig.geoMaps[0].geoMapId +
      '-scroll-toggle-a scroll-toggle-a" style="cursor: pointer;">' +
      '<span id="' + _this.mapConfig.geoMaps[0].geoMapId + '-scroll-toggle-tooltip" ' +
      'class="scroll-toggle-tooltip">' +
      'Click to toggle mouse scroll wheel behavior.<br>' +
      '[ X ] Scroll story pages forward/back.<br>[&nbsp;&nbsp;&nbsp;] Scroll zooms map.</span>' +
      '<svg height="20" width="20" viewBox="0 0 512 512" ' +
      'xmlns="http://www.w3.org/2000/svg" style="margin-left: 4px"><path d="' +
      _this.commonService.computerMouseSVGPath + '"></path></svg></a>';

		  return this._div;
    };

    setTimeout(function() {
      var scrollToggleATagElement = this.document.querySelector('.' +
      _this.mapConfig.geoMaps[0].geoMapId + '-scroll-toggle-a');

      if (scrollToggleATagElement) {
        scrollToggleATagElement.addEventListener('click', _this.scrollToggle.bind(_this));
      }
    });

    toggleScrollControl.addTo(this.mainMap);
  }

  /**
  * Add every action ID as the key and the action object as the value of the @var eventActions
  * object, sent to the Gallery Dialog component.
  * @param eventObject The object containing the type of event as the key (e.g. click-eCP)
  * and the entire event object from the popup template file.
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
   * Creates the ZoomHome control by extending the Leaflet Zoom class. Displays
   * a '+' for zooming in, '-' for zooming out, and a house Font Awesome icon in
   * the upper right section of the map.
   */
  private addZoomHomeControl(): void {

    var _this = this;

    L.Control.ZoomHome = L.Control.Zoom.extend({
      options: {
          position: 'topleft',
          zoomInText: '+',
          zoomInTitle: 'Zoom in',
          zoomOutText: '-',
          zoomOutTitle: 'Zoom out',
          zoomHomeIcon: '\uf008',
          zoomHomeTitle: 'Home',
          homeCoordinates: null,
          homeZoom: null
      },

      onAdd: function (map: any) {
          var controlName = 'leaflet-control-zoomhome',
              container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
              options = this.options;

          if (options.homeCoordinates === null) {
              options.homeCoordinates = map.getCenter();
          }
          if (options.homeZoom === null) {
              options.homeZoom = map.getZoom();
          }

          this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
          controlName + '-in', container, this._zoomIn.bind(this));

          var zoomHomeText = '<svg height="15" width="20" viewBox="0 0 512 512" ' +
          'xmlns="http://www.w3.org/2000/svg"><path d="' +
          _this.commonService.houseChimneySVGPath + '"></path></svg>';
          this._zoomHomeButton = this._createButton(zoomHomeText, options.zoomHomeTitle,
              controlName + '-home', container, this._zoomHome.bind(this));

          this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
              controlName + '-out', container, this._zoomOut.bind(this));

          this._updateDisabled();
          map.on('zoomend zoomlevelschange', this._updateDisabled, this);

          return container;
      },

      setHomeBounds: function (bounds) {
          if (bounds === undefined) {
              bounds = this._map.getBounds();
          } else {
              if (typeof bounds.getCenter !== 'function') {
                  bounds = L.latLngBounds(bounds);
              }
          }
          this.options.homeZoom = this._map.getBoundsZoom(bounds);
          this.options.homeCoordinates = bounds.getCenter();
      },

      setHomeCoordinates: function (coordinates) {
          if (coordinates === undefined) {
              coordinates = this._map.getCenter();
          }
          this.options.homeCoordinates = coordinates;
      },

      setHomeZoom: function (zoom) {
          if (zoom === undefined) {
              zoom = this._map.getZoom();
          }
          this.options.homeZoom = zoom;
      },

      getHomeZoom: function () {
          return this.options.homeZoom;
      },

      getHomeCoordinates: function () {
          return this.options.homeCoordinates;
      },

      _zoomHome: function (e) {
          this._map.closePopup();
          this._map.setView(this.options.homeCoordinates, this.options.homeZoom);
      }
    });

    L.control.zoomHome = function(opt: any) {
      return new L.Control.ZoomHome(opt)
    }
    L.control.zoomHome({
      position: 'topright',
      zoomHomeTitle: 'Zoom to initial extent'
    }).addTo(this.mainMap);
  }

  /**
  * A CSV classification file is given by the user, so use that to create the colorTable
  * to add to the categorizedLayerColors array for creating the legend colors.
  * @param results An array of objects containing information from each row in the
  * CSV file.
  * @param geoLayerId The geoLayerId of the given layer. Used for creating legend
  * colors.
  */
  private assignCategorizedFileColor(results: any[], geoLayerId: string): void {

    if (!results[0].value) {
      console.warn('The classification file for layer with geoLayerId \'' + geoLayerId +
      '\' does not contain value as a header, which is required for Categorized' +
      'classification. The layer\'s legend and/or map layer may not display correctly');
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
  * Assigns the array of objects of each line in the CSV file as the value in the
  * @var graduatedLayerColors with the geoLayerId as the key. Also possibly replaces
  * any ${property} notation variable in the `label` value if it exists.
  * @param results An array of objects that represent each line from the CSV classification
  * file.
  * @param geoLayerId The geoLayerId for the current layer.
  */
  private assignGraduatedFileColor(results: any[], geoLayerId: string): void {

    if (!results[0].valueMin && !results[0].valueMax) {
      console.warn('The classification file for layer with geoLayerId \'' + geoLayerId +
      '\' does not contain valueMin and valueMax as a header, which is required for ' +
      'Graduated classification. The layer\'s legend and/or map layer may not display correctly');
    }

    var lineArr: any[] = [];
    for (let line of results) {
      // Replace all user-defined ${property} notation in the label with the correct 
      if (line.label) {
        line.label = this.commonService.obtainPropertiesFromLine(line.label, line, geoLayerId, true);
      }
      lineArr.push(line);
    }

    this.graduatedLayerColors[geoLayerId] = lineArr;
  }

  /**
   * Builds the Leaflet map, and sets all event handling.
   */
  private buildMap(): void {

    this.logger.print('trace', 'MapComponent.buildMap - Creating Leaflet map with id "' +
    this.leafletMapContainerId + '"', this.debugFlag, this.debugLevelFlag);
    // Create a Leaflet Map and set the default layers.
    this.mainMap = L.map(this.leafletMapContainerId, {
      layers: [this.mapBackgroundLayers[this.getDefaultBackgroundLayer()]],
      // We're using our own zoom control for the map, so we don't need the default
      zoomControl: false,
      wheelPxPerZoomLevel: 150,
      zoomSnap: 0.1
    });

    this.mapManager.addMap(this.mapConfig.geoMaps[0].geoMapId, this.mainMap);

    // Retrieve the initial extent from the config file and set the map view
    let extentInitial = this.getExtentInitial();
    this.mainMap.setView([extentInitial[1], extentInitial[0]], extentInitial[2]);

    // Set the default layer radio check to true
    this.setDefaultBackgroundLayer();

    // The baselayerchange is fired when the base layer is changed through the layer
    // control. So when a radio button is pressed and the basemap changes, update
    // the currentBackgroundLayer and check the radio button.
    this.mainMap.on('baselayerchange', (backgroundLayer: any) => {
      this.setBackgroundLayer(backgroundLayer.name);
    });

    this.addMapTitle();
    this.createMapTitleInitial();
    this.addAllMapControls();

    var geoLayerViewGroups: IM.GeoLayerViewGroup[] = this.allGeoLayerViewGroups;

    // Iterate through each geoLayerView in every geoLayerViewGroup, and create
    // & add a Leaflet map layer for them.
    geoLayerViewGroups.forEach((geoLayerViewGroup: IM.GeoLayerViewGroup) => {
      if (geoLayerViewGroup.properties.isBackground === undefined ||
      geoLayerViewGroup.properties.isBackground === 'false') {

        for (let geoLayerView of geoLayerViewGroup.geoLayerViews) {

          // Obtain the geoLayer for use in creating this Leaflet layer.
          let geoLayer: IM.GeoLayer = this.getGeoLayerFromId(geoLayerView.geoLayerId);
          // Obtain the symbol data for use in creating this Leaflet layer.
          let symbol: IM.GeoLayerSymbol = this.getSymbolDataFromID(geoLayer.geoLayerId);
          // A geoLayerSymbol object was not provided in the geoLayerView, so leave
          // the user an error message and log an error message that one needs to
          // be added to show something other than default styling.
          if (!symbol) {
            console.error('Layer with geoLayerId \'' + geoLayer.geoLayerId +
            '\' was not given a geoLayerSymbol, which must be used to create the ' +
            'layer using the \'classificationType\' property.');
            return;
          }
          // Obtain the event handler information from the geoLayerView for use
          // in creating this Leaflet layer.
          let eventHandlers: IM.EventHandler[] = this.getGeoLayerViewEventHandler(geoLayer.geoLayerId);
          var asyncData: Observable<any>[] = [];

          // // Displays a web feature service from Esri. 
          // if (geoLayer.sourceFormat && geoLayer.sourceFormat.toUpperCase() === 'WFS') {
          // }

          // Put the path to the layer data file no matter what. If file is for
          // a raster, the handleError function in the commonService will skip
          // it and won't log any errors.
          asyncData.push(
            this.commonService.getJSONData(
              this.commonService.buildPath(IM.Path.gLGJP, [geoLayer.sourcePath]), IM.Path.gLGJP, geoLayer.geoLayerId
            )
          );
          // Push each event handler onto the async array if there are any.
          if (eventHandlers.length > 0) {
            eventHandlers.forEach((event: IM.EventHandler) => {
              // TODO: jpkeahey 2020.10.22 - popupConfigPath will be deprecated,
              // but will still work for now, just with a warning message displayed
              // to the user.
              if (event.properties.popupConfigPath) {
                console.warn('The Event Handler property \'popupConfigPath\' is deprecated. \'eventConfigPath\' will replace ' +
                  'it, will be supported in the future, and should be used instead');
                // Use the http GET request function and pass it the returned formatted path.
                asyncData.push(
                  this.commonService.getJSONData(
                    this.commonService.buildPath(IM.Path.eCP, [event.properties.popupConfigPath]),
                    IM.Path.eCP, this.mapID
                  )
                );
              }
              else if (event.properties.eventConfigPath) {
                // Use the http GET request function and pass it the returned formatted path.
                asyncData.push(
                  this.commonService.getJSONData(
                    this.commonService.buildPath(IM.Path.eCP, [event.properties.eventConfigPath]),
                    IM.Path.eCP, this.mapID
                  )
                );
              }
            });
          }
          // Use forkJoin to go through the array and be able to subscribe to every
          // element and get the response back in the results array when finished.
          this.forkJoinSub = <any>Subscription;
          this.forkJoinSub = forkJoin(asyncData).subscribe((results) => {
            // The scope of this does not reach the leaflet event functions.
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
              this.commonService.addLayerError(geoLayer.geoLayerId);
              return;
            }

            // Prints out how many features each geoLayerView contains. Helpful for debugging.
            if (this.allFeatures[geoLayer.geoLayerId]) {
              var message = geoLayerView.name + ' contains ' +
              this.allFeatures[geoLayer.geoLayerId].features.length +
              (this.allFeatures[geoLayer.geoLayerId].features.length === 1 ? ' feature.' : ' features.');

              this.logger.print('trace', 'MapComponent.buildMap - ' + message, this.debugFlag, this.debugLevelFlag);
            }

            var eventObject: any = {};
            // Go through each event and assign the retrieved template output to
            // each event type in an eventObject.
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
                Papa.parse(this.commonService.buildPath(IM.Path.cP, [symbol.properties.classificationFile]), {
                  delimiter: ",",
                  download: true,
                  comments: "#",
                  skipEmptyLines: true,
                  header: true,
                  complete: (result: any, file: any) => {
                    // Check if classified as CATEGORIZED.
                    if (symbol.classificationType.toUpperCase() === 'CATEGORIZED') {
                      // Populate the categorizedLayerColors object with the results
                      // from the classification file if the geoLayerSymbol attribute
                      // classificationType is Categorized.
                      this.assignCategorizedFileColor(result.data, geoLayer.geoLayerId);
                    }
                    // Check if classified as GRADUATED.
                    else if (symbol.classificationType.toUpperCase() === 'GRADUATED') {
                      // Populate the graduatedLayerColors array with the results
                      // from the classification file if the geoLayerSymbol attribute
                      // classificationType is Graduated.
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
                    // Add the newly created Leaflet layer to the MapLayerManager,
                    // and if it has the selectedInitial field set to true (or it's
                    // not given) add it to the Leaflet map. If false, don't show it yet.
                    this.mapLayerManager.addLayerItem(data, geoLayer, geoLayerView, geoLayerViewGroup);
                    let layerItem: MapLayerItem = this.mapLayerManager.getMapLayerItem(geoLayer.geoLayerId);
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
                // Add the newly created Leaflet layer to the MapLayerManager, and
                // if it has the selectedInitial field set to true (or it's not given)
                // add it to the Leaflet map. If false, don't show it yet.
                this.mapLayerManager.addLayerItem(data, geoLayer, geoLayerView, geoLayerViewGroup);
                let layerItem: MapLayerItem = this.mapLayerManager.getMapLayerItem(geoLayer.geoLayerId);
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

                Papa.parse(this.commonService.buildPath(IM.Path.cP, [symbol.properties.classificationFile]), {
                  delimiter: ",",
                  download: true,
                  comments: "#",
                  skipEmptyLines: true,
                  header: true,
                  complete: (result: any, file: any) => {
                    // Check if classified as CATEGORIZED.
                    if (symbol.classificationType.toUpperCase() === 'CATEGORIZED') {
                      // Populate the categorizedLayerColors object with the results
                      // from the classification file if the geoLayerSymbol attribute
                      // classificationType is Categorized.
                      this.assignCategorizedFileColor(result.data, geoLayer.geoLayerId);
                    }
                    // Check if classified as GRADUATED.
                    else if (symbol.classificationType.toUpperCase() === 'GRADUATED') {
                      // Populate the graduatedLayerColors array with the results
                      // from the classification file if the geoLayerSymbol attribute
                      // classificationType is Graduated.
                      this.assignGraduatedFileColor(result.data, geoLayer.geoLayerId);
                    }

                    this.layerClassificationInfo[geoLayer.geoLayerId] = {
                      weight: result.data[0].weight
                    };

                    var geoLayerView = this.getGeoLayerView(geoLayer.geoLayerId);
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
                    // Add the newly created Leaflet layer to the MapLayerManager,
                    // and if it has the selectedInitial field set to true (or it's
                    // not given) add it to the Leaflet map. If false, don't show it yet.
                    this.mapLayerManager.addLayerItem(data, geoLayer, geoLayerView, geoLayerViewGroup);
                    let layerItem: MapLayerItem = this.mapLayerManager.getMapLayerItem(geoLayer.geoLayerId);
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
                // Default color table is made here.
                let colorTable = MapUtil.assignColor(this.allFeatures[geoLayer.geoLayerId].features, symbol);
                this.categorizedLayerColors[geoLayer.geoLayerId] = colorTable;

                // If there is no classificationFile, create a default colorTable.
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

                // Add the newly created Leaflet layer to the MapLayerManager, and
                // if it has the selectedInitial field set to true (or it's not given)
                // add it to the Leaflet map. If false, don't show it yet.
                this.mapLayerManager.addLayerItem(data, geoLayer, geoLayerView, geoLayerViewGroup);
                let layerItem: MapLayerItem = this.mapLayerManager.getMapLayerItem(geoLayer.geoLayerId);
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
                this.commonService.buildPath(IM.Path.iP, [geoLayer.sourcePath]),
                MapUtil.parseImageBounds(geoLayerView.properties.imageBounds),
                {
                  opacity: MapUtil.verify(symbol.properties.opacity, IM.Style.opacity)
                }
              );

              // Add the newly created Leaflet layer to the MapLayerManager, and
              // if it has the selectedInitial field set to true (or it's not given)
              // add it to the Leaflet map. If false, don't show it yet.
              this.mapLayerManager.addLayerItem(imageLayer, geoLayer, geoLayerView, geoLayerViewGroup);
              let layerItem: MapLayerItem = this.mapLayerManager.getMapLayerItem(geoLayer.geoLayerId);
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
                var refreshInterval = this.getRefreshInterval(geoLayerView.geoLayerId);
                var refreshOffset = this.getRefreshOffset(geoLayerView.geoLayerId, refreshInterval);
                // Confirm the parsing was successful by checking if getRefreshInterval
                // returned a number.
                if (!isNaN(refreshInterval)) {
                  this.refreshLayer(refreshOffset, refreshInterval, geoLayer, IM.RefreshType.image,
                                      geoLayerView);
                }
              }
            }
            // Display a Leaflet marker or custom point/SHAPEMARKER.
            else {
              // If the point layer contains a classification file for styling.
              if (symbol.properties.classificationFile) {
                Papa.parse(this.commonService.buildPath(IM.Path.cP, [symbol.properties.classificationFile]), {
                  delimiter: ",",
                  download: true,
                  comments: "#",
                  skipEmptyLines: true,
                  header: true,
                  complete: (result: any, file: any) => {
                    // Check if classified as CATEGORIZED.
                    if (symbol.classificationType.toUpperCase() === 'CATEGORIZED') {
                      // Populate the categorizedLayerColors object with the results
                      // from the classification file if the geoLayerSymbol attribute
                      // classificationType is Categorized.
                      this.assignCategorizedFileColor(result.data, geoLayer.geoLayerId);
                    }
                    // Check if classified as GRADUATED.
                    else if (symbol.classificationType.toUpperCase() === 'GRADUATED') {
                      // Populate the graduatedLayerColors array with the results
                      // from the classification file if the geoLayerSymbol attribute
                      // classificationType is Graduated.
                      this.assignGraduatedFileColor(result.data, geoLayer.geoLayerId);
                    }

                    this.layerClassificationInfo[geoLayer.geoLayerId] = {
                      symbolShape: result.data[0].symbolShape,
                      symbolSize: result.data[0].symbolSize,
                      weight: result.data[0].weight
                    };

                    var data = L.geoJson(this.allFeatures[geoLayer.geoLayerId], {
                      pointToLayer: (feature: any, latlng: any) => {
                        // Create a shapemarker layer.
                        if (geoLayer.geometryType.toUpperCase().includes('POINT') &&
                        !symbol.properties.symbolImage && !symbol.properties.builtinSymbolImage) {

                          return L.shapeMarker(latlng, MapUtil.addStyle({
                            feature: feature,
                            geoLayer: geoLayer,
                            results: result.data,
                            symbol: symbol
                          }));
                        }
                        // Create a user-provided marker image layer.
                        else if (symbol.properties.symbolImage) {

                          let markerIcon = new L.icon({
                            iconUrl: this.commonService.getAppPath() +
                            this.commonService.formatPath(symbol.properties.symbolImage, IM.Path.sIP),
                            iconAnchor: MapUtil.createAnchorArray(symbol.properties.symbolImage, symbol.properties.imageAnchorPoint)
                          });

                          let leafletMarker = L.marker(latlng, { icon: markerIcon });
                          // Determine if there are eventHandlers on this layer
                          // by checking its geoLayerView object.
                          var geoLayerView = this.getGeoLayerView(geoLayer.geoLayerId);

                          MapUtil.createLayerTooltips(leafletMarker, eventObject, geoLayerView.properties.imageGalleryEventActionId,
                            geoLayerView.geoLayerSymbol.properties.labelText, this.count);
                          ++this.count;

                          return leafletMarker;
                        }
                        // Create a built-in (default) marker image layer
                        else if (symbol.properties.builtinSymbolImage) {
                          let markerIcon = new L.icon({
                            iconUrl: this.commonService.formatPath(symbol.properties.builtinSymbolImage, IM.Path.bSIP),
                            iconAnchor: MapUtil.createAnchorArray(symbol.properties.builtinSymbolImage, symbol.properties.imageAnchorPoint)
                          });
                          return L.marker(latlng, { icon: markerIcon })
                        }
                      },
                      onEachFeature: onEachFeature
                    });
                    // Add the newly created Leaflet layer to the MapLayerManager,
                    // and if it has the selectedInitial field set to true (or it's
                    // not given) add it to the Leaflet map. If false, don't show it yet.
                    this.mapLayerManager.addLayerItem(data, geoLayer, geoLayerView, geoLayerViewGroup);
                    let layerItem: MapLayerItem = this.mapLayerManager.getMapLayerItem(geoLayer.geoLayerId);
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
                    // Create a user-provided marker image layer.
                    else if (symbol.properties.symbolImage) {

                      let markerIcon = new L.icon({
                        iconUrl: this.commonService.getAppPath() +
                        this.commonService.formatPath(symbol.properties.symbolImage, IM.Path.sIP),
                        iconAnchor: MapUtil.createAnchorArray(symbol.properties.symbolImage, symbol.properties.imageAnchorPoint)
                      });

                      let leafletMarker = L.marker(latlng, { icon: markerIcon });
                      // Determine if there are eventHandlers on this layer by
                      // checking its geoLayerView object.
                      var geoLayerView = this.getGeoLayerView(geoLayer.geoLayerId);

                      MapUtil.createLayerTooltips(leafletMarker, eventObject, geoLayerView.properties.imageGalleryEventActionId,
                        geoLayerView.geoLayerSymbol.properties.labelText, this.count);
                      ++this.count;

                      return leafletMarker;
                    }
                    // Create a built-in (default) marker image layer.
                    else if (symbol.properties.builtinSymbolImage) {
                      let markerIcon = new L.icon({
                        iconUrl: this.commonService.formatPath(symbol.properties.builtinSymbolImage, IM.Path.bSIP),
                        iconAnchor: MapUtil.createAnchorArray(symbol.properties.builtinSymbolImage, symbol.properties.imageAnchorPoint)
                      });
                      return L.marker(latlng, { icon: markerIcon })
                    }
                  },
                  onEachFeature: onEachFeature
                });
                // Add the newly created Leaflet layer to the MapLayerManager, and
                // if it has the selectedInitial field set to true (or it's not
                // given) add it to the Leaflet map. If false, don't show it yet.
                this.mapLayerManager.addLayerItem(data, geoLayer, geoLayerView, geoLayerViewGroup);
                let layerItem: MapLayerItem = this.mapLayerManager.getMapLayerItem(geoLayer.geoLayerId);
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
            // Refresh a map vector layer based on the refreshInterval property in
            // the map config file. Make sure to check if it is a vector layer.
            if (geoLayerView.properties.refreshInterval && geoLayer.layerType.toUpperCase().includes('VECTOR')) {
              var refreshInterval = this.getRefreshInterval(geoLayerView.geoLayerId);
              var refreshOffset = this.getRefreshOffset(geoLayerView.geoLayerId, refreshInterval);
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
                        // If only click is given for an event, default should be
                        // to display all features and show them.
                        mouseover: function (e: any) {
                          if (multipleEventsSet === true) {
                            return;
                          } else {
                            MapUtil.updateFeature(e, geoLayer, geoLayerView, _this.geoMapId);
                          }
                        },
                        mouseout: function (e: any) {
                          if (multipleEventsSet === true) {
                            return;
                          } else {
                            if (!feature.geometry.type.toUpperCase().includes('POLYGON')) {
                              MapUtil.resetFeature(e, geoLayer, geoLayerView, _this.geoMapName, _this.geoMapId);
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
                          var TSIDLocation: string;
                          var resourcePathArray: string[] = [];
                          var downloadFileNameArray: any[] = [];
                          var windowID: string;

                          if (e.target.getTooltip()) {
                            featureIndex = parseInt(e.target.getTooltip()._content);
                          }

                          // If there is no action OR there is an empty list, just
                          // show the HTML in the Leaflet popup.
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

                          // Iterate over the action array from the popup template file.
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
                              // If this button has already been clicked and resides
                              // in the windowManager, don't do anything.
                              if (_this.windowManager.windowExists(windowID)) {
                                return;
                              }

                              // Display a plain text file in a Dialog popup.
                              if (actionArray[i].toUpperCase() === 'DISPLAYTEXT') {
                                // Since the popup template file is not replacing
                                // any ${properties}, replace the ${property} for
                                // the resourcePath only.
                                var resourcePath = _this.commonService.obtainPropertiesFromLine(resourcePathArray[i], featureProperties);
                                let fullResourcePath = _this.commonService.buildPath(IM.Path.rP, [resourcePath]);

                                _this.commonService.getPlainText(fullResourcePath, IM.Path.rP).subscribe((text: string) => {
                                  _this.setupDialogOpen(WindowType.TEXT, {
                                    location: 'map-layer-' + WindowType.TEXT,
                                    text: text,
                                    fullResourcePath: fullResourcePath,
                                    windowID: windowID
                                  });
                                });
                              }
                              // Display a Time Series graph in a Dialog popup.
                              else if (actionArray[i].toUpperCase() === 'DISPLAYTIMESERIES') {

                                let fullResourcePath = _this.commonService.buildPath(IM.Path.rP, [resourcePathArray[i]]);

                                _this.commonService.getJSONData(fullResourcePath, IM.Path.rP, _this.mapID)
                                  .subscribe((graphTemplate: IM.GraphTemplate) => {
                                    // Replaces all ${} property notations with
                                    // the correct feature in the TSTool graph
                                    // template object
                                    _this.commonService.replaceProperties(graphTemplate, featureProperties);

                                    if (graphTemplate.product.subProducts[0].data[0].properties.TSID) {
                                      let fullTSID: any = graphTemplate.product.subProducts[0].data[0].properties.TSID;
                                      // Split on the ~ and set the actual file
                                      // path we want to use so our dialog-content
                                      // component can determine what kind of file
                                      // was given.
                                      TSIDLocation = fullTSID.split('~')[0];
                                      // If the TSID has one tilde (~), set the
                                      // path using the correct index compared to
                                      // if the TSID contains two tildes.
                                      if (fullTSID.split('~').length === 2) {
                                        graphFilePath = fullTSID.split("~")[1];
                                      } else if (fullTSID.split('~').length === 3) {
                                        graphFilePath = fullTSID.split("~")[2];
                                      }
                                    } else console.error('The TSID has not been set in the graph template file');

                                    _this.openTSGraphDialog(graphTemplate, graphFilePath, TSIDLocation, chartPackageArray[i],
                                      featureProperties, downloadFileNameArray[i] ? downloadFileNameArray[i] : null, windowID);
                                  });
                              }
                              // Display a Heatmap Dialog.
                              else if (actionArray[i].toUpperCase() === 'DISPLAYHEATMAP') {
                                let fullResourcePath = _this.commonService.buildPath(IM.Path.rP, [resourcePathArray[i]]);

                                _this.commonService.getJSONData(fullResourcePath).subscribe((graphTemplate: IM.GraphTemplate) => {
                                  // Replaces all ${} property notations with the
                                  // correct feature in the TSTool graph template object.
                                  _this.commonService.replaceProperties(graphTemplate, featureProperties);

                                  if (graphTemplate.product.subProducts[0].data[0].properties.TSID) {
                                    let fullTSID: any = graphTemplate.product.subProducts[0].data[0].properties.TSID;
                                    // Split on the ~ and set the actual file path
                                    // we want to use so our dialog-content component
                                    // can determine what kind of file was given.
                                    TSIDLocation = fullTSID.split('~')[0];
                                    // If the TSID has one tilde (~), set the path
                                    // using the correct index compared to if
                                    // the TSID contains two tildes.
                                    if (fullTSID.split('~').length === 2) {
                                      graphFilePath = fullTSID.split("~")[1];
                                    } else if (fullTSID.split('~').length === 3) {
                                      graphFilePath = fullTSID.split("~")[2];
                                    }
                                  } else console.error('The TSID has not been set in the graph template file');
                                  _this.openHeatmapDialog(geoLayer, graphTemplate, graphFilePath);
                                });
                                
                              } else if (actionArray[i].toUpperCase() === 'DISPLAYD3VIZ') {
                                var fullVizPath = _this.commonService.buildPath(IM.Path.d3P, [resourcePathArray[i]])
                                _this.commonService.getJSONData(fullVizPath).subscribe((d3Prop: IM.D3Prop) => {
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

                                _this.openGapminderDialog(geoLayer, resourcePathArray[i]);
                              }
                              // If the attribute is neither displayTimeSeries nor displayText.
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
                              L.DomEvent.removeListener(L.DomUtil.get(popupTemplateId +
                                '-' + actionLabelArray[i], 'click', function (e: any) { }));
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
                        // If a hover event is given, default should be to display
                        // all features.
                        mouseover: function (e: any) {
                          MapUtil.updateFeature(e, geoLayer, geoLayerView,
                          _this.geoMapId, eventObject['hover-eCP'].layerAttributes);
                        },
                        mouseout: function (e: any) {
                          MapUtil.resetFeature(e, geoLayer, geoLayerView, _this.geoMapName, _this.geoMapId);
                        },
                        click: ((e: any) => {
                          if (multipleEventsSet === true) {
                            return;
                          } else {
                            var divContents = '';
                            var featureProperties: Object = e.target.feature.properties;
                            var popupTemplateId = eventObject[eventHandler.eventType + '-eCP'].id;
                            var layerAttributes = eventObject[eventHandler.eventType + '-eCP'].layerAttributes;
                            // If there is no action, just show the HTML in the
                            // Leaflet popup
                            if (!eventObject[eventHandler.eventType + '-eCP'].actions) {
                              // Add the last optional argument hoverEvent boolean
                              // telling the buildPopupHTML function that the hover
                              // event is the alone event in the popup config file,
                              // and all features should be shown
                              divContents = MapUtil.buildPopupHTML(popupTemplateId, null,
                                layerAttributes, featureProperties, null, true);
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
                    // If built in eventTypes are not found in the eventType property,
                    // (e.g. hover, click) then default to only having mouseover
                    // and mouseout showing all features in the Control div popup.
                    default:
                      layer.on({
                        mouseover: function (e: any) {
                          MapUtil.updateFeature(e, geoLayer, geoLayerView, _this.geoMapId);
                        },
                        mouseout: function (e: any) {
                          MapUtil.resetFeature(e, geoLayer, geoLayerView, _this.geoMapName, _this.geoMapId);
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
                // If the map config does NOT have any event handlers at all, use a default.
                layer.on({
                  mouseover: function (e: any) {
                    MapUtil.updateFeature(e, geoLayer, geoLayerView, _this.geoMapId);
                  },
                  mouseout: function (e: any) {
                    MapUtil.resetFeature(e, geoLayer, geoLayerView, _this.geoMapName, _this.geoMapId);
                  },
                  click: ((e: any) => {
                    // Create the default HTML property popup.
                    var divContents = MapUtil.buildDefaultDivContentString(e.target.feature.properties);
                    // Show the popup on the map. It must be unbound first, or else
                    // will only show on the first click.
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
          // // To have the tileLayer clear all tiles and request them again, call
          // // the following.
          // const delay = timer(15000, 60000);

          // const test = delay.subscribe(() => {
          //   radar.redraw();
          // });
        }
      }
    });

    // If the sidebar has not already been initialized once then do so.
    if (this.sidebarInitialized == false) { this.createSidebar(); }
  } // END OF MAP BUILDING.

  /**
  * The entry point and main foundation for building the Leaflet map using the data
  * from the configuration file. Contains the building and positioning of the map,
  * raster and/or vector layers on the map and all necessary Leaflet functions for the
  * creation and styling of shapes, polygons and images on the map (among other options).
  */
  private checkIfMapContainerExists(): void {

    this.mapInitialized = true;

    this.createMapBackgroundLayers();

    this.logger.print('trace', 'MapComponent.checkIfMapContainerExists - Leaflet map container div: ',
    this.debugFlag, this.debugLevelFlag);
    this.logger.print('trace', L.DomUtil.get(this.leafletMapContainerId), this.debugFlag, this.debugLevelFlag);

    var mapContainerFound = new Subject<void>();
    var secondsTicked = 0;
    
    /**
     * This might be needed because of the ngIf I added to the top of the Map
     * component's template file. Try testing without it.
     */
    timer(0, 1000).pipe(takeUntil(mapContainerFound)).subscribe(() => {
      if (L.DomUtil.get(this.leafletMapContainerId)) {

        this.logger.print('trace', 'MapComponent.checkIfMapContainerExists - Leaflet map container found:',
        this.debugFlag, this.debugLevelFlag);
        this.logger.print('trace', L.DomUtil.get(this.leafletMapContainerId), this.debugFlag, this.debugLevelFlag);

        mapContainerFound.next();
        mapContainerFound.complete();
        this.buildMap();
        
      } else {

        secondsTicked += 1;
        if (secondsTicked === 10) {

          this.logger.print('warn',
          'MapComponent.checkIfMapContainerExists - No Leaflet map container found after 10 tries. Exiting.',
          this.debugFlag, this.debugLevelFlag);

          mapContainerFound.next();
          mapContainerFound.complete();
        } else {
          this.logger.print('trace',
          'MapComponent.checkIfMapContainerExists - Leaflet map container not found. Trying again.',
          this.debugFlag, this.debugLevelFlag);
        }
      }
    });
  }

  /**
   * Unused.
   * @param geoLayerId 
   * @returns 
   */
  checkIfHighlighted(geoLayerId: string): boolean {
    return;
  }

  /**
  * Removes all highlighted layers from the map.
  */
  clearAllSelections(): void {
    this.mainMap.eachLayer((layer: any) => {
      if (layer.options.fillColor === '#ffff01') {
        this.mainMap.removeLayer(layer);
      }
    });
  }

  /**
   * Creates a dialog config object and sets its width & height properties based
   * on the current screen size.
   * @returns An object to be used for creating a dialog with its initial, min, and max
   * height and width conditionally.
   */
   private createDialogConfig(dialogConfigData: any): MatDialogConfig {

    var isMobile = (this.currentScreenSize === Breakpoints.XSmall ||
      this.currentScreenSize === Breakpoints.Small);

    return {
      data: dialogConfigData,
      // This stops the dialog from containing a backdrop, which means the background
      // opacity is set to 0, and the entire InfoMapper is still navigable while
      // having the dialog open. This way, you can have multiple dialogs open at
      // the same time.
      hasBackdrop: false,
      panelClass: ['custom-dialog-container', 'mat-elevation-z24'],
      height: isMobile ? "90vh" : "700px",
      width: isMobile ? "100vw" : "910px",
      minHeight: isMobile ? "90vh" : "400px",
      minWidth: isMobile ? "100vw" : "610px",
      maxHeight: isMobile ? "90vh" : "70vh",
      maxWidth: isMobile ? "100vw" : "95vw"
    }
  }

  /**
  * Asynchronously creates a raster layer on the Leaflet map.
  * @param geoLayer The geoLayer object from the map configuration file
  * @param symbol The Symbol data object from the geoLayerView
  */
  private createRasterLayer(geoLayer: IM.GeoLayer, symbol: IM.GeoLayerSymbol, geoLayerView: IM.GeoLayerView,
                            geoLayerViewGroup: IM.GeoLayerViewGroup, eventObject?: any): void {
    if (!symbol) {
      console.warn('The geoLayerSymbol for geoLayerId: "' + geoLayerView.geoLayerId +
      '" and name: "' + geoLayerView.name +
      '" does not exist, and should be added to the geoLayerView for legend styling. Displaying the default.');
    }
    var _this = this;

    // Uses the fetch API with the given path to get the tiff file in assets to
    // create the raster layer.
    fetch(this.commonService.buildPath(IM.Path.raP, [geoLayer.sourcePath]))
    .then((response: any) => response.arrayBuffer())
    .then((arrayBuffer: any) => {
      parseGeoRaster(arrayBuffer).then((georaster: any) => {
        // The classificationFile attribute exists in the map configuration file,
        // so use that file path for Papaparse.
        if (symbol && symbol.properties.classificationFile) {
          this.categorizedLayerColors[geoLayer.geoLayerId] = [];

          Papa.parse(this.commonService.buildPath(IM.Path.cP, [symbol.properties.classificationFile]), {
            delimiter: ",",
            download: true,
            comments: "#",
            skipEmptyLines: true,
            header: true,
            complete: (result: any, file: any) => {

              if (symbol.classificationType.toUpperCase() === 'CATEGORIZED') {
                // Populate the categorizedLayerColors object with the results from
                // the classification file if the geoLayerSymbol attribute classificationType
                // is Categorized.
                this.assignCategorizedFileColor(result.data, geoLayer.geoLayerId);
              } else if (symbol.classificationType.toUpperCase() === 'GRADUATED') {
                // Populate the graduatedLayerColors array with the results from
                // the classification file if the geoLayerSymbol attribute classificationType
                // is Graduated.
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

              // Add the newly created Leaflet layer to the MapLayerManager, and
              // if it has the selectedInitial field set to true (or it's not given)
              // add it to the Leaflet map. If false, don't show it yet.
              this.mapLayerManager.addLayerItem(geoRasterLayer, geoLayer, geoLayerView, geoLayerViewGroup, true);
              let layerItem: MapLayerItem = this.mapLayerManager.getMapLayerItem(geoLayer.geoLayerId);
              if (layerItem.isSelectInitial()) {
                layerItem.initItemLeafletLayerToMainMap(this.mainMap);
                if (layerItem.getItemSelectBehavior().toUpperCase() === 'SINGLE') {
                  this.mapLayerManager.toggleOffOtherLayersOnMainMap(geoLayer.geoLayerId, this.mainMap,
                    geoLayerViewGroup.geoLayerViewGroupId, 'init');
                }
              }
              // With the help of GeoBlaze, use Leaflet Map Events for clicking
              // and/or hovering over a raster layer.
              const blaze = geoblaze.load(this.commonService.buildPath(IM.Path.raP, [geoLayer.sourcePath]))
              .then((georaster: any) => {
                let layerItem = _this.mapLayerManager.getMapLayerItem(geoLayerView.geoLayerId);

                Object.keys(eventObject).forEach((key: any) => {
                  if (key === 'hover-eCP') {
                    let div = L.DomUtil.get(_this.geoMapId + '-title-card');
                    var originalDivContents: string = div.innerHTML;

                    _this.mainMap.on('mousemove', (e: any) => {
                      MapUtil.displayMultipleHTMLRasterCells(e, georaster, geoLayerView, originalDivContents,
                        layerItem, symbol, _this.geoMapId);

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
        // No classificationFile attribute was given in the config file, so just
        // create a default raster layer.
        else {
          var geoRasterLayer = new GeoRasterLayer({
            // Create a custom drawing scheme for the raster layer. This might overwrite
            // pixelValuesToColorFn()
            customDrawFunction: ({ context, values, x, y, width, height }) => {
              if (values[0] === 255 || values[0] === 0) {
                context.fillStyle = `rgba(${values[0]}, ${values[0]}, ${values[0]}, 0)`;
              } else {
                context.fillStyle = `rgba(${values[0]}, ${values[0]}, ${values[0]}, 0.7)`;
              }
              context.fillRect(x, y, width, height);
            },
            debugLevel: 0,
            georaster: georaster,
            opacity: 0.7
          });
          // If the CRS given is not 4326, log the error and let the user know
          // the layer won't be shown.
          if (geoRasterLayer.projection !== 4326) {
            console.error('InfoMapper requires raster layers to use EPSG:4326 CRS. Layer \'' + geoLayerView.geoLayerId +
              '\' is using EPSG:' + geoRasterLayer.projection + '. Layer will not be displayed on map.');
          }
          // Add the newly created Leaflet layer to the MapLayerManager, and if
          // it has the selectedInitial field set to true (or it's not given) add
          // it to the Leaflet map. If false, don't show it yet.
          this.mapLayerManager.addLayerItem(geoRasterLayer, geoLayer, geoLayerView, geoLayerViewGroup, true);
          let layerItem: MapLayerItem = this.mapLayerManager.getMapLayerItem(geoLayer.geoLayerId);
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
    // Check to see if the layer needs to be refreshed. Don't need to check if it's
    // a raster layer, it has to be to get to this code.
    if (geoLayerView.properties.refreshInterval) {
      var refreshInterval = this.getRefreshInterval(geoLayerView.geoLayerId);
      var refreshOffset = this.getRefreshOffset(geoLayerView.geoLayerId, refreshInterval);
      // Check if the parsing was successful. 
      if (isNaN(refreshInterval)) {
      } else {
        this.refreshLayer(refreshOffset, refreshInterval, geoLayer,
                          IM.RefreshType.raster, geoLayerView);
      }

    }
  }

  /**
  * Creates the sidebar on the left side of the map using `leaflet-sidebar-v2`.
  */
  private createSidebar(): void {
    this.logger.print('trace', 'MapComponent.createSidebar - Initializing Leaflet map sidebar.',
    this.debugFlag, this.debugLevelFlag);

    var _this = this;

    var isMobile = (this.currentScreenSize === Breakpoints.XSmall ||
    this.currentScreenSize === Breakpoints.Small);
    
    // Create the sidebar instance and add it to the map. 
    var sidebar = L.control.sidebar({
      container: _this.mapConfig.geoMaps[0].geoMapId + '-sidebar'
    });
    // On initialization check if on a small screen and if the sidebar has already
    // been initialized, add it to the map, and either open it or keep it closed.
    if (isMobile === true && !this.sidebarInitialized) {
      this.logger.print('trace',
      'MapComponent.createSidebar - Mobile screen size of either XSmall or Small detected. Keeping sidebar closed.',
      this.debugFlag, this.debugLevelFlag);

      this.logger.print('trace',
      'MapComponent.createSidebar - Adding sidebar to the following map:',
      this.debugFlag, this.debugLevelFlag);
      this.logger.print('trace', this.mainMap, this.debugFlag, this.debugLevelFlag);

      sidebar.addTo(this.mainMap);
    } else {
      this.logger.print('trace',
      'MapComponent.createSidebar - Desktop screen size detected. Opening sidebar.',
      this.debugFlag, this.debugLevelFlag);

      this.logger.print('trace',
      'MapComponent.createSidebar - Adding sidebar to the following map:',
      this.debugFlag, this.debugLevelFlag);
      this.logger.print('trace', this.mainMap, this.debugFlag, this.debugLevelFlag);

      sidebar.addTo(this.mainMap).open('home');
    }
    
    this.addInfoToSidebar();
    this.sidebarInitialized = true;
  }

  /**
   * Creates all background (tile) layers on the Leaflet map by using properties
   * from the map configuration layer.
   */
  private createMapBackgroundLayers(): void {

    // Create background layers from the configuration file.
    let backgroundLayers: any[] = this.getBackgroundLayers();
    // Iterate over each background layer, create them using tileLayer, and add
    // them to the mapBackgroundLayers class object.
    backgroundLayers.forEach((geoLayer: IM.GeoLayer) => {
      let leafletBackgroundLayer = L.tileLayer(geoLayer.sourcePath, {
        attribution: geoLayer.properties.attribution,
        maxZoom: geoLayer.properties.zoomLevelMax ? parseInt(geoLayer.properties.zoomLevelMax) : 18
      });
      this.mapBackgroundLayers[this.getBackgroundGeoLayerViewFromId(geoLayer.geoLayerId).name] = leafletBackgroundLayer;

      var backgroundGeoLayerView = this.getBackgroundGeoLayerViewFromId(geoLayer.geoLayerId);
      
      if (backgroundGeoLayerView.properties.refreshInterval) {
        var refreshInterval = this.getRefreshInterval(backgroundGeoLayerView.geoLayerId);
        var refreshOffset = this.getRefreshOffset(backgroundGeoLayerView.geoLayerId, refreshInterval);
        // Check if the parsing was successful. 
        if (isNaN(refreshInterval)) {
        } else {
          this.refreshLayer(refreshOffset, refreshInterval, geoLayer, IM.RefreshType.tile,
            null, leafletBackgroundLayer);
        }
  
      }
    });
  }

  /**
   * Initializes the content of the topleft title card div area.
   */
  private createMapTitleInitial(): void {

    let div: HTMLElement = L.DomUtil.get(this.geoMapId + '-title-card');

    // Media query. This is not perfect yet.
    // var mobileMatch = window.matchMedia("(max-width: 600px)");

    // function test(mobileMatch: any) {
    //   if (mobileMatch.matches) {
    //     div.style.display = 'none';
    //   }
    //   else {
    //     div.style.display = 'block';
    //   }
    // }
    // mobileMatch.addEventListener('change', test);

    let instruction: string = "Move over or click on a feature for more information";
    let divContents: string = "";

    divContents = ('<h4 id="geoLayerView">' + this.geoMapName +
    '</h4>' + '<p id="point-info"></p>');

    if (instruction !== "") {
      divContents += ('<hr class="upper-left-map-info-divider"/>' + '<p id="instructions"><i>' +
      instruction + '</i></p>');
    }
    div.innerHTML = divContents;
  }

  /**
   * 
   * @returns 
   */
  private createMousePositionControl(): any {
    
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
    return mousePosition;
  }

  /**
   * 
   * @returns 
   */
  private createZoomLevelControl(): any {
    var _this = this;

    let mapZoom = L.control({ position: 'bottomleft' });
    mapZoom.onAdd = function() {
      // Have Leaflet create a div with the class name zoomInfo.
      this._container = L.DomUtil.create('div', 'zoomInfo');
      // When the map is created for the first time, call update to display zoom.
      this.update();
      // On subsequent zoom events (at the end of the zoom) update the innerHTML
      // again, and round to tenths.
      _this.mainMap.on('zoomend', function () {
        this._container.innerHTML = '<div id="zoomInfo">Zoom Level: ' +
        _this.mainMap.getZoom().toFixed(1) + '</div>';
      }, this);
      return this._container;
    };
    mapZoom.update = function () {
      this._container.innerHTML = '<div id="zoomInfo">Zoom Level: ' +
      _this.mainMap.getZoom().toFixed(1) + '</div>';
    };

    return mapZoom;
  }

  /**
  * Unused.
  */
  findFromAddress() {
    var testAddress = 'https://api.geocod.io/v1.6/geocode' +
    '?q=1109+N+Highland+St%2c+Arlington+VA&api_key=e794ffb42737727f9904673702993bd96707bf6';
    this.commonService.getJSONData(testAddress).subscribe((address: any) => {
    });
  }

  /**
   * @returns The background layer geoLayerView that matches the provided @var id.
   * @param id The geoLayerId that needs to be matched
   */
  private getBackgroundGeoLayerViewFromId(id: string) {
    for (let geoMap of this.mapConfig.geoMaps) {
      for (let geoLayerViewGroup of geoMap.geoLayerViewGroups) {
        if (geoLayerViewGroup.properties.isBackground === 'true') {
          for (let geoLayerView of geoLayerViewGroup.geoLayerViews) {
            if (geoLayerView.geoLayerId === id) {
              return geoLayerView;
            }
          }
        }
      }
    }
  }

  /**
   * @returns An array of geoLayers containing each background layer as an object
   */
  private getBackgroundLayers(): any[] {
    let backgroundLayers: any[] = [];
    
    for (let geoMap of this.mapConfig.geoMaps) {
      geoMap.geoLayers.forEach((geoLayer: any) => {
        if (geoLayer.properties.isBackground === 'true')
          backgroundLayers.push(geoLayer);
      });
    }
    return backgroundLayers;
  }

  /**
   * Goes through each geoMap, geoLayerViewGroup, and geoLayerView in a geoMapProject
   * and returns the FIRST occurrence of a background layer that has the selectedInitial
   * property set to true, effectively getting the default background layer.
   */
  private getDefaultBackgroundLayer(): string {
    for (let geoMap of this.mapConfig.geoMaps) {
      for (let geoLayerViewGroup of geoMap.geoLayerViewGroups) {
        if (geoLayerViewGroup.properties.isBackground &&
          geoLayerViewGroup.properties.isBackground.toUpperCase() === 'TRUE') {
          for (let geoLayerView of geoLayerViewGroup.geoLayerViews) {
            if (geoLayerView.properties.selectedInitial &&
              geoLayerView.properties.selectedInitial.toUpperCase() === 'TRUE') {
              return geoLayerView.name;
            }
          }
        }
      }
    }
    return '';
  }

  /**
   * @returns An array of the three provided ExtentInitial numbers to be used for
   * initial map creation.
   */
  private getExtentInitial(): number[] {
    // Make sure to do some error handling for incorrect input.
    if (!this.mapConfig.geoMaps[0].properties.extentInitial) {
      console.error("Map Configuration property '" +
        this.mapConfig.geoMaps[0].properties.extentInitial +
        "' is incorrectly formatted. Confirm property is extentInitial." +
        "Setting ZoomLevel to '[0, 0], 0' for world-wide view")
      // Return a default array with all 0's so it's quite obvious the map created
      // is not intended.
      return [0, 0, 0];
    }
    var finalExtent: number[];
    let extentInitial: string = this.mapConfig.geoMaps[0].properties.extentInitial;
    let splitInitial: string[] = extentInitial.split(':');

    if (splitInitial[0] === 'ZoomLevel' && splitInitial[1].split(',').length !== 3)
      console.error("ZoomLevel inputs of " + splitInitial[1] + " is incorrect. " +
      "Usage for a ZoomLevel property is 'ZoomLevel:Longitude, Latitude, Zoom Level'");

    try {
      // Try to convert all strings in the split array to numbers to return as a
      // number array for the initial extent.
      finalExtent = splitInitial[1].split(',').map(x => +x);
    } catch (e) {
      console.error(e.message);
      console.error('Latitude, Longitude and Zoom Level must all be integer or decimal numbers');
      console.error('Setting ZoomLevel to \'[0, 0], 0\' for world-wide view');
      return [0, 0, 0];
    }
    return finalExtent;
  }

  /**
   * @returns a geoLayer object in the geoMapProject whose geoLayerId matches the @param id
   * @param id The geoLayerId to be matched with
   */
  private getGeoLayerFromId(id: string): any {
    for (let geoMap of this.mapConfig.geoMaps) {
      for (let geoLayer of geoMap.geoLayers) {
        if (geoLayer.geoLayerId === id) {
          return geoLayer;
        }
      }
    }
    return '';
  }

  /**
   * Return the geoLayerView that matches the given geoLayerId.
   * @param id The given geoLayerId to match with.
   */
  private getGeoLayerView(id: string) {

    for (let geoMap of this.mapConfig.geoMaps) {
      for (let geoLayerViewGroup of geoMap.geoLayerViewGroups) {
        for (let geoLayerView of geoLayerViewGroup.geoLayerViews) {
          if (geoLayerView.geoLayerId === id) {
            return geoLayerView;
          }
        }
      }
   }
    return null;
  }

  /**
   * @returns an array of eventHandler objects from the geoLayerView whose geoLayerId
   * matches the given @param geoLayerId.
   * @param geoLayerId The geoLayerId to match with.
   */
  private getGeoLayerViewEventHandler(geoLayerId: string): IM.EventHandler[] {

    var geoLayerViewGroups: any = this.mapConfig.geoMaps[0].geoLayerViewGroups;

    for (let geoLayerViewGroup of geoLayerViewGroups) {
      if (!geoLayerViewGroup.properties.isBackground ||
        geoLayerViewGroup.properties.isBackground === 'false') {
        for (let geoLayerView of geoLayerViewGroup.geoLayerViews) {
          if (geoLayerView.geoLayerId === geoLayerId) {
            return geoLayerView.eventHandlers;
          }
        }
      }
    }
    return [];
  }

  /**
   * Iterates over each geoLayerViewGroup in the geoMap and pushes each geoLayerView's
   * geoLayerId in the order they are given, so the InfoMapper knows the order in
   * which they should be draw on the Leaflet map.
   */
  private getMapConfigLayerOrder(): string[] {
    var layerArray: string[] = [];

    for (let geoMap of this.mapConfig.geoMaps) {
      for (let geoLayerViewGroup of geoMap.geoLayerViewGroups) {
        if (!geoLayerViewGroup.properties.isBackground ||
        geoLayerViewGroup.properties.isBackground === 'false') {
          for (let geoLayerView of geoLayerViewGroup.geoLayerViews) {
            layerArray.push(geoLayerView.geoLayerId);
          }
        }
      }
    }
    // Reverse the array here, since we'll start on the layer that should be at
    // the bottom, bring it to the front of Leaflet map, move on to the layer that
    // should be on top of the bottom layer, bring it to the front, and so on.
    return layerArray.reverse();
  }

  /**
   * Returns the geoLayerView's refreshInterval property, converted to a number
   * if it can be, and 0 if not.
   * @param geoLayerId The geoLayerId to match with.
   */
  getRefreshInterval(geoLayerId: string): number {
    // Obtain the refreshInterval string and convert to upper case.
    var rawInterval: string = this.getGeoLayerView(geoLayerId).properties.refreshInterval.toUpperCase();
    var splitInterval = rawInterval.split(' ');
    var refreshInterval = 0;

    // Iterate over each spaced item in the string and insert each number in the
    // delayArr in the order HR, MIN, SEC.
    for (var elem of splitInterval) {
      if (elem.includes('H')) {
        var hours = elem.split('H')[0];
        refreshInterval += (+hours * 3600000)
      } else if (elem.includes('MIN')) {
        var minutes = elem.split('MIN')[0];
        refreshInterval += (+minutes * 60000)
      } else if (elem.includes("SEC")) {
        var seconds = elem.split('SEC')[0];
        refreshInterval += (+seconds * 1000)
      } else if (!isNaN(+elem)) {
        // The refreshInterval string is attempted to be converted to a number.
        // The + is successful if the string contains only numeric characters, including
        // periods, otherwise it returns NaN. Return the number given as seconds.
        refreshInterval += (+elem * 1000);
      }
    }

    if (refreshInterval < 30000) {
      console.error('Refresh interval is less than 30 seconds, and must be greater. ' +
      'Skipping layer refresh');
      return NaN;
    }

    return refreshInterval;
  }

  /**
   * Obtain and parse the refreshOffset property from the geoLayerView.
   * @param geoLayerId 
   * @param refreshInterval 
   * @returns The offset in milliseconds, and 0 if none is given.
   */
  getRefreshOffset(geoLayerId: string, refreshInterval: number): number {
    var rawOffset = this.getGeoLayerView(geoLayerId).properties.refreshOffset;
    var refreshOffset = 0;

    // If no offset is given, use the refresh interval and start from midnight.
    if (!rawOffset) {
      return this.setRefreshOffset(refreshInterval);
    }
    // If refreshOffset is given, use it starting at midnight to determine the offset.
    else {
      // Obtain the refreshOffset string and convert to upper case.
      var rawOffset = rawOffset.toUpperCase();
      var splitOffset = rawOffset.split(' ');

      // Iterate over each spaced item in the string and insert each number in the
      // delayArr in the order HR, MIN, SEC.
      for (var elem of splitOffset) {
        if (elem.includes('H')) {
          var hours = elem.split('H')[0];
          refreshOffset += (+hours * 3600000);
        } else if (elem.includes('MIN')) {
          var minutes = elem.split('MIN')[0];
          refreshOffset += (+minutes * 60000);
        } else if (elem.includes("SEC")) {
          var seconds = elem.split('SEC')[0];
          refreshOffset += (+seconds * 1000);
        } else if (!isNaN(+elem)) {
          // See comment for this line in refreshInterval() above.
          refreshOffset += (+elem * 1000);
        }
      }
      // If the offset is greater than 24 hours, let user know it must be less,
      // and run the default.
      if (refreshOffset > 86400000) {
        console.error('Refresh interval is greater than 24 hours, and must be less. ' +
        'Setting offset to midnight.');
        return this.setRefreshOffset(refreshInterval);
      }
      // Finally, find the offset.
      return this.setRefreshOffset(refreshInterval, refreshOffset);
    }
  }

  /**
   * @returns A geoLayerSymbol object from the geoLayerView whose geoLayerId matches
   * with @param id.
   * @param id The geoLayerId to match with.
   */
  private getSymbolDataFromID(id: string): IM.GeoLayerSymbol {
    var geoLayerViewGroups: any = this.mapConfig.geoMaps[0].geoLayerViewGroups;

    for (let geoLayerViewGroup of geoLayerViewGroups) {
      for (let geoLayerView of geoLayerViewGroup.geoLayerViews) {
        if (geoLayerView.geoLayerId === id) {
          return geoLayerView.geoLayerSymbol;
        }
      }
    }
    return {

    };
  }

  /**
   * Initialize a map for a full application if no parameter is given, or for a
   * standalone map if the true boolean is provided.
   */
  private initMapSettings(standalone?: string, configPath?: string): void {

    // Immediately reset both standalone paths. This will prevent unwanted behavior
    // whether a user navigates to another page by going to an actual map or just
    // moving from dashboard to dashboard.
    this.appConfigStandalonePath = this.mapConfigStandalonePath = undefined;
    let fullMapConfigPath = this.commonService.getAppPath() +
    // Get AND sets the map config path and geoJson path for relative path use.
    this.commonService.getFullMapConfigPath(this.mapID, standalone, configPath);

    this.commonService.getJSONData(fullMapConfigPath, IM.Path.fMCP, this.mapID)
    .pipe(first()).subscribe((mapConfig: IM.GeoMapProject) => {

      this.logger.print('info', 'MapComponent.ngAfterViewInit - Map initialization for geoMapId "' + 
      mapConfig.geoMaps[0].geoMapId + '".');

      // Set the configuration file class variable for the map service.
      // this.commonService.setMapConfig(mapConfig);
      this.mapConfig = mapConfig;
      this.leafletMapContainerId = this.geoMapId;

      // Listen for any changes or additions of query parameters in the URL.
      if (this.commonService.useQueryParams) {
        this.queryParamMapSub = this.actRoute.queryParamMap.subscribe((queryParamMap: ParamMap) => {
          this.handleQueryParams(queryParamMap);
        });
      }

      // Once the mapConfig object is retrieved and set, set the order in which
      // each layer should be displayed. Get an instance of the singleton MapLayerManager
      // class and set the mapConfigLayerOrder variable so it can be used to order
      // layers instead of the map service
      let mapLayerManager: MapLayerManager = MapLayerManager.getInstance();
      mapLayerManager.setMapConfigLayerOrder(this.getMapConfigLayerOrder());
      
      // Create the map.
      this.checkIfMapContainerExists();
    });
  }

  /**
  * This function is called on initialization of the map component, after the constructor.
  * Use the following in the URL to show more debug messages: ?debug=true&debugLevel=trace
  */
  ngAfterViewInit() {

    // Subscribe to all changes made to the URL.
    this.paramMapSub = <any>Subscription;
    this.paramMapSub = this.actRoute.paramMap.subscribe((paramMap: ParamMap) => {
      
      this.debugFlag = paramMap.get('debug');
      this.debugLevelFlag = paramMap.get('debugLevel');

      if (!this.router.url.toLowerCase().includes('/map/') &&
      !this.appConfigStandalonePath && !this.mapConfigStandalonePath) {
        return;
      }

      this.setMapDefaultVars();
      this.mapID = paramMap.get('id');
      this.validMapID = this.commonService.validID(this.mapID);
      // If an invalid map ID, displays the Map 404 page.
      if (this.validMapID === false) {
        return;
      }

      // Standalone Map for website embedding.
      if (this.appConfigStandalonePath) {
        this.commonService.getJSONData(this.appConfigStandalonePath)
        .subscribe((appConfig: any) => {

          this.commonService.setAppConfig(appConfig);
          this.initMapSettings('app');
        });
      }
      // Standalone map for use in another Angular module.
      else if (this.mapConfigStandalonePath) {
        this.initMapSettings('map', this.mapConfigStandalonePath);
      }
      // A 'normal' map to display.
      else {
        this.initMapSettings();
      }

    });

  }

  /**
  * Called once, before this Map Component instance is destroyed.
  */
  ngOnDestroy(): void {

    // Unsubscribe from all subscriptions that occurred in the Map Component.
    if (this.forkJoinSub) {
      this.forkJoinSub.unsubscribe();
    }
    if (this.paramMapSub) {
      this.paramMapSub.unsubscribe();
    }
    if (this.queryParamMapSub) {
      this.queryParamMapSub.unsubscribe();
    }

    if (this.mainMap) {
      // If a popup is open on the map and a Content Page button is clicked on, then
      // this Map Component will be destroyed. Instead of resetting the map variables,
      // close the popup before the map is destroyed.
      this.mainMap.closePopup();
      // Destroy the map and all attached event listeners.
      this.mainMap.remove();
    }
    
    // Finish up with the Subject observing for screen changes.
    this.destroyed.next();
    this.destroyed.complete();
  }

  /**
   * Refresh or direct URL with query parameter.
   * @param queryParamMap 
   */
  private handleQueryParams(queryParamMap: ParamMap): void {

    console.log('handleQueryParams queryParamMap:', queryParamMap);
    console.log('Number of already existing query parameters:', this.windowManager.amountExistingQueryParams);

    for (let i = 0; i < this.windowManager.amountExistingQueryParams; ++i) {

      const queryWindowType = this.windowManager.canOpenWindow(queryParamMap, i);
      // If the dialog doesn't already exist in the window manager, open it up.

      switch(queryWindowType) {
        case WindowType.DOC: {
          this.openDocDialog({
            location: queryParamMap.get('stuff')
          });
        }
      }
    }
    
  }

  /**
   * Button click.
   * @param geoDialogDocId 
   */
  setupDialogOpen(windowType: WindowType, dialogParams?: DialogParams): any {
    
    // Use query parameters.
    if (this.commonService.useQueryParams) {

      var extras: NavigationExtras = {
        queryParams: this.windowManager.getAllOpenQueryParams()
      };
      var dialogWindowId: string;

      switch(windowType) {
        case WindowType.DOC: {

          dialogWindowId = this.geoMapId;
          if (this.windowManager.windowExists(dialogWindowId)) { return false; }

          extras.queryParams[this.windowManager.setQueryParamTypeKey()] = dialogParams.location;
          extras.queryParams[this.windowManager.setQueryParamIdKey()] = dialogWindowId;
          this.router.navigate([], extras);
      
          this.openDocDialog(dialogParams);
          break;
        }

        case WindowType.TEXT: {

          if (this.windowManager.windowExists(dialogParams.windowID)) { return false; }

          extras.queryParams[this.windowManager.setQueryParamTypeKey()] = dialogParams.location;
          extras.queryParams[this.windowManager.setQueryParamIdKey()] = dialogParams.windowID;
          this.router.navigate([], extras);
      
          this.openTextDialog(dialogParams);
          break;
        }
      }
      
    }
    // Don't use query parameters.
    if (!this.commonService.useQueryParams) {

      switch(windowType) {
        case WindowType.DOC: {
          this.openDocDialog(dialogParams);
          break;
        }
        case WindowType.TEXT: {
          this.openTextDialog(dialogParams);
          break;
        }
      }
      
    }
  }

  /**
   * Opens a D3 visualization Dialog with the necessary configuration data.
   * @param geoLayer The layer geoLayer object.
   * @param d3Prop The D3 visualization's property object from the config file.
   */
  openD3VizDialog(geoLayer: IM.GeoLayer, d3Prop: IM.D3Prop): void {

    var windowID = geoLayer.geoLayerId + '-dialog-d3-viz';
    if (!this.windowManager.addWindow(windowID, WindowType.D3)) {
      return;
    }

    var dialogConfigData = {
      d3Prop: d3Prop,
      geoLayer: geoLayer,
      windowID: windowID
    }
      
    var dialogRef: MatDialogRef<DialogD3Component, any> = this.dialog.open(
      DialogD3Component, this.createDialogConfig(dialogConfigData)
    );
  }

  /**
  * When the info button by the side bar slider is clicked, it will either show a
  * popup or separate tab containing the documentation for the selected geoLayerViewGroup
  * or geoLayerView.
  * @param docPath The string representing the path to the documentation file.
  * @param geoId The geoMapId, geoLayerViewGroupId, or geoLayerViewId for the layer.
  */
  openDocDialog(params: DialogParams): void {

    const windowID = this.geoMapId;
    if (!this.windowManager.addWindow(windowID, WindowType.DOC, params.location)) {
      return;
    }

    var text: boolean, markdown: boolean, html: boolean;
    // Set the type of display the Mat Dialog will show
    if (this.geoMapDocPath.includes('.txt')) text = true;
    else if (this.geoMapDocPath.includes('.md')) markdown = true;
    else if (this.geoMapDocPath.includes('.html')) html = true;

    this.commonService.getPlainText(
      this.commonService.buildPath(IM.Path.dP, [this.geoMapDocPath]), IM.Path.dP
    )
    .pipe(take(1)).subscribe((doc: any) => {

      var dialogConfigData = {
        doc: doc,
        docPath: this.geoMapDocPath,
        docText: text,
        docMarkdown: markdown,
        docHtml: html,
        fullMarkdownPath: this.commonService.getFullMarkdownPath(),
        geoId: this.geoMapId,
        geoName: this.geoMapName,
        mapConfigPath: this.commonService.getMapConfigPath(),
        windowID: windowID
      }

      const docDialog: MatDialogRef<DialogDocComponent, any> = this.dialog.open(
        DialogDocComponent, this.createDialogConfig(dialogConfigData)
      );
      // Remove the query parameter for this dialog, but keep any other open dialog's
      // query parameter.
      docDialog.afterClosed().pipe(first()).subscribe(() => {
        this.router.navigate(['.'], {
          relativeTo: this.actRoute,
          queryParams: this.windowManager.getAllOpenQueryParams()
        });
      });

    });
  }

  /**
  * When a Gapminder button is clicked from the Leaflet popup, create the Gapminder
  * Dialog and sent it the data it needs.
  * @param resourcePath The resourcePath string representing the absolute or relative
  * path to the resourcePath property.
  */
  private openGapminderDialog(geoLayer: IM.GeoLayer, resourcePath: string): any {

    var windowID = geoLayer.geoLayerId + '-dialog-gapminder';
    if (!this.windowManager.addWindow(windowID, WindowType.GAP)) {
      return;
    }

    let fullGapminderPath = this.commonService.buildPath(IM.Path.rP, [resourcePath]);
    this.commonService.setGapminderConfigPath(fullGapminderPath);
    
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      configPath: fullGapminderPath,
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
  }

  /**
   * 
   * @param geoLayer The geoLayer object from the map configuration file.
   */
  private openHeatmapDialog(geoLayer: any, graphTemplate: IM.GraphTemplate, graphFilePath: string): void {

    var windowID = geoLayer.geoLayerId + '-dialog-heatmap';
    if (!this.windowManager.addWindow(windowID, WindowType.HEAT)) {
      return;
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      geoLayer: geoLayer,
      graphFilePath: graphFilePath,
      graphTemplate: graphTemplate,
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
      maxWidth: "95vw"
    });

  }

  /**
  * Gets data asynchronously for creating and opening a Material Dialog that displays
  * an Image Gallery. 
  * @param geoLayer The geoLayer object from the map configuration file.
  * @param feature The feature object containing this feature's properties and values.
  * @param featureIndex A number representing the index of the image clicked on.
  * @param resourcePath A string representation of the path to the CSV configuration
  * file for the Image Gallery.
  */
  private openImageGalleryDialog(geoLayer: any, feature: any, featureIndex: number, resourcePath: string,
    geoLayerView: any, eventObject: any): void {

    var windowID = geoLayer.geoLayerId + '-dialog-gallery';
    if (!this.windowManager.addWindow(windowID, WindowType.GAL)) {
      return;
    }

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
          allFeatures: this.allFeatures[geoLayer.geoLayerId],
          eventActions: this.eventActions,
          eventObject: eventObject,
          feature: feature,
          featureIndex: featureIndex,
          geoLayerId: geoLayer.geoLayerId,
          geoLayerView: geoLayerView,
          mainMap: this.mainMap,
          papaResult: result.data,
          mapLayerItem: this.mapLayerManager.getMapLayerItem(geoLayer.geoLayerId)
        }
        const dialogRef: MatDialogRef<DialogGalleryComponent, any> = this.dialog.open(DialogGalleryComponent, {
          data: dialogConfig,
          hasBackdrop: false,
          panelClass: ['custom-dialog-container', 'mat-elevation-z24'],
          height: "650px",
          width: "910px",
          minHeight: "450px",
          minWidth: "650px",
          maxHeight: "70vh",
          maxWidth: "95vw"
        });
      }
    });

  }

  /**
  * Creates the Dialog object to show the graph in and passes the info needed for it.
  * @param graphTemplate The template config object of the current graph being shown
  * @param graphFilePath The file path to the current graph that needs to be read
  */
  private openTSGraphDialog(graphTemplate: IM.GraphTemplate, graphFilePath: string, TSIDLocation: string,
  chartPackage: string, featureProperties: any, downloadFileName?: string, windowID?: string): void {

    if (!this.windowManager.addWindow(windowID, WindowType.TSGRAPH)) {
      return;
    }

    var dialogConfigData = {
      windowID: windowID,
      chartPackage: chartPackage,
      featureProperties: featureProperties,
      graphTemplate: graphTemplate,
      graphFilePath: graphFilePath,
      mapConfigPath: this.commonService.getMapConfigPath(),
      // This cool piece of code uses quite a bit of syntactic sugar. It dynamically
      // sets the saveFile based on the condition that saveFile is defined, using
      // the spread operator. More information here:
      // https://medium.com/@oprearocks/what-do-the-three-dots-mean-in-javascript-bc5749439c9a
      ...(downloadFileName && { downloadFileName: downloadFileName }),
      TSIDLocation: TSIDLocation
    }

    const dialogRef: MatDialogRef<DialogTSGraphComponent, any> = this.dialog.open(
      DialogTSGraphComponent, this.createDialogConfig(dialogConfigData));

  }

  /**
  * Creates a Dialog object to show a plain text file and passes the info needed
  * for it.
  * @param text The text retrieved from the text file to display in the Dialog Content
  * .popup
  * @param resourcePath The path to the text file so the file name can be extracted
  * in the dialog-text component.
  * @param windowID A string representing the button ID of the button clicked to
  * open this dialog.
  */
  private openTextDialog(params: DialogParams): void {

    if (!this.windowManager.addWindow(params.windowID, WindowType.TEXT, params.location)) {
      return;
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      windowID: params.windowID,
      mapConfigPath: this.commonService.getMapConfigPath(),
      resourcePath: params.fullResourcePath,
      text: params.text
    }

    const textDialog: MatDialogRef<DialogTextComponent, any> = this.dialog.open(DialogTextComponent, {
      data: dialogConfig,
      // This stops the dialog from containing a backdrop, which means the background
      // opacity is set to 0, and the entire InfoMapper is still navigable while
      // having the dialog open. This way, you can have multiple dialogs open at
      // the same time.
      hasBackdrop: false,
      panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
      height: "750px",
      width: "900px",
      minHeight: "290px",
      minWidth: "450px",
      maxHeight: "90vh",
      maxWidth: "90vw"
    });

    // Remove the query parameter for this dialog, but keep any other open dialog's
    // query parameter.
    textDialog.afterClosed().pipe(first()).subscribe(() => {
      this.router.navigate(['.'], {
        relativeTo: this.actRoute,
        queryParams: this.windowManager.getAllOpenQueryParams()
      });
    });
  }

  /**
   * Creates the rxjs timer with the delay between refreshes for a given layer.
   * @param refreshInterval The number in seconds to wait for each layer refresh.
   * @param geoLayer The geoLayer object from the map configuration file.
   */
  private refreshLayer(refreshOffset: number, refreshInterval: number, geoLayer: IM.GeoLayer,
  refreshType: IM.RefreshType, geoLayerView?: IM.GeoLayerView, bgLayer?: any): void {

    // The initial time the layer was created. To be shown so users know this layer
    // will be refreshed.
    this.setRefreshDateTime(geoLayer, refreshInterval);
    
    // Wait the refreshInterval, then keep waiting by the refreshInterval from then on.
    const delay = timer(refreshOffset, refreshInterval);
    // Adds each refresh subscription after the first as child subscriptions
    // (in case of multiple refreshing layers), so when unsubscribing occurs
    // at component destruction, all are unsubscribed from.
      delay.pipe(takeUntil(this.destroyed)).subscribe(() => {

      // Update the MatTooltip date display string on the sidebar geoLayerView name.
      this.setRefreshDateTime(geoLayer, refreshInterval);

      // Refresh a vector layer.
      if (refreshType === IM.RefreshType.vector) {
        this.commonService.getJSONData(
          this.commonService.buildPath(IM.Path.gLGJP, [geoLayer.sourcePath])
        ).pipe(first()).subscribe((geoJsonData: any) => {

          // Use the Map Layer Manager to remove all layers from the Leaflet layer,
          // and then add the new data back. This way, the layer will still be
          // known to the manager.
          this.mapLayerManager.getMapLayerItem(geoLayer.geoLayerId).getItemLeafletLayer().clearLayers();
          this.mapLayerManager.getMapLayerItem(geoLayer.geoLayerId).getItemLeafletLayer().addData(geoJsonData);
          // Reset the layer order.
          this.mapLayerManager.setLayerOrder();
        });
      }

      // Refresh a raster layer.
      else if (refreshType === IM.RefreshType.raster) {
        // First remove the raster layer.
        this.mapLayerManager.getMapLayerItem(geoLayer.geoLayerId).getItemLeafletLayer().remove();
        
        // Uses the fetch API with the given path to get the tiff file in assets
        // to create the raster layer.
        fetch(this.commonService.buildPath(IM.Path.raP, [geoLayer.sourcePath]))
        .then((response: any) => response.arrayBuffer())
        .then((arrayBuffer: any) => {
          parseGeoRaster(arrayBuffer).then((georaster: any) => {

            const symbol = geoLayerView.geoLayerSymbol;
            
            // The classificationFile attribute exists in the map configuration
            // file, so use that file path for Papaparse.
            if (symbol && symbol.properties.classificationFile) {
              this.categorizedLayerColors[geoLayer.geoLayerId] = [];

              Papa.parse(this.commonService.buildPath(IM.Path.cP, [symbol.properties.classificationFile]), {
                delimiter: ",",
                download: true,
                comments: "#",
                skipEmptyLines: true,
                header: true,
                complete: (result: any, file: any) => {

                  if (symbol.classificationType.toUpperCase() === 'CATEGORIZED') {
                    // Populate the categorizedLayerColors object with the results
                    // from the classification file if the geoLayerSymbol attribute
                    // classificationType is Categorized.
                    this.assignCategorizedFileColor(result.data, geoLayer.geoLayerId);
                  } else if (symbol.classificationType.toUpperCase() === 'GRADUATED') {
                    // Populate the graduatedLayerColors array with the results
                    // from the classification file if the geoLayerSymbol attribute
                    // classificationType is Graduated.
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
                  this.mapLayerManager.getMapLayerItem(geoLayer.geoLayerId).addLeafletLayer(geoRasterLayer, this.mainMap);
                }
              });
            }
            // No classificationFile attribute was given in the config file, so
            // just create a default raster layer.
            else {
              var geoRasterLayer = new GeoRasterLayer({
                // Create a custom drawing scheme for the raster layer. This might
                // overwrite pixelValuesToColorFn()
                customDrawFunction: ({ context, values, x, y, width, height }) => {
                  if (values[0] === 255 || values[0] === 0) {
                    context.fillStyle = `rgba(${values[0]}, ${values[0]}, ${values[0]}, 0)`;
                  } else {
                    context.fillStyle = `rgba(${values[0]}, ${values[0]}, ${values[0]}, 0.7)`;
                  }
                  context.fillRect(x, y, width, height);
                },
                debugLevel: 0,
                georaster: georaster,
                opacity: 0.7
              });
              // If the CRS given is not 4326, log the error and let the user know
              // the layer won't be shown.
              if (geoRasterLayer.projection !== 4326) {
                console.error('InfoMapper requires raster layers to use EPSG:4326 CRS. Layer \'' + geoLayerView.geoLayerId +
                  '\' is using EPSG:' + geoRasterLayer.projection + '. Layer will not be displayed on map.');
              }
              // Add the newly created Leaflet layer to the MapLayerManager, and if
              // it has the selectedInitial field set to true (or it's not given) add
              // it to the Leaflet map. If false, don't show it yet.
              this.mapLayerManager.getMapLayerItem(geoLayer.geoLayerId).addLeafletLayer(geoRasterLayer, this.mainMap);
            }
          });
        });
      }

      // Refresh a tile (background) layer.
      else if (refreshType === IM.RefreshType.tile) {
        bgLayer.redraw();
      }

      // Refresh an image layer.
      else if (refreshType === IM.RefreshType.image) {

        const symbol = geoLayerView.geoLayerSymbol;
        this.mapLayerManager.getMapLayerItem(geoLayer.geoLayerId).getItemLeafletLayer().remove();

        var imageLayer = L.imageOverlay(
          this.commonService.buildPath(IM.Path.iP, [geoLayer.sourcePath]),
          MapUtil.parseImageBounds(geoLayerView.properties.imageBounds),
          {
            opacity: MapUtil.verify(symbol.properties.opacity, IM.Style.opacity)
          }
        );

        // Add the newly created Leaflet layer to the MapLayerManager.
        this.mapLayerManager.getMapLayerItem(geoLayer.geoLayerId).addLeafletLayer(imageLayer, this.mainMap);
        this.mapLayerManager.setLayerOrder();
      }
      
    })
    // );
  }

  /**
  * Refreshes, re-initializes, and unsubscribes from necessary subscriptions being
  * used by map variables when a new map component instance is created.
  */
  private setMapDefaultVars(): void {
    // First clear the map
    if (this.mapInitialized === true) {
      // Before the map is removed - and there can only be one popup open at a time
      // on the map - close it. This is used when another map menu button is clicked
      // on, and the Map Component is not destroyed.
      this.mainMap.closePopup();
      // Remove all event listeners on the map and destroy the map
      this.mainMap.remove();
    }
    // Since a new Leaflet map is created, it needs to be reinitialized.
    this.mapInitialized = false;
    // Reset the mapConfigLayerOrder variable in the commonService, which contains
    // the list of ordered geoLayerView geoLayerId's for ordering the layers on the
    // map. If it isn't reset, the array will keep being appended to.
    this.mapLayerManager.resetMapLayerManagerVariables();
    // Reset the count for numbering each feature in a layer that contains an Image
    // Gallery, as the count is only set to 0 when ngAfterViewInit is called. It
    // won't be called if another menu in the InfoMapper is clicked on and changed
    // to another map.
    this.count = 1;

    // If the previous map had at least one layer that refreshes, the refresh
    // subscription will need to be unsubscribed from when navigated away.
    this.destroyed.next();
    this.destroyed.complete();
    this.destroyed = new Subject<void>();
  }

  /**
   * 
   */
  private scrollToggle(): void {

    var scrollToggleTooltipSpanElement = this.document.querySelector('#' +
    this.mapConfig.geoMaps[0].geoMapId + '-scroll-toggle-tooltip');

    if (scrollToggleTooltipSpanElement) {

      var leafletMap = this.mapManager.getMap(this.mapConfig.geoMaps[0].geoMapId);

      if (leafletMap.scrollWheelZoom.enabled()) {
        leafletMap.scrollWheelZoom.disable();

        scrollToggleTooltipSpanElement.innerHTML = 'Click to toggle mouse scroll wheel behavior.<br>[ X ] Scroll story pages forward/back.<br>[&nbsp;&nbsp;&nbsp;&nbsp;] Scroll zooms map.';
      } else {
        leafletMap.scrollWheelZoom.enable();

        scrollToggleTooltipSpanElement.innerHTML = 'Click to toggle mouse scroll wheel behavior.<br>[&nbsp;&nbsp;&nbsp;&nbsp;] Scroll story pages forward/back.<br>[ X ] Scroll zooms map.';
      }
    }
  }

  /**
  * Replaces the background layer on the Leaflet map with the layer selected.
  * @param name The name of the background selected to set the @var currentBackgroundLayer as.
  */
  selectBackgroundLayer(name: string): void {
    this.mainMap.removeLayer(this.mapBackgroundLayers[this.currentBackgroundLayer]);
    this.mainMap.addLayer(this.mapBackgroundLayers[name]);
    this.currentBackgroundLayer = name;

    // When a new background layer is selected, the raster layer was being covered
    // up by the new tile layer. This sets the z index of the raster so that it
    // stays on top of the background, but behind the vector.
    this.mainMap.eachLayer((layer: any) => {
      if (layer instanceof L.GridLayer && layer.debugLevel) {
        layer.setZIndex(10);
      }
    });

  }

  /**
  * Sets the @var currentBackgroundLayer to the name of the background layer given,
  * and sets the radio check in the side bar to checked so that background layer
  * is set on the Leaflet map.
  * @param name The name of the background layer selected.
  */
  private setBackgroundLayer(name: string): void {
    this.currentBackgroundLayer = name;
    let radio: any = document.getElementById(name + "-radio");
    radio.checked = "checked";
  }

  /**
  * Sets the default background layer for the leaflet map by creating a MutationObserver
  * and listens for when the DOM element defaultName + '-radio' is not undefined.
  * When the if statement is true, it calls the handleCanvas function, set the now
  * creating canvas elementId to 'checked', stops the observer from observing, and
  * returns.
  */
  private setDefaultBackgroundLayer(): void {

    let defaultName: string = this.getDefaultBackgroundLayer();
    this.currentBackgroundLayer = defaultName;

    // Callback executed when canvas was found.
    function handleCanvas(canvas: any) {
      canvas.checked = "checked";
    }
    // Set up the mutation observer.
    var observer = new MutationObserver(function (mutations, me) {
      // `mutations` is an array of mutations that occurred
      // `me` is the MutationObserver instance
      var canvas = document.getElementById(defaultName + "-radio");
      if (canvas) {
        handleCanvas(canvas);
        // Stop observing.
        me.disconnect();
        return;
      }
    });
    // Start observing..
    observer.observe(document, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Sets the amount of time in milliseconds for the rxjs timer function to wait before
   * starting to refresh a layer on the map.
   * @param refreshInterval The user provided refreshInterval from the map config file.
   * @param refreshOffset The user provided refreshOffset from the map config file.
   * @returns The number of milliseconds given to the rxjs timer to wait until the first
   * refresh is run.
   */
   private setRefreshOffset(refreshInterval: number, refreshOffset?: number): number {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    // The default offset, the most recent midnight.
    var initial = d.getTime();
    var now = Date.now();
    // Use the user-provided refreshOffset to determine the offset needed to wait.
    if (refreshOffset) {
      var fullOffset = initial + refreshOffset;
      if (fullOffset - now < 15000) {
        fullOffset += refreshInterval;
      }

      return fullOffset - now;
    }
    // Use the refreshInterval to determine the offset.
    else {
      // Add the interval from midnight until it passes the time 'now'.
      while (initial < now) {
        initial += refreshInterval;
      }
      // If the offset is less than 15 seconds, add one more interval so the layer has
      // been completely loaded.
      if (initial - now < 15000) {
        initial += refreshInterval;
      }

      return initial - now;
    }
    
  }

  /**
   * Sets the refresh DateTime formatting based on if the provided refresh interval
   * is less than or equal to 1 hour.
   * @param geoLayer The geoLayer from the map configuration file.
   * @param refreshInterval The refreshInterval from the map configuration file.
   */
  private setRefreshDateTime(geoLayer: IM.GeoLayer, refreshInterval: any): void {

    var refreshDateTime: string;

    if (refreshInterval <= 3600000) {
      refreshDateTime = new Date(Date.now()).toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit'
      });
    } else {
      var dateTime = new Date(Date.now());

      refreshDateTime = dateTime.toLocaleTimeString([], {hour: 'numeric', minute: 'numeric'}) +
      ', ' + dateTime.toLocaleString([], {month: 'long', day: 'numeric'});
    }

    this.lastRefresh[geoLayer.geoLayerId] = refreshDateTime;
  }
  
}
