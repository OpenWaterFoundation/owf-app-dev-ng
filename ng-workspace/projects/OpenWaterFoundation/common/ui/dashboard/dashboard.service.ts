import { Injectable }  from '@angular/core';

import { BehaviorSubject,
          Observable, 
          of }         from 'rxjs';

import * as IM         from '@OpenWaterFoundation/common/services';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  /** Set to true if any error occurs in the Chart Widget. */
  private chartError: BehaviorSubject<boolean> = new BehaviorSubject(false);
  /** Array of ListenedToWidget objects, which contain the name of the widget that
   * is being listened to, and the BehaviorSubject attached to the widget. */
  private listenedToWidgets: IM.ListenedToWidget[] = [];
  /** Set to true if any error occurs in the Status Indicator Widget. */
  private indicatorError: BehaviorSubject<boolean> = new BehaviorSubject(false);
  /** Set to true if any error occurs in the Selector Widget. */
  private selectorError: BehaviorSubject<boolean> = new BehaviorSubject(false);
  /** The list of supported image widget files. */
  private readonly SUPPORTEDIMAGEFILES = [
    'jpg',
    'png'
  ];
  /** The currently supported widget types that can listen to the Select widget. */
  private readonly SUPPORTEDSELECTEVENTWIDGETS = [
    IM.Widget.cht,
    IM.Widget.ind
  ];
  /** The list of supported text widget files. */
  private readonly SUPPORTEDTEXTFILES = [
    'html',
    'md'
  ];
  /** The currently supported Widget types for the Dashboard. */
  private readonly SUPPORTEDWIDGETTYPES = [
    'chart',
    'diagnostics',
    'image',
    'map',
    'selector',
    'statusIndicator',
    'textMarkdown',
    'textHTML'
  ];


  constructor() {}


  /**
   * Observable used in the Chart Widget that's used with an async pipe in the template
   * file to show the widget or error content.
   */
   get isChartError(): Observable<boolean> {
    return this.chartError.asObservable();
  }

  /**
   * Toggles the chartError BehaviorSubject between true and false.
   */
  set setChartError(error: boolean) {
    this.chartError.next(error);
  }

  /**
   * Observable used in the StatusIndicator Widget that's used with an async pipe
   * in the template file to show the widget or error content.
   */
  get isIndicatorError(): Observable<boolean> {
    return this.indicatorError.asObservable();
  }

  /**
   * Toggles the indicatorError BehaviorSubject between true and false.
   */
  set setIndicatorError(error: boolean) {
    this.indicatorError.next(error);
  }
  
  /**
   * Observable used in the Selector Widget that's used with an async pipe in the template
   * file to show the widget or error content.
   */
  get isSelectorError(): Observable<boolean> {
    return this.selectorError.asObservable();
  }

  /**
   * Toggles the selectorError BehaviorSubject between true and false.
   */
  set setSelectorError(error: boolean) {
    this.selectorError.next(error);
  }

  /**
   * Getter for all supported image files.
   */
   get supportedImageFiles(): string[] {
    return this.SUPPORTEDIMAGEFILES;
  }
  
  /**
   * Getter for all supported widgets that can listen to a SelectEvent.
   */
  get supportedSelectEventWidgets(): string[] {
    return this.SUPPORTEDSELECTEVENTWIDGETS
  }
  
  /**
   * Getter for all supported text files.
   */
  get supportedTextFiles(): string[] {
    return this.SUPPORTEDTEXTFILES;
  }
  
  /**
   * Getter for all supported widget types.
   */
  get supportedWidgetTypes(): string[] {
    return this.SUPPORTEDWIDGETTYPES;
  }

  /**
   * Determines if a widget supports the SelectEvent type.
   */
  private canSelect(widget: IM.DashboardWidget): boolean {
    for (let supportedWidgetType of this.SUPPORTEDSELECTEVENTWIDGETS) {
      if (supportedWidgetType.toLowerCase() === widget.type.toLowerCase()) {
        return true;
      }
    }
    return false;
  }

  /**
   * @param features Array of all GeoJSON objects.
   * @returns An array of only the extracted feature objects to keep the allFeatures
   * class variable agnostic going forward.
   */
  getAllProperties(features: any[]): any[] {
    var featureProperties: any[] = [];

    features.forEach((feature: any) => {
      featureProperties.push(feature.properties);
    });
    return featureProperties;
  }

  /**
   * 
   * @param widget 
   * @returns 
   */
  getProvidedValue(widget: IM.StatusIndicatorWidget): string {

    if (widget.attributeName) {
      return widget.attributeName;
    } else if (widget.columnName) {
      return widget.columnName;
    } else if (widget.propertyName) {
      return widget.propertyName;
    }
    return null;
  }

  /**
   * Determines whether the widget calling this method is allowed to listen to an
   * event, and returns the correct observable from the dynamically made listenedToWidgets
   * array.
   * @returns An Observable of a WidgetEvent if all checks were passed, or null. 
   */
  getWidgetEvent(widget: IM.DashboardWidget): Observable<IM.WidgetEvent> {


    if (widget.eventHandlers && this.isSupportedWidgetEvent(widget) === true) {

      for (let listenedToWidget of this.listenedToWidgets) {
        for (let eventHandler of widget.eventHandlers) {
          if (eventHandler.widgetName.toLowerCase() === listenedToWidget.name.toLowerCase()) {
            return listenedToWidget.behaviorSubject.asObservable();
          }
        }
      }
    }
    return of(null);
  }

  /**
   * Determines whether a widget's eventHandler object wants to listen to a SelectEvent.
   * @param widget The widget object whose eventHandlers are checked.
   * @returns True if the widget eventHandler object's eventType is SelectEvent,
   * and false otherwise.
   */
  hasSelectEvent(widget: IM.DashboardWidget): boolean {

    if (!widget.eventHandlers) {
      return false;
    }
    
    for (let widgetEvent of widget.eventHandlers) {
      if (widgetEvent.eventType.toLowerCase() === 'selectevent') {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks to see if the widget that wants to listen to a specific event is supported.
   * @param widget The widget object.
   * @returns A boolean whether the widget's eventHandler eventType is supported.
   */
  private isSupportedWidgetEvent(widget: IM.DashboardWidget): boolean {

    switch(widget.eventHandlers[0].eventType.toLowerCase()) {
      case 'selectevent': return this.canSelect(widget);
      default: return false;
    }
  }

  /**
   * 
   * @param widget 
   * @returns 
   */
  isSupportedWidgetType(widget: IM.DashboardWidget): boolean {

    for (let supportedWidgetType of this.SUPPORTEDWIDGETTYPES) {
      if (widget.type.toLowerCase() === supportedWidgetType.toLowerCase()) {
        return true;
      }
    }
    return false;
  }

  /**
   * Builds the CSV array using the data object returned from Papaparse and returns
   * it in a way that the consuming widget can use.
   * @param csvData The CSV object read in from a widget's `dataPath` property.
   * @param widget The widget to use the CSV data.
   * @returns The processed/filtered CSV data that the widget can use.
   */
  processWidgetCSVData(csvData: any, widget: IM.SelectorWidget | IM.StatusIndicatorWidget): any[] {

    var headers: string[] = csvData[
      widget.skipDataLines ? widget.skipDataLines : 0
    ];

    var lineToStart = widget.skipDataLines ?
    (widget.skipDataLines + 1) : 1;

    var parsedResult: any[] = [];

    for (let dataIndex = lineToStart; dataIndex < csvData.length; ++dataIndex) {

      var parsedObject = {};

      for (let headerIndex = 0; headerIndex < headers.length; ++headerIndex) {
        parsedObject[headers[headerIndex]] = csvData[dataIndex][headerIndex];
      }
      parsedResult.push(parsedObject);
    }

    return parsedResult;
  }

  /**
   * Determines what kind of JSON object was read in and processes and returns it
   * in a way that the consuming widget can use.
   * @param JSONData The JSON object read in from a widget's `dataPath` property.
   * @returns The processed/filtered JSON data that the widget can use.
   */
  processWidgetJSONData(JSONData: any, widget: IM.StatusIndicatorWidget): any[] {

    // geoJson.
    if (JSONData.features) {
      return this.getAllProperties(JSONData.features);
    }
    // JSON object with a named array.
    else if (JSONData[widget.JSONArrayName]) {
      return JSONData[widget.JSONArrayName];
    }
    // JSON unnamed array.
    else if (JSONData.length) {
      return JSONData;
    }
    // Unsupported.
    else {
      return null;
    }
  }

  /**
   * Looks through the list of widgets that are currently being listened to, and
   * uses its 
   * @param widgetEvent The widgetEvent to update using the appropriate BehaviorSubject.
   */
  sendWidgetEvent(widgetEvent: IM.WidgetEvent): void {
    
    for (let listenedToWidget of this.listenedToWidgets) {
      if (widgetEvent.widgetName.toLowerCase() === listenedToWidget.name.toLowerCase()) {
        listenedToWidget.behaviorSubject.next(widgetEvent);
      }
    }
  }

  /**
   * Adds ListenedToWidget objects into the listenedToWidgets array based on the
   * provided eventHandlers property in the dashboard configuration file.
   * @param dashboardConfig The dashboard configuration object.
   */
  createListenedToWidgets(dashboardConfig: IM.DashboardConf): void {

    var listenedToWidgetNames: string[] = [];

    dashboardConfig.widgets.forEach((widget: IM.DashboardWidget) => {
      
      if (widget.eventHandlers) {
        widget.eventHandlers.forEach((eventHandler: IM.WidgetEventHandler) => {

          // Check if the widget has already been added to the listenedToWidgets
          // array.
          if (listenedToWidgetNames.includes(eventHandler.widgetName)) {
            return;
          }
          listenedToWidgetNames.push(eventHandler.widgetName);

          this.listenedToWidgets.push({
            name: eventHandler.widgetName,
            behaviorSubject: new BehaviorSubject(null)
          });
        });
      } else return;
    });

    // console.log('listenedToWidgets:', this.listenedToWidgets);
  }

}