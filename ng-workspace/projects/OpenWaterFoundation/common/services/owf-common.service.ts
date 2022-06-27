import { Injectable }      from '@angular/core';
import { HttpClient }      from '@angular/common/http';

import { catchError }      from 'rxjs/operators';
import { BehaviorSubject,
          Observable, 
          of, 
          Subscriber}      from 'rxjs';

import * as IM             from './types';
import * as Papa           from 'papaparse';


@Injectable({
  providedIn: 'root'
})
export class OwfCommonService {

  /** Object that holds the application configuration contents from the `app-config.json`
   * file. */
  public appConfig: IM.AppConfig;
  /** The hard-coded string of the name of the application configuration file. It
   * is readonly, because it must be named app-config.json by the user. */
  public readonly appConfigFile: string = 'app-config.json';
  /** The hard-coded name of a deployed application configuration file. Similar to
   * app-config.json, it must be named app-config-minimal.json by the user in the
   * assets/app-default folder. */
  public readonly appMinFile: string = 'app-config-minimal.json';
  /** A string representing the path to the correct assets directory for the InfoMapper.
   * The InfoMapper assumes a user will supply their own user-defined config files
   * under assets/app. If not, this string will be changed to 'assets/app-default'
   * and the default InfoMapper set up will be used instead. */
  public appPath: string = 'assets/app/';
  /** Object containing a geoLayerId as the key and a boolean representing whether
   * the given geoLayer has been given a bad path as the value. */
  public badPath = {};
   /** Object containing the contents from the graph template configuration file. */
  public chartTemplateObject: Object;
  /** Absolute path to the dashboard configuration file. Used for relative paths. */
  public dashboardConfigPath: string;

  datastoreDataSubject = new BehaviorSubject<any>(null);

  datastoreDataSubject$: Observable<any> = this.datastoreDataSubject.asObservable();
  /** An array of DataUnit objects that each contain the precision for different
   * types of data, from degrees to mile per hour. Read from the application config
   * file top level property dataUnitsPath. */
  public dataUnits: any[];
  /** The hard-coded string of the path to the default icon path that will be used
   * for the website if none is given. */
  public readonly defaultFaviconPath = 'assets/app-default/img/OWF-Logo-Favicon-32x32.ico';
  /** The absolute path to a gapminder configuration file and used for relative paths. */
  public gapminderConfigPath = '';
  /** NOTE: Not currently in use. */
  public highlighted = new BehaviorSubject(false);
  /** NOTE: Not currently in use. */
  public highlightedData = this.highlighted.asObservable();
  /** The boolean representing if a favicon path has been provided by the user. */
  public FAVICON_SET = false;
  /** The path to the user-provided favicon .ico file. */
  public faviconPath: string;
  /** A string representing the path leading up to the geoJson file that was read in. */
  public geoJSONBasePath: string = '';
  /** The layer's geoMapId property from the top level map configuration file. */
  public geoMapID: string;
  /** The string representing a user's google tracking ID, set in the upper level
   * application config file. */
  public googleAnalyticsTrackingId = '';
  /** Boolean showing whether the google tracking ID has been set for the InfoMapper. */
  public googleAnalyticsTrackingIdSet = false;
  /** The file path as a string obtained from a graph template file that shows where
   * the graph data file can be found. */
  public graphFilePath: string;
  /** Contains all information before the first tilde (~) in the TSID from the graph
   * template file. */
  public graphTSID: string;
  /** Boolean showing whether the default home content page has been initialized. */
  public homeInit = true;
  /** The string representing the current selected markdown path's full path starting
   * from the @var appPath */
  public fullMarkdownPath: string;
  /** Contains any layer geoLayerId's of a layer that has run into a critical error. */
  public layerError = {};
  /** Array to hold maps that have already been created by the user so that they
   * don't have to be created from scratch every time. */
  public leafletMapArray: any[] = [];
  /** The object that holds the map configuration contents from the map configuration
   * file for a Leaflet map. */
  public mapConfig: any;
  /** Array of geoLayerId's in the correct geoLayerView order, retrieved from the
   * geoMap. The order in which each layer should be displayed in on the map and
   * side bar legend. */
  public mapConfigLayerOrder: string[] = [];
  /** A string representing the path to the map configuration file. */
  public mapConfigPath: string = '';
  /**
   * 
   */
  private _mapConfig = new BehaviorSubject<any>({});
  /**
   * 
   */
  readonly mapConfig$ = this._mapConfig.asObservable();
  private mapConfigTest = {};
  /** Object containing the original style for a given feature. */
  public originalFeatureStyle: any;
  /** Object containing a layer's geoLayerId as the key, and a boolean showing whether
   * the URL for the layer is not currently working or does not exist. */
  public serverUnavailable: {} = {};

  
  /**
   * @constructor OWFCommonService.
   * @param http The reference to the HttpClient class for HTTP requests.
   */
  constructor(public http: HttpClient) { }


  /**
   * 
   * @param geoLayerId The layer's geoLayerId to be added to the layerError array
   */
   public addLayerError(geoLayerId: string): void {
    this.layerError[geoLayerId] = true;
  }

