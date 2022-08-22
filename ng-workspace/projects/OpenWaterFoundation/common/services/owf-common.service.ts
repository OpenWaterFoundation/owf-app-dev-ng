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
  appConfig: IM.AppConfig;
  /** The hard-coded string of the name of the application configuration file. It
   * is readonly, because it must be named app-config.json by the user. */
  readonly appConfigFile: string = 'app-config.json';
  /** The hard-coded name of a deployed application configuration file. Similar to
   * app-config.json, it must be named app-config-minimal.json by the user in the
   * assets/app-default folder. */
  readonly appMinFile: string = 'app-config-minimal.json';
  /** A string representing the path to the correct assets directory for the InfoMapper.
   * The InfoMapper assumes a user will supply their own user-defined config files
   * under assets/app. If not, this string will be changed to 'assets/app-default'
   * and the default InfoMapper set up will be used instead. */
  appPath: string = 'assets/app/';
  /** Object containing a geoLayerId as the key and a boolean representing whether
   * the given geoLayer has been given a bad path as the value. */
  badPath = {};
   /** Object containing the contents from the graph template configuration file. */
  chartTemplateObject: Object;
  /** Absolute path to the dashboard configuration file. Used for relative paths. */
  dashboardConfigPath: string;
  /** Subject updated by a datastore if it requires its own async operation during
   * datastore creation or other task it needs to perform. Consuming component
   * would subscribe to it and run when the datastore logic has completed. */
  datastoreDataSubject = new BehaviorSubject<any>(null);
  /** The datastoreDataSubject to be passed as an Observable for subscribing to. */
  datastoreDataSubject$: Observable<any> = this.datastoreDataSubject.asObservable();
  /** An array of DataUnit objects that each contain the precision for different
   * types of data, from degrees to mile per hour. Read from the application config
   * file top level property dataUnitsPath. */
  dataUnits: any[];
  /** The hard-coded string of the path to the default icon path that will be used
   * for the website if none is given. */
  readonly defaultFaviconPath = 'assets/app-default/img/OWF-Logo-Favicon-32x32.ico';
  /** The absolute path to a gapminder configuration file and used for relative paths. */
  gapminderConfigPath = '';
  /** NOTE: Not currently in use. */
  highlighted = new BehaviorSubject(false);
  /** NOTE: Not currently in use. */
  highlightedData = this.highlighted.asObservable();
  /** Constant for the Font Awesome house with chimney SVG path. */
  private readonly constHouseChimneySVGPath = 'M511.8 287.6L512.5 447.7C512.5 ' +
  '450.5 512.3 453.1 512 455.8V472C512 494.1 494.1 512 472 512H456C454.9 ' +
  '512 453.8 511.1 452.7 511.9C451.3 511.1 449.9 512 448.5 512H392C369.9 ' +
  '512 352 494.1 352 472V384C352 366.3 337.7 352 320 352H256C238.3 352 224 ' +
  '366.3 224 384V472C224 494.1 206.1 512 184 512H128.1C126.6 512 125.1 511.9 ' +
  '123.6 511.8C122.4 511.9 121.2 512 120 512H104C81.91 512 64 494.1 64 472V360C64 ' +
  '359.1 64.03 358.1 64.09 357.2V287.6H32.05C14.02 287.6 0 273.5 0 255.5C0 246.5 ' +
  '3.004 238.5 10.01 231.5L266.4 8.016C273.4 1.002 281.4 0 288.4 0C295.4 0 303.4 ' +
  '2.004 309.5 7.014L416 100.7V64C416 46.33 430.3 32 448 32H480C497.7 32 512 46.33 ' +
  '512 64V185L564.8 231.5C572.8 238.5 576.9 246.5 575.8 255.5C575.8 273.5 '+
  '560.8 287.6 543.8 287.6L511.8 287.6z';
  /** The boolean representing if a favicon path has been provided by the user. */
  FAVICON_SET = false;
  /** The path to the user-provided favicon .ico file. */
  faviconPath: string;
  /** A string representing the path leading up to the geoJson file that was read in. */
  geoJSONBasePath: string = '';
  /** The layer's geoMapId property from the top level map configuration file. */
  geoMapID: string;
  /** The string representing a user's google tracking ID, set in the upper level
   * application config file. */
  googleAnalyticsTrackingId = '';
  /** Boolean showing whether the google tracking ID has been set for the InfoMapper. */
  googleAnalyticsTrackingIdSet = false;
  /** The file path as a string obtained from a graph template file that shows where
   * the graph data file can be found. */
  graphFilePath: string;
  /** Contains all information before the first tilde (~) in the TSID from the graph
   * template file. */
  graphTSID: string;
  /** Boolean showing whether the default home content page has been initialized. */
  homeInit = true;
  /** The string representing the current selected markdown path's full path starting
   * from the @var appPath */
  fullMarkdownPath: string;
  /** Contains any layer geoLayerId's of a layer that has run into a critical error. */
  layerError = {};
  /** Array to hold maps that have already been created by the user so that they
   * don't have to be created from scratch every time. */
  leafletMapArray: any[] = [];
  /** The object that holds the map configuration contents from the map configuration
   * file for a Leaflet map. */
  mapConfig: IM.GeoMapProject;
  /** Array of geoLayerId's in the correct geoLayerView order, retrieved from the
   * geoMap. The order in which each layer should be displayed in on the map and
   * side bar legend. */
  mapConfigLayerOrder: string[] = [];
  /** A string representing the path to the map configuration file. */
  mapConfigPath: string = '';
  /** Object containing the original style for a given feature. */
  originalFeatureStyle: any;
  /** Object containing a layer's geoLayerId as the key, and a boolean showing whether
   * the URL for the layer is not currently working or does not exist. */
  serverUnavailable: {} = {};

  
  /**
   * @constructor OWFCommonService.
   * @param http The reference to the HttpClient class for HTTP requests.
   */
  constructor(private http: HttpClient) { }


  /**
   * Returns the constant SVG path string for drawing the Font Awesome 6 house with
   * a chimney icon.
   */
  get houseChimneySVGPath(): string {
    return this.constHouseChimneySVGPath;
  }

  /**
   * 
   * @param geoLayerId The layer's geoLayerId to be added to the layerError array
   */
   addLayerError(geoLayerId: string): void {
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
  buildPath(pathType: string, arg?: any[]): string {
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
  condensePath(path: string, formatType?: string): string {
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

  featureHighlighted(highlighted: boolean): any {
    return this.highlighted.next(highlighted);
  }

  /**
   * Formats the path with either the correct relative path prepended to the destination
   * file, or the removal of the beginning '/' forward slash or an absolute path.
   * @param path The path to format.
   * @param pathType A string representing the type of path being formatted, so
   * the correct handling can be used.
   */
  formatPath(path: string, pathType: string): string {

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
  formatSaveFileName(saveFileName: string, saveFileType: IM.SaveFileType,
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
  getAppPath(): string {
    return this.appPath;
  }

  /**
   * Retrieves the bad path from the @var badPath object, and formats it if needed
   * to show in the warning tooltip.
   * @param geoLayerId The geoLayerId used as the key in the @var badPath to find
   * the correct layer's path.
   */
  getBadPath(geoLayerId: string): string {
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
  getChartTemplateObject(): Object {
    return this.chartTemplateObject;
  }

  /**
   * Iterates through all mainMenus and subMenus in the app configuration file and
   * determines the path to the first object with the markdownFile property.
   * @returns The markdownFile (contentPage) path found there that matches the given
   * geoLayerId.
   * @param id The geoLayerId to compare with.
   */
  getContentPathFromId(id: string) {
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

  getDashboardConfigPath(): string { return this.dashboardConfigPath; }

  /**
   * 
   * @param id 
   * @returns 
   */
   getDashboardConfigPathFromId(id: string): string {
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
   * 
   * @param id 
   * @returns 
   */
   getStoryConfigPathFromId(id: string): string {
    var storyPathExt: string;
    var splitStoryPath: string[];
    var storyPath = '';

    for (let mainMenu of this.appConfig.mainMenu) {
      if (mainMenu.menus) {
        for (let subMenu of mainMenu.menus) {
          if (subMenu.id === id) storyPathExt = subMenu.storyFile;
        }
      } else {
        if (mainMenu.id === id) storyPathExt = mainMenu.storyFile;
      }
    }

    splitStoryPath = storyPathExt.split('/');

    for (let i = 0; i < splitStoryPath.length - 1; i++) {
      storyPath += splitStoryPath[i] + '/';
    }

    storyPath.startsWith('/') ?
    this.dashboardConfigPath = storyPath.substring(1) :
    this.dashboardConfigPath = storyPath;

    return storyPathExt.startsWith('/') ?
    storyPathExt.substring(1) :
    storyPathExt;
  }

  /**
   * @returns The array of DataUnits from the DATAUNIT file.
   */
  getDataUnitArray(): any[] { return this.dataUnits; }

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
  getFullMapConfigPath(id: string, standalone?: string, configPath?: string): string {
    
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
  getFullMarkdownPath(): string { return this.fullMarkdownPath; }

  /**
   * @returns The path to the Gapminder config path. Is an empty string if no path
   * was previously set.
   */
  getGapminderConfigPath(): string { return this.gapminderConfigPath; }

  /**
   * @returns the base path to the GeoJson files being used in the application.
   * When prepended with the @var appPath, shows the full path the application
   * needs to find any GeoJson file.
   */
  getGeoJSONBasePath(): string { return this.geoJSONBasePath; }

  /**
   * @returns The file path as a string obtained from a graph template file that
   * shows where the graph data file can be found.
   */
  getGraphFilePath(): string { return this.graphFilePath; }

  /**
   * @returns The homePage property in the app-config file without the first '/' slash.
   */
  getHomePage(): string {
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
  getJSONData(path: string, type?: string, id?: string): Observable<any> {
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
   * @returns The layerError object, which contains any layer geoLayerId's of a
   * layer that has run into a critical error.
   */
  getLayerError(): any { return this.layerError; }

  /**
   * @returns The entire @var mapConfig object obtained from the map configuration
   * file. Essentially the geoMapProject.
   */
  getMapConfig() { return this.mapConfig; }

  /**
   * @returns The relative path to the map configuration file for the application
   */
  getMapConfigPath(): string { return this.mapConfigPath; }

  /**
   * @returns the style object containing the original properties for a given feature
   */
  getOriginalFeatureStyle(): any { return this.originalFeatureStyle; }

  /**
   * Read data asynchronously from a file or URL and return it as plain text.
   * @param path The path to the file to be read, or the URL to send the GET request.
   * @param type Optional type of request sent, e.g. IM.Path.cPP. Used for error
   * handling and messaging.
   * @param id Optional app-config id to help determine where exactly an error occurred.
   */
  getPlainText(path: string, type?: string, id?: string): Observable<any> {
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
  getProperties(): {} { return this.mapConfig.properties; }

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
  isBadPath(geoLayerId: string): boolean { 
    if (this.badPath) {
      return this.badPath[geoLayerId];
    } else return false;
  }

  /**
   * @returns a boolean showing whether the layer containing the given @var geoLayerId =
   * is unavailable to be shown on the map.
   * @param geoLayerId The geoLayerId from the layer to match to.
   */
  isServerUnavailable(geoLayerId: string): boolean {
    if (this.serverUnavailable[geoLayerId] === true) {
      // this.addLayerError(geoLayerId);
      return this.serverUnavailable[geoLayerId];
    } else return false;
  }

  /**
   * @returns true if the given property to be displayed in the Mat Table cell is a URL.
   * @param property The Mat Table cell property to check
   */
  isURL(property: any): boolean {
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
  obtainPropertiesFromLine(line: string, featureProperties: Object, key?: any,
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
   parseTSID(fullTSID: any): IM.TSID {

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
  resetMapConfigLayerOrder(): void { this.mapConfigLayerOrder = []; }

  /**
   * Run the appropriate PropFunction function that needs to be called on the ${} property value
   * @param featureValue The property value that needs to be manipulated
   * @param propFunction The PropFunction enum value to determine which implemented
   * function needs to be called.
   * @param args The optional arguments found in the parens of the PropFunction as a string
   */
  runPropFunction(featureValue: string, propFunction: IM.PropFunction, args?: string): string {
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
  sanitizeDoc(doc: string, pathType: IM.Path): string {
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
  setAppConfig(appConfig: IM.AppConfig): void { this.appConfig = appConfig; }

  /**
   * No configuration file was detected from the user, so the 'assets/app-default/'
   * path is set.
   * @param path The default assets path to set the @var appPath to
   */
  setAppPath(path: string): void { this.appPath = path; }

  /**
   *cs, or possibly creates the badPath object with the geo
   * @param geoLayerId The geoLayerId from the geoLayer where the bad path was set
   */
  setBadPath(path: string, geoLayerId: string): void {
    this.badPath[geoLayerId] = [true, path];
  }

  /**
   * Sets @var chartTemplateObject with the object read in from JSON graph template
   * file.
   * @param graphTemplateObject The graph template object obtained from the graph
   * template file.
   */
  setChartTemplateObject(graphTemplateObject: Object): void {
    this.chartTemplateObject = graphTemplateObject;
  }

  /**
   * Sets the @var dataUnits array to the passed in dataUnits from the nav-bar
   * @param dataUnits The array of DataUnits to set the service @var dataUnits to
   */
  setDataUnitsArr(dataUnits: any[]): void { this.dataUnits = dataUnits; }

  /**
   * 
   * @param path 
   */
  setFullMarkdownPath(path: string) { this.fullMarkdownPath = path; }

  /**
   * Sets @var gapminderConfigPath to the supplied absolute path. Used for using
   * relative paths from the Gapminder configuration file path.
   * @param configPath The absolute path to the Gapminder configuration file.
   */
  setGapminderConfigPath(configPath: string): void {
    this.gapminderConfigPath = configPath.substring(0, configPath.lastIndexOf('/') + 1);
  }

  /**
   * Sets the @var graphFilePath to the given path
   * @param path The path given in the graph template file TSID
   */
  setGraphFilePath(path: string): void {
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
  setGeoMapID(geoMapId: string): void { 
    this.geoMapID = geoMapId;
  }

  /**
   * Sets the @var mapConfig to the object obtained from the map configuration file
   * @param mapConfig The entire map configuration object to set to
   */
  setMapConfig(mapConfig: any): void {
    this.mapConfig = mapConfig;
  }

  /**
   * Sets the @var mapConfigPath to the path of the map configuration file in the
   * application.
   * @param path The path to set to.
   */
  setMapConfigPath(path: string): void { this.mapConfigPath = path; }

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
  setOriginalFeatureStyle(style: any): void { this.originalFeatureStyle = style; }

  /**
   * Sets the @var serverUnavailable with a key of @var geoLayerId to true.
   * @param geoLayerId The geoLayerId to compare to while creating the side bar
   */
  setServerUnavailable(geoLayerId: string): void {
    this.serverUnavailable[geoLayerId] = true;
  }

  /**
   * Sets the @var graphTSID to the given tsid.
   * @param tsid The tsid to set to
   */
  setTSIDLocation(tsid: string): void { this.graphTSID = tsid; }

  /**
   * Iterates over all mainMenu and subMenu objects in the application configuration
   * file and determines if the id property matches the provided Id given in the
   * URL.
   * @param urlId Id from the URL.
   * @returns True if the Id present in the current URL matches an Id from the app
   * config file, and false if not.
   */
  validID(urlId: string): boolean {

    for (let mainMenu of this.appConfig.mainMenu) {
      // If subMenus exist.
      if (mainMenu.menus) {
        for (let subMenu of mainMenu.menus) {
          if (subMenu.id === urlId) {
            return true;
          }
        }
      }
      // If no subMenus exist.
      else {
        if (mainMenu.id === urlId) {
          return true;
        }
      }
      
    }
    return false;
  }

}