  /**
   * Builds the correct path needed for an HTTP GET request for either a local file
   * or URL, and does so whether given an absolute or relative path in a configuration
   * or template file.
   * @param pathType A Path enum representing what kind of path that needs to be built.
   * @param arg An optional array for arguments needed to build the path, e.g. a
   * filename or geoLayerId.
   */
  public buildPath(pathType: string, arg?: any[]): string {
    // If a URL is given as the path that needs to be built, just return it so the
    // http GET request can be performed.
    if (arg) {
      if (arg[0].startsWith('https') || arg[0].startsWith('http') || arg[0].startsWith('www')) {
        return arg[0];
      }
    }
    // Depending on the pathType, build the correct path.
    switch(pathType) {
      case IM.Path.cPP:
        return this.getAppPath() + this.getContentPathFromId(arg[0]);
      case IM.Path.gLGJP:
        return this.getAppPath() + this.getGeoJSONBasePath() + arg[0];
      case IM.Path.hPP:
        return this.getAppPath() + this.getHomePage();
      case IM.Path.eCP:
        return this.getAppPath() + this.getMapConfigPath() + arg[0];
      case IM.Path.cP:
      case IM.Path.csvPath:
      case IM.Path.d3P:
      case IM.Path.dbP:
      case IM.Path.dVP:
      case IM.Path.dUP:
      case IM.Path.dP:
      case IM.Path.iGP:
      case IM.Path.iP:
      case IM.Path.sMP:
      case IM.Path.sIP:
      case IM.Path.raP:
      case IM.Path.rP:
        if (pathType === IM.Path.dP) {
          this.setMarkdownPath(this.getAppPath() + this.formatPath(arg[0], pathType));
        }
        return this.getAppPath() + this.formatPath(arg[0], pathType);
      case IM.Path.bSIP:
        return this.formatPath(arg[0], pathType);
      case IM.Path.mP:
        if (arg[0].startsWith('/')) {
          return this.getAppPath() + this.formatPath(arg[0], pathType);
        } else {
          return this.getFullMarkdownPath() + this.formatPath(arg[0], pathType);
        }
      case IM.Path.gP:
        if (arg[0].startsWith('/')) {
          return this.getAppPath() + arg[0].substring(1);
        } else {
          return this.formatPath(arg[0], pathType);
        }
      default:
        return '';
    }
  }

  /**
   * @returns The condensed path, changing `a/path/to/../../file.ext` to `a/file.ext`
   * for a more human readable format.
   * @param path The path represented as a string, for a URL or local path.
   * @param formatType The string describing how long the formatted string can be.
   */
  public condensePath(path: string, formatType?: string): string {
    if (path.startsWith('https') || path.startsWith('http') || path.startsWith('www')) {
      switch (formatType) {
        case 'table':
          return path.substring(0, 80) + '...';
        case 'link':
          return path.substring(0, 60) + '...';
      }
    } else {
      var tempSplit: string[] = path.split('/');
      var finalPath: string[] = [];

      for (let str of tempSplit) {
        if (str === '..') {
          finalPath.pop();
        } else {
          finalPath.push(str);
        }
      }
      return finalPath.join('/');
    }
  }

  public featureHighlighted(highlighted: boolean): any {
    return this.highlighted.next(highlighted);
  }

  /**
   * Formats the path with either the correct relative path prepended to the destination
   * file, or the removal of the beginning '/' forward slash or an absolute path.
   * @param path The path to format.
   * @param pathType A string representing the type of path being formatted, so
   * the correct handling can be used.
   */
  public formatPath(path: string, pathType: string): string {

    switch (pathType) {
      case IM.Path.cP:
      case IM.Path.csvPath:
      case IM.Path.d3P:
      case IM.Path.dVP:
      case IM.Path.dP:
      case IM.Path.iGP:
      case IM.Path.iP:
      case IM.Path.sMP:
      case IM.Path.raP:
      case IM.Path.rP:
        // If any of the pathType's above are given, they will either be given as
        // an absolute or relative path. A forward slash at the beginning of the
        // string signifies its absolute, so since assets/app/ is already given,
        // just append the rest. If not, relative is assumed, so use the map config
        // path as the 'home' of the path, e.g. 'assets/app/data-maps/map-configuration-files/'.
        if (path.startsWith('/')) {
          return path.substring(1);
        } else {
          return this.getMapConfigPath() + path;
        }
      case IM.Path.dbP:
        if (path.startsWith('/')) {
          return path.substring(1);
        } else {
          return this.getDashboardConfigPath() + path;
        }
      case IM.Path.bSIP:
        if (path.startsWith('/')) {
          return 'assets/app-default/' + path.substring(1);
        } else {
          return 'assets/app-default/' + path;
        }
      case IM.Path.dUP:
      case IM.Path.mP:
      case IM.Path.sIP:
        if (path.startsWith('/')) {
          return path.substring(1);
        } else {
          return path;
        }
      case IM.Path.gP:
        return this.getGapminderConfigPath() + path;
    }

  }

  /**
   * Format the @var saveFileName, dependant on the SaveFileType or if a downloadFile
   * property was given in a popup template file.
   * @param saveFileName The string representing the name that the download file
   * will be called, or undefined if none was given.
   * @param saveFileType The enum Type describing what kind of save file is trying
   * to be formatted.
   * @param featureProperties The object containing all features and values for a
   * feature; for replacing ${property} notation.
   */
  public formatSaveFileName(saveFileName: string, saveFileType: IM.SaveFileType,
    featureProperties?: any): string {

    var warning = 'Undefined detected in the save file name. Confirm "saveFile" ' +
    'property and/or property notation ${ } is correct';

    switch (saveFileType) {
      case IM.SaveFileType.tstable:
        // The filename is undefined.
        if (!saveFileName) {
          return 'timeseries.csv';
        }
        // Sometimes undefined can be added to the file name string earlier on if
        // there's an issue.
        else if (saveFileName.toUpperCase().includes('UNDEFINED')) {
          console.warn(warning);
          console.warn('Defaulting to file name and extension "timeseries.csv"')
          return 'timeseries.csv';
        } else {
          // At this point the saveFileName is the value of the saveFile property
          // from the popup config file. None of its ${property} notation has been
          // converted, so the obtainPropertiesFromLine function is called to do so.
          saveFileName = this.obtainPropertiesFromLine(saveFileName, featureProperties);
          return saveFileName;
        }

      case IM.SaveFileType.text:
        if (saveFileName.toUpperCase().includes('UNDEFINED')) {
          console.warn(warning);
          console.warn('Defaulting to file name "report"');
          return saveFileName.split('undefined').join('');
        } else {
          return saveFileName;
        }

      case IM.SaveFileType.dataTable:
        if (!saveFileName) {
          console.warn(warning);
          console.warn('Defaulting to file name and extension "geoLayerId.csv"');
          return 'geoLayerId.csv';
        } else {
          return saveFileName + '.csv';
        }
    } 
  }

  getApiKey(): string {
    return this.appConfig.apiKey;
  }

  /**
   * @returns either 'assets/app/' if a user-provided configuration file is supplied,
   * or the default 'assets/app-default/' for the upper level assets path if none
   * is given.
   */
  public getAppPath(): string {
    return this.appPath;
  }

  /**
   * Check the background geoLayerViewGroup to see if the expandedInitial property
   * exists and is set to true or false. Show or hide the background layers depending
   * which one is present, and false by default (hiding the layers).
   */
  public getBackgroundExpanded(): boolean {
    for (let geoMap of this.mapConfig.geoMaps) {
      for (let geoLayerViewGroup of geoMap.geoLayerViewGroups) {
        if (geoLayerViewGroup.properties.isBackground === 'true') {
          if (geoLayerViewGroup.properties.expandedInitial &&
              geoLayerViewGroup.properties.expandedInitial === 'true')
            return true;
          else return false;
        }
      }
    }
    return false;
  }

  /**
   * @returns An array of all background geoLayerViewGroup objects.
   */
  public getBackgroundGeoLayerViewGroups(): any[] {
    let allBackgroundGeoLayerViewGroups = [];

    for (let geoMap of this.mapConfig.geoMaps) {
      for (let geoLayerViewGroup of geoMap.geoLayerViewGroups) {
        if (geoLayerViewGroup.properties.isBackground === 'true') {
          allBackgroundGeoLayerViewGroups.push(geoLayerViewGroup);
        }
      }
    }
    return allBackgroundGeoLayerViewGroups;
  }

  /**
   * @returns The background layer geoLayerView that matches the provided @var id.
   * @param id The geoLayerId that needs to be matched
   */
  public getBkgdGeoLayerViewFromId(id: string) {
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
  public getBackgroundLayers(): any[] {
    let backgroundLayers: any[] = [];
    this.mapConfig.geoMaps[0].geoLayers.forEach((geoLayer: any) => {
      if (geoLayer.properties.isBackground === 'true')
        backgroundLayers.push(geoLayer);
    });
    return backgroundLayers;
  }

  /**
   * @returns true no matter what for some reason...
   */
  public getBackgroundLayersMapControl(): boolean {
    return true;
  }

  /**
   * Retrieves the bad path from the @var badPath object, and formats it if needed
   * to show in the warning tooltip.
   * @param geoLayerId The geoLayerId used as the key in the @var badPath to find
   * the correct layer's path.
   */
  public getBadPath(geoLayerId: string): string {
    var splitPath = this.badPath[geoLayerId][1].split('/');
    for (let i in splitPath) {
      if (splitPath[i] === '..') {
        splitPath.splice(Number(i) - 1, 2);
      }
    }
    var formattedPath = '';

    for (let subPath of splitPath) {
      formattedPath += subPath + '/';
  }

    return formattedPath.substring(0, formattedPath.length - 1);
  }

  /**
   * @returns the chart template JSON file read earlier as an object
   */
  public getChartTemplateObject(): Object {
    return this.chartTemplateObject;
  }

  /**
   * Iterates through all mainMenus and subMenus in the app configuration file and
   * determines the path to the first object with the markdownFile property.
   * @returns The markdownFile (contentPage) path found there that matches the given
   * geoLayerId.
   * @param id The geoLayerId to compare with.
   */
  public getContentPathFromId(id: string) {
    for (let i = 0; i < this.appConfig.mainMenu.length; i++) {
      if (this.appConfig.mainMenu[i].menus) {
        for (let menu = 0; menu < this.appConfig.mainMenu[i].menus.length; menu++) {
          if (this.appConfig.mainMenu[i].menus[menu].id === id)
            return this.appConfig.mainMenu[i].menus[menu].markdownFile;
        }
      } else {
        if (this.appConfig.mainMenu[i].id === id)
          return this.appConfig.mainMenu[i].markdownFile;
      }
    }
    // Return the homePage path by default. Check if it's an absolute path first.
    if (id.startsWith('/')) {
      return id.substring(1);
    }
    // If it doesn't, use the path relative to the home page.
    else {
      var arr: string[] = this.appConfig.homePage.split('/');

      return arr.splice(0, arr.length - 1).join('/').substring(1) + '/' +
      (id.startsWith('/') ? id.substring(1) : id);
    }
  }

  public getDashboardConfigPath(): string { return this.dashboardConfigPath; }

  /**
   * 
   * @param id 
   * @returns 
   */
   public getDashboardConfigPathFromId(id: string): string {
    var dashboardPathExt: string;
    var splitDashboardPath: string[];
    var dashboardPath = '';

    for (let mainMenu of this.appConfig.mainMenu) {
      if (mainMenu.menus) {
        for (let subMenu of mainMenu.menus) {
          if (subMenu.id === id) dashboardPathExt = subMenu.dashboardFile;
        }
      } else {
        if (mainMenu.id === id) dashboardPathExt = mainMenu.dashboardFile;
      }
    }

    splitDashboardPath = dashboardPathExt.split('/');

    for (let i = 0; i < splitDashboardPath.length - 1; i++) {
      dashboardPath += splitDashboardPath[i] + '/';
    }

    dashboardPath.startsWith('/') ?
    this.dashboardConfigPath = dashboardPath.substring(1) :
    this.dashboardConfigPath = dashboardPath;

    return dashboardPathExt.startsWith('/') ?
    dashboardPathExt.substring(1) :
    dashboardPathExt;
  }

  /**
   * @returns The array of DataUnits from the DATAUNIT file.
   */
  public getDataUnitArray(): any[] { return this.dataUnits; }

  /**
   * Goes through each geoMap, geoLayerViewGroup, and geoLayerView in a geoMapProject
   * and returns the FIRST occurrence of a background layer that has the selectedInitial
   * property set to true, effectively getting the default background layer.
   */
  public getDefaultBackgroundLayer(): string {
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
  public getExtentInitial(): number[] {
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
   * Gets the path to the map config file matching the provided id, and sets the
   * paths to the map configuration and geoJson files.
   * @param id The app config id assigned to each menu.
   * @param standalone Represents what kind of standalone map is being created.
   * This can be either `app` or `map`.
   * @param configPath The path to the map configuration file if a standalone `map`
   * is being created.
   * @returns The path (minus the assets/app/) to the map configuration file.
   */
  public getFullMapConfigPath(id: string, standalone?: string, configPath?: string): string {
    
    // Create a standalone map if standalone is defined.
    if (standalone === 'app') {
      var path: string = '';
      let splitPath = this.appConfig.standaloneMap.mapProject.split('/');
      
      for (let i = 0; i < splitPath.length - 1; i++) {
        path += splitPath[i] + '/';
      }
      if (path.startsWith('/')) {
        this.setMapConfigPath(path.substring(1));
        this.setGeoJSONBasePath(this.appConfig.standaloneMap.mapProject.substring(1));
        return this.appConfig.standaloneMap.mapProject.substring(1);
      } else {
        this.setMapConfigPath(path);
        this.setGeoJSONBasePath(this.appConfig.standaloneMap.mapProject);
        return this.appConfig.standaloneMap.mapProject;
      }
    } else if (standalone === 'map') {
      var path: string = '';
      let splitPath: string[] = [];

      splitPath = configPath.split('/');
      
      for (let i = 0; i < splitPath.length - 1; i++) {
        path += splitPath[i] + '/';
      }
      if (path.startsWith('/')) {
        this.setMapConfigPath(path.substring(1));
        this.setGeoJSONBasePath(configPath.substring(1));
        return configPath.substring(1);
      } else {
        this.setMapConfigPath(path);
        this.setGeoJSONBasePath(configPath);
        return configPath;
      }
    }
    
    for (let i = 0; i < this.appConfig.mainMenu.length; i++) {
      if (this.appConfig.mainMenu[i].menus) {
        for (let menu = 0; menu < this.appConfig.mainMenu[i].menus.length; menu++) {
          if (this.appConfig.mainMenu[i].menus[menu].id === id) {
            var path: string = '';
            let splitPath = this.appConfig.mainMenu[i].menus[menu].mapProject.split('/');
            for (let i = 0; i < splitPath.length - 1; i++) {
              path += splitPath[i] + '/';
            }
            if (path.startsWith('/')) {
              this.setMapConfigPath(path.substring(1));
              this.setGeoJSONBasePath(this.appConfig.mainMenu[i].menus[menu].mapProject.substring(1));
              return this.appConfig.mainMenu[i].menus[menu].mapProject.substring(1);
            } else {
              this.setMapConfigPath(path);
              this.setGeoJSONBasePath(this.appConfig.mainMenu[i].menus[menu].mapProject);
              return this.appConfig.mainMenu[i].menus[menu].mapProject;
            }
          }
        }
      } else {
        if (this.appConfig.mainMenu[i].id === id) {
          var path: string = '';
          let splitPath = this.appConfig.mainMenu[i].mapProject.split('/');
          for (let i = 0; i < splitPath.length - 1; i++) {
            path += splitPath[i] + '/';
          }
          this.setMapConfigPath(path);
          this.setGeoJSONBasePath(this.appConfig.mainMenu[i].mapProject);
          return this.appConfig.mainMenu[i].mapProject;
        }
      }
    }
    return '';
  }

  /**
   * @returns The current selected markdown path's full path starting from the @var appPath.
   */
  public getFullMarkdownPath(): string { return this.fullMarkdownPath; }

  /**
   * @returns The path to the Gapminder config path. Is an empty string if no path
   * was previously set.
   */
  public getGapminderConfigPath(): string { return this.gapminderConfigPath; }

  /**
   * Goes through each geoLayer in the GeoMapProject and if one matches with the
   * given geoLayerId parameter, returns the geometryType attribute of that geoLayer.
   * @param id The geoLayerId of the layerView to be compared with the geoLayerId
   * of the geoLayer.
   */
  public getGeometryType(id: string): string {
    for (let geoLayer of this.mapConfig.geoMaps[0].geoLayers) {
      if (geoLayer.geoLayerId === id) {
        return geoLayer.geometryType;
      }
    }
    return 'here';
  }

  /**
   * @returns the base path to the GeoJson files being used in the application.
   * When prepended with the @var appPath, shows the full path the application
   * needs to find any GeoJson file.
   */
  public getGeoJSONBasePath(): string { return this.geoJSONBasePath; }

  /**
   * @returns a geoLayer object in the geoMapProject whose geoLayerId matches the @param id
   * @param id The geoLayerId to be matched with
   */
  public getGeoLayerFromId(id: string): any {
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
   * @returns A reversed array of all geoLayer objects in the geoMapProject.
   */
  public getGeoLayers(): any[] {
    let geoLayers: any[] = [];
    this.mapConfig.geoMaps.forEach((geoMap: any) => {
      geoMap.geoLayers.forEach((geoLayer: any) => {
        if (!geoLayer.properties.isBackground || geoLayer.properties.isBackground === 'false') {
          geoLayers.push(geoLayer);
        }
      });
    });
    return geoLayers;
  }

  /**
   * @returns A reversed array of all geoLayerViewGroupId's in the geoMapProject.
   * The array is reversed so when it's iterated over, it will bring each one representing
   * a map layer to the front of the map. This will ultimately put the layers in
   * the correct order with the first group on top, and subsequent groups below.
   */
  public getGeoLayerViewGroupIdOrder(): string[] {
    var allGeoLayerViewGroups: string[] = [];
    for (let geoMap of this.mapConfig.geoMaps) {
      for (let geoLayerViewGroup of geoMap.geoLayerViewGroups) {
        if (!geoLayerViewGroup.properties.isBackground ||
          geoLayerViewGroup.properties.isBackground === 'false') {
          allGeoLayerViewGroups.push(geoLayerViewGroup.geoLayerViewGroupId);
        }
      }
    }
    return allGeoLayerViewGroups.reverse();
  }

  /**
   * @returns an array of eventHandler objects from the geoLayerView whose geoLayerId
   * matches the given @param geoLayerId.
   * @param geoLayerId The geoLayerId to match with.
   */
  public getGeoLayerViewEventHandler(geoLayerId: string): IM.EventHandler[] {

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
   * Return the geoLayerView that matches the given geoLayerId.
   * @param id The given geoLayerId to match with.
   */
   public getGeoLayerView(id: string) {

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
   * @returns The FIRST geoMap docPath property.
   */
  public getGeoMapDocPath(): string {
    return this.getMapConfig().geoMaps[0].properties.docPath;
  }

  /**
   * @returns The geoMapId property from the FIRST geoMap in the map configuration.
   */
  public getGeoMapID(): string { return this.geoMapID; }

  /**
   * @returns The name attribute to the FIRST geoMap in the geoMapProject.
   */
  public getGeoMapName(): string {
    if (this.mapConfig) {
      if (this.mapConfig.geoMaps[0].name.length < 30) {
        return this.mapConfig.geoMaps[0].name;
      }
      else return this.mapConfig.geoMaps[0].name.substring(0, 30) + '...';
    }
  }

  /**
   * @returns The file path as a string obtained from a graph template file that
   * shows where the graph data file can be found.
   */
  public getGraphFilePath(): string { return this.graphFilePath; }

  /**
   * @returns The homePage property in the app-config file without the first '/' slash.
   */
  public getHomePage(): string {
    if (this.appConfig.homePage) {
      if (this.appConfig.homePage[0] === '/')
        return this.appConfig.homePage.substring(1);
      else
        return this.appConfig.homePage;
    }
    else throw new Error("The 'homePage' property in the app configuration file " +
    "not set. Please set the path to the home page.")
  }

  /**
   * Read data asynchronously from a file or URL and return it as a JSON object.
   * @param path The path or URL to the file needed to be read.
   * @returns The JSON retrieved from the host as an Observable.
   */
  public getJSONData(path: string, type?: string, id?: string): Observable<any> {
    // This creates an options object with the optional headers property to add
    // headers to the request. This could solve some CORS issues, but is not completely
    // tested yet.
    // var options = {
    //   headers: new HttpHeaders({
    //     'Access-Control-Request-Method': 'GET'
    //   })
    // }
    return this.http.get<any>(path)
    .pipe(
      catchError(this.handleError<any>(path, type, id))
    );
  }

  /**
   * @returns An array of the geoLayerViewGroups from the FIRST geoMap.
   */
  public getGeoLayerViewGroups(): any[] {
    return this.mapConfig.geoMaps[0].geoLayerViewGroups;
  }

  /**
   * @returns The array of layer marker data, such as size, color, icon, etc.
   */
  public getLayerMarkerData(): void { return this.mapConfig.layerViewGroups; }

  /**
   * NOTE: This function is not currently being used, as it's being used by functions
   * in map.component.ts that have not been implemented yet.
   * @param id The given geoLayerId to match with
   */
  public getLayerFromId(id: string) {
    let dataLayers: any = this.mapConfig.dataLayers;
    let layer: any = null;
    dataLayers.forEach((l: any) => {
      if (l.geoLayerId === id) {
        layer = l;
      }
    })
    return layer;
  }

  /**
   * @returns The layerError object, which contains any layer geoLayerId's of a
   * layer that has run into a critical error.
   */
  public getLayerError(): any { return this.layerError; }

  /**
   * @returns The entire @var mapConfig object obtained from the map configuration
   * file. Essentially the geoMapProject.
   */
  public getMapConfig() { return this.mapConfig; }

  /**
   * @returns The relative path to the map configuration file for the application
   */
  public getMapConfigPath(): string { return this.mapConfigPath; }

  /**
   * @returns the style object containing the original properties for a given feature
   */
  public getOriginalFeatureStyle(): any { return this.originalFeatureStyle; }

  /**
   * Read data asynchronously from a file or URL and return it as plain text.
   * @param path The path to the file to be read, or the URL to send the GET request.
   * @param type Optional type of request sent, e.g. IM.Path.cPP. Used for error
   * handling and messaging.
   * @param id Optional app-config id to help determine where exactly an error occurred.
   */
  public getPlainText(path: string, type?: string, id?: string): Observable<any> {
    // This next line is important, as it tells our response that it needs to return
    // plain text, not a default JSON object.
    const obj: Object = { responseType: 'text' as 'text' };

    return this.http.get<any>(path, obj)
    .pipe(
      catchError(this.handleError<any>(path, type, id))
    );
  }

  /**
   * @returns The upper level geoMapProject properties object.
   */
  public getProperties(): {} { return this.mapConfig.properties; }

  /**
   * Returns the geoLayerView's refreshInterval property, converted to a number
   * if it can be, and 0 if not.
   * @param geoLayerId The geoLayerId to match with.
   */
  public getRefreshInterval(geoLayerId: string): number {
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
  public getRefreshOffset(geoLayerId: string, refreshInterval: number): number {
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
  public getSymbolDataFromID(id: string): any {
    var geoLayerViewGroups: any = this.mapConfig.geoMaps[0].geoLayerViewGroups;
    var geoLayerViewRet: any;

    for (let geoLayerViewGroup of geoLayerViewGroups) {
      for (let geoLayerView of geoLayerViewGroup.geoLayerViews) {
        if (geoLayerView.geoLayerId === id) {
          geoLayerViewRet = geoLayerView.geoLayerSymbol;
        }
      }
    }
    return geoLayerViewRet;
  }

  /**
   * Handles the HTTP operation that failed, and lets the app continue by returning
   * an empty result.
   * @param path - Name of the path used that failed.
   * @param type - Optional type of the property error. Was it a home page, template, etc.
   * @param result - Optional value to return as the observable result.
   */
  private handleError<T> (path: string, type?: string, id?: string, result?: T) {
    return (error: any): Observable<T> => {

      switch(error.status) {
        case 404:
          this.setBadPath(path, id); break;
        case 400:
          this.setServerUnavailable(id); break;
      }
      // If the error message includes a parsing issue, more often than not it is
      // a badly created JSON file. Detect if .json is in the path, and if it is
      // let the user know. If not, the file is somehow incorrect.
      if (error.message.includes('Http failure during parsing')) {
        // If the path contains an image file, then it is a raster, so just return.
        // The raster will be read later.
        if (path.toUpperCase().includes('.TIF') || path.toUpperCase().includes('.TIFF')) {
          return of(result as T);
        } else if (path.toUpperCase().includes('.JPG') || path.toUpperCase().includes('.PNG')) {
          return of(result as T);
        }

        console.error('[' + type + '] error. InfoMapper could not parse a file. Confirm the \'' +
        this.condensePath(path) +
        '\' file is %s', (path.includes('.json') ? 'valid JSON.' : 'created correctly.'));
        return of(result as T);
      }

      if (type) {
        console.error('[' + type + '] error. There might have been a problem with the ' +
        type + ' path or URL. Confirm it is correct in the configuration file or exists on the server.');
      }

      switch(type) {
        case IM.Path.fMCP:
          console.error("Confirm the app configuration property 'mapProject' with id '" +
          id + "' is the correct path");
          break;
        case IM.Path.gLGJP:
          console.error("Confirm the map configuration property 'sourcePath' is the correct path");
          break;
        case IM.Path.eCP:
          console.error("Confirm the map configuration EventHandler property " +
          "'eventConfigPath' is the correct path");
          break;
        case IM.Path.aCP:
          console.error("No app-config.json detected in " + this.appPath +
          ". Confirm app-config.json exists in " + this.appPath);
          break;
        case IM.Path.cPage:
          console.error("Confirm the app configuration property 'markdownFilepath' with id '" +
          id + "' is the correct path");
          break;
        case IM.Path.rP:
          console.error("Confirm the popup configuration file property 'resourcePath' " +
          "is the correct path");
          break;
      }
      // TODO: jpkeahey 2020.07.22 - Don't show a map error no matter what. I'll
      // probably want to in some cases.
      // this.router.navigateByUrl('map-error');
      // Let the app keep running by returning an empty result. Because each service
      // method returns a different kind of Observable result, this function takes a
      // type parameter so it can return the safe value as the type that the application expects.
      return of(error);
    };
  }

  /**
   * @returns A boolean showing whether the layer containing the given @var geoLayerId
   * has been given a bad path.
   * @param geoLayerId The geoLayerId from the layer to match to.
   */
  public isBadPath(geoLayerId: string): boolean { 
    if (this.badPath) {
      return this.badPath[geoLayerId];
    } else return false;
  }

  /**
   * @returns a boolean showing whether the layer containing the given @var geoLayerId =
   * is unavailable to be shown on the map.
   * @param geoLayerId The geoLayerId from the layer to match to.
   */
  public isServerUnavailable(geoLayerId: string): boolean {
    if (this.serverUnavailable[geoLayerId] === true) {
      // this.addLayerError(geoLayerId);
      return this.serverUnavailable[geoLayerId];
    } else return false;
  }

  /**
   * @returns true if the given property to be displayed in the Mat Table cell is a URL.
   * @param property The Mat Table cell property to check
   */
  public isURL(property: any): boolean {
    if (typeof property === 'string') {
      if (property.startsWith('http://') || property.startsWith('https://') ||
      property.startsWith('www.')) {
        return true;
      }
    } else return false;
  }

  /**
   * While the end of the value string from the graph template file hasn't ended
   * yet, look for the '${' start that we need and build the property, adding it
   * to the propertyArray when we've detected the end of the property. Find each
   * one in the value until the value line is done.
   * @param line The string to search through.
   * @param featureProperties The object containing the feature's key and value
   * pair properties.
   * @param key Optional parameter to provide a better console warning by logging
   * the key.
   * @param labelProp Optional parameter
   * @returns A parsedProp object that contains:
   * (foundProps): An array of all found properties in the line in the order they were found,
   * and (line): The line with all ${property} notation properly converted.
   */
  public obtainPropertiesFromLine(line: string, featureProperties: Object, key?: any,
  labelProp?: boolean, countFoundProps?: boolean): any {

    var allFoundProps: string[] = [];
    var propertyString = '';
    var currentIndex = 0;
    var formattedLine = '';
    var featureValue = '';
    // Go through the entire line
    while (currentIndex < line.length) {
      // Check to see if the string at the current index and the next index exists,
      // and if they are equal to '${'.
      if (line[currentIndex] && line[currentIndex + 1] && line[currentIndex] === '$'
      && line[currentIndex + 1] === '{') {

        currentIndex = currentIndex + 2;
        // A property notation has been found. Move the current index up by 2 and
        // now go through the line that contains a property until an ending '}' is found.
        for (let i = currentIndex; i < line.length; i++) {
          if (line[i] !== '}') {
            propertyString += line[i];
            currentIndex++;
          } else if (line[i] === '}') {
            currentIndex++;
            break;
          }
        }
        // You have gone through everything inside the ${property} format and gotten
        // the string. Split by the colon and now we have our true property. I might
        // have to use the throwaway variable later.
        let splitArr = propertyString.split(':');
        var prop: string;
        if (splitArr.length === 1) {
          prop = propertyString.split(':')[0];
        } else {
          let throwaway = propertyString.split(':')[0];
          prop = propertyString.split(':')[1];
          allFoundProps.push(prop);
        }
        
        featureValue = featureProperties[prop];

        if (prop === undefined) {
          console.warn('A property of the [' + key + '] attribute in the graph ' +
          'template file is incorrectly formatted. This might cause an error in ' +
          'retrieving the graph, or other unintended output on the graph.');
        }
        // If the featureValue is undefined, then the property given after the colon
        // does not exist on the feature. Warn user and return the ${property} that
        // was given by the user so it's obvious there's an issue.
        if (featureValue === undefined) {
          console.warn('The featureAttribute property "' + prop +
          '" does not exist in the feature. Confirm the spelling ' +
          'and punctuation of the attribute is correct.');
          formattedLine += '${' + propertyString + '}';
          propertyString = '';
          continue;
        }
        // If the property is for a graduated label property, check to see if any
        // operators need to be removed.
        if (labelProp === true) {
          if (featureValue.includes('=')) {
            featureValue = featureValue.substring(featureValue.indexOf('=') + 1);
          }
          if (featureValue.includes('>')) {
            featureValue = featureValue.replace('>', '');
          }
          if (featureValue.includes('<')) {
            featureValue = featureValue.replace('<', '');
          }
        }

        // This looks for all the content inside two soft parentheses.
        var regExp = /\(([^)]+)/;
        // Iterate over the currently implemented property functions that OWF is
        // supporting, which is being organized in the PropFunction enum at the
        // end of this file.
        for (const propFunction of Object.values(IM.PropFunction)) {
          // We're at the index after the ${} property, so check to see if it is
          // immediately followed by a PropFunction string.
          if (line.substring(currentIndex).startsWith(propFunction)) {
            // Use the regExp variable above to get all contents between the parens,
            // check if null - no parameters were given in the PropFunction - and
            // run the appropriate function.
            if (regExp.exec(line.substring(currentIndex)) !== null) {
              featureValue = this.runPropFunction(featureValue, propFunction,
                regExp.exec(line.substring(currentIndex))[1]);
            } else {
              featureValue = this.runPropFunction(featureValue, propFunction);
            }
            // Set the current index to the letter after the function parenthesis
            // e.g. replace(...). Use the currentIndex as the start of the search
            // for the index of ')', for chaining functions.
            currentIndex = line.indexOf(')', currentIndex) + 1;
          }
        }
        // Add the possibly manipulated featureValue to the formattedLine string
        // that will be returned.
        formattedLine += featureValue;
        propertyString = '';
      }
      // The first conditional was not met, so the current and next letters of the
      // line are not '${'. Double check to make sure the current letter exists.
      if (line[currentIndex] !== undefined) {
        formattedLine += line[currentIndex];
        currentIndex++;
      }
    }
    // The while loop is finished; the entire line has been iterated over, and the
    // variable formattedLine has been rewritten to replace all the ${property}
    // notation with the correct feature value.
    if (countFoundProps === true) {
      return { foundProps: allFoundProps, line: formattedLine };
    } else {
      return formattedLine;
    }
    
  }

  /**
   * Uses Papaparse to retrieve data asynchronously from a file or URL, and returns
   * the result wrapped in an Observable.
   * @param fullDelimitedPath The already built path to the delimited file.
   * @param noHeader If set to true, reads in data with no headers. Default is to
   * read the data as if it has headers.
   * @returns The Papaparse result as an observable.
   */
  papaParse(fullDelimitedPath: string, noHeader?: boolean): Observable<any> {
    return new Observable((subscriber: Subscriber<any>) => {
      Papa.parse(fullDelimitedPath, {
        delimiter: ",",
        download: true,
        comments: "#",
        skipEmptyLines: true,
        header: noHeader ? !noHeader : true,
        complete: (result: Papa.ParseResult<any>) => {
          subscriber.next(result);
          subscriber.complete();
        },
        error: (error: Papa.ParseError) => {
          subscriber.next({ error: "An error has occurred." });
          subscriber.complete();
        }
      });
    });
  }

  /**
   * Parses a full TSID string into its smaller components.
   * @param fullTSID The full TSID string to parse.
   * @returns An object with at least the TSIDLocation and datastore, and the path
   * to the datastore file if given.
   */
   public parseTSID(fullTSID: any): IM.TSID {

    // Depending on whether it's a full TSID used in the graph template file, determine
    // what the file path of the StateMod file is. (TSIDLocation~/path/to/filename.stm OR
    // TSIDLocation~StateMod~/path/to/filename.stm)
    if (fullTSID.split('~').length === 1) {
      return { location: null };
    }
    if (fullTSID.split('~').length === 2) {
      return {
        location: fullTSID.split('~')[0],
        datastore: fullTSID.split('~')[1],
        path: null
      }
    } else if (fullTSID.split('~').length === 3) {
      return {
        location: fullTSID.split('~')[0],
        datastore: fullTSID.split('~')[1],
        path: fullTSID.split('~')[2]
      }
    }
  }

  /**
   * This is a recursive function that goes through an object and replaces any value in
   * it that contains the ${property} notation with the actual property needed.
   * @param graphTemplate The object that will have its property notation expanded
   * @param featureProperties The properties in the selected feature on the map layer.
   */
  replaceProperties(graphTemplate: Object, featureProperties: Object): Object {

    for (var key in graphTemplate) {
      var value = graphTemplate[key];
      if (typeof value === 'object') {
        this.replaceProperties(value, featureProperties);
      } else {
        if (value.includes("${")) {
          let formattedValue = this.obtainPropertiesFromLine(value, featureProperties, key);

          try {
            graphTemplate[key] = formattedValue;
          } catch (e) {
            graphTemplate[key] = value;
          }
        }
      }
    }
    if (graphTemplate['product'] || graphTemplate['id'])
      return graphTemplate;
  }

  /**
   * Resets the @var mapConfigLayerOrder when a new map is created
   */
  public resetMapConfigLayerOrder(): void { this.mapConfigLayerOrder = []; }

  /**
   * Run the appropriate PropFunction function that needs to be called on the ${} property value
   * @param featureValue The property value that needs to be manipulated
   * @param propFunction The PropFunction enum value to determine which implemented
   * function needs to be called.
   * @param args The optional arguments found in the parens of the PropFunction as a string
   */
  public runPropFunction(featureValue: string, propFunction: IM.PropFunction, args?: string): string {
    switch (propFunction) {
      case IM.PropFunction.toMixedCase:
        var featureArray = featureValue.toLowerCase().split(' ');
        var finalArray = [];

        for (let word of featureArray) {
          finalArray.push(word[0].toUpperCase() + word.slice(1));
        }
        return finalArray.join(' ');

      case IM.PropFunction.replace:
        var argArray: string[] = [];
        for (let arg of args.split(',')) {
          argArray.push(arg.trim().replace(/\'/g, ''));
        }

        if (argArray.length !== 2) {
          console.warn('The function \'.replace()\' must be given two arguments, ' +
          'the searched for pattern and the replacement for the pattern ' +
          'e.g. .replace(\' \', \'\')');
          return featureValue;
        } else {
          // Create a new regular expression object with the pattern we want to find
          // (the first argument) and g to replace globally, or all instances of
          // the found pattern.
          var regex = new RegExp(argArray[0], 'g');
          return featureValue.replace(regex, argArray[1]);
        }
    }
  }

  /**
   * Sanitizes the markdown syntax by checking if image links are present, and replacing
   * them with the full path to the image relative to the markdown file being displayed.
   * This eases usability so that just the name and extension of the file can be
   * used e.g. `![Waldo](waldo.png)` will be converted to
   * `![Waldo](full/path/to/markdown/file/waldo.png)`.
   * @param doc The documentation string retrieved from the markdown file.
   */
  public sanitizeDoc(doc: string, pathType: IM.Path): string {
    // Needed for a smaller scope when replacing the image links.
    var _this = this;
    // If anywhere in the documentation there exists  ![any amount of text](
    // then it is the syntax for an image, and the path needs to be changed.
    if (/!\[(.*?)\]\(/.test(doc)) {
      // Create an array of all substrings in the documentation that match the regular
      // expression  ](any amount of text).
      var allImages: string[] = doc.match(/\]\((.*?)\)/g);
      // Go through each one of these strings and replace each one that does not
      // specify itself as an in-page link, or external link.
      for (let image of allImages) {
        if (image.startsWith('](#') || image.startsWith('](https') ||
        image.startsWith('](http') || image.startsWith('](www')) {
          continue;
        } else {

          doc = doc.replace(image, function(word) {
            // Take off the pre pending ]( and ending )
            var innerParensContent = word.substring(2, word.length - 1);
            // Return the formatted full markdown path with the corresponding bracket
            // and parentheses.
            if (innerParensContent.startsWith('assets/img/')) {
              return '](' + innerParensContent + ')';
            }
            return '](' + _this.buildPath(pathType, [innerParensContent]) + ')';
          });

        }
      }
    }

    return doc;
  }

  /**
   * Sets the globally used @var appConfig for access to the app's configuration
   * settings.
   * @param appConfig The entire application configuration read in from the app-config
   * .file as an object
   */
  public setAppConfig(appConfig: IM.AppConfig): void { this.appConfig = appConfig; }

  /**
   * No configuration file was detected from the user, so the 'assets/app-default/'
   * path is set.
   * @param path The default assets path to set the @var appPath to
   */
  public setAppPath(path: string): void { this.appPath = path; }

  /**
   *cs, or possibly creates the badPath object with the geo
   * @param geoLayerId The geoLayerId from the geoLayer where the bad path was set
   */
  public setBadPath(path: string, geoLayerId: string): void {
    this.badPath[geoLayerId] = [true, path];
  }

  /**
   * Sets @var chartTemplateObject with the object read in from JSON graph template
   * file.
   * @param graphTemplateObject The graph template object obtained from the graph
   * template file.
   */
  public setChartTemplateObject(graphTemplateObject: Object): void {
    this.chartTemplateObject = graphTemplateObject;
  }

  /**
   * Sets the @var dataUnits array to the passed in dataUnits from the nav-bar
   * @param dataUnits The array of DataUnits to set the service @var dataUnits to
   */
  public setDataUnitsArr(dataUnits: any[]): void { this.dataUnits = dataUnits; }

  /**
   * 
   * @param path 
   */
  public setFullMarkdownPath(path: string) { this.fullMarkdownPath = path; }

  /**
   * Sets @var gapminderConfigPath to the supplied absolute path. Used for using
   * relative paths from the Gapminder configuration file path.
   * @param configPath The absolute path to the Gapminder configuration file.
   */
  public setGapminderConfigPath(configPath: string): void {
    this.gapminderConfigPath = configPath.substring(0, configPath.lastIndexOf('/') + 1);
  }

  /**
   * Sets the @var graphFilePath to the given path
   * @param path The path given in the graph template file TSID
   */
  public setGraphFilePath(path: string): void {
    this.graphFilePath = path;
  }

  /**
   * Sets the @var geoJSONBasePath to the correct relative path in the application
   * @param path The path to set to
   */
  private setGeoJSONBasePath(path: string): void {
    let splitPath: string[] = path.split('/');
    var finalPath: string = '';

    for (let i = 0; i < splitPath.length - 1; i++) {
      finalPath += splitPath[i] + '/';
    }
    this.geoJSONBasePath = finalPath;
  }

  /**
   * Sets the @var geoMapID to the layer's geoMapId property.
   */
  public setGeoMapID(geoMapId: string): void { 
    this.geoMapID = geoMapId;
  }

  /**
   * Sets the @var mapConfig to the object obtained from the map configuration file
   * @param mapConfig The entire map configuration object to set to
   */
  public setMapConfig(mapConfig: any): void {
    this.mapConfig = mapConfig;
  }

  public setMapConfigTest(mapConfig: any): void {
    this._mapConfig.next(Object.assign(this.mapConfigTest, mapConfig))
  }

  /**
   * Iterates over each geoLayerViewGroup in the geoMap and pushes each geoLayerView's
   * geoLayerId in the order they are given, so the InfoMapper knows the order in
   * which they should be draw on the Leaflet map.
   */
  public getMapConfigLayerOrder(): string[] {
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
   * Sets the @var mapConfigPath to the path of the map configuration file in the
   * application.
   * @param path The path to set to.
   */
  public setMapConfigPath(path: string): void { this.mapConfigPath = path; }

  /**
   * 
   * @param path 
   */
  private setMarkdownPath(path: string): void {
    
    var fullMarkdownPath = '';
    let splitPath: string[] = path.split('/');
    for (let i = 0; i < splitPath.length - 1; i++) {
      fullMarkdownPath += splitPath[i] + '/';
    }
    this.fullMarkdownPath = fullMarkdownPath;
  }

  /**
   * Sets the @var originalFeatureStyle to the style object from the feature passed in.
   * @param style The style object of the feature to be saved
   */
  public setOriginalFeatureStyle(style: any): void { this.originalFeatureStyle = style; }

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
   * Sets the @var serverUnavailable with a key of @var geoLayerId to true.
   * @param geoLayerId The geoLayerId to compare to while creating the side bar
   */
  public setServerUnavailable(geoLayerId: string): void {
    this.serverUnavailable[geoLayerId] = true;
  }

  /**
   * Sets the @var graphTSID to the given tsid.
   * @param tsid The tsid to set to
   */
  public setTSIDLocation(tsid: string): void { this.graphTSID = tsid; }

}
