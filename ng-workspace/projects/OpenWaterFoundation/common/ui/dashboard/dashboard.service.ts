import { Injectable }  from '@angular/core';

import { BehaviorSubject,
          Observable } from 'rxjs';

import * as IM         from '@OpenWaterFoundation/common/services';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  
  /** Set to true if any errors occur in the Status Indicator Widget. */
  private indicatorError: BehaviorSubject<boolean> = new BehaviorSubject(false);
  /** Set to true if any errors occur in the Text Indicator Widget. */
  private textError: BehaviorSubject<boolean> = new BehaviorSubject(false);
  /** Set to true if any errors occur in the Title Indicator Widget. */
  private titleError: BehaviorSubject<boolean> = new BehaviorSubject(false);
  /** A read only object for dynamically using operators between two integers. */
  readonly operators = {
    '>': function (a: any, b: any) { return a > b; },
    '>=': function (a: any, b: any) { return a >= b; },
    '<': function (a: any, b: any) { return a < b; },
    '<=': function (a: any, b: any) { return a <= b; }
  }
  /** Set to true if any error occurs in the Selector Widget. */
  private selectorError: BehaviorSubject<boolean> = new BehaviorSubject(false);
  /** The list of supported image widget files. */
  private readonly SUPPORTEDIMAGEFILES = [
    'jpg',
    'png'
  ];
  /** The list of supported text widget files. */
  private readonly SUPPORTEDTEXTFILES = [
    'HTML',
    'Markdown'
  ];
  /** The currently supported Widget types for the Dashboard. */
  private readonly SUPPORTEDWIDGETTYPES = [
    'chart',
    'diagnostics',
    'image',
    'map',
    'selector',
    'statusIndicator',
    'text',
    'title'
  ];


  constructor() {}


  /**
   * Observable used in the StatusIndicator Widget with an async pipe
   * in the template file to show the widget or error content.
   */
  get isIndicatorError(): Observable<boolean> { return this.indicatorError.asObservable(); }
  /**
   * Toggles the indicatorError BehaviorSubject between true and false.
   */
  set setIndicatorError(error: boolean) { this.indicatorError.next(error); }
  /**
   * Observable used in the Selector Widget with an async pipe in the template
   * file to show the widget or error content.
   */
  get isSelectorError(): Observable<boolean> { return this.selectorError.asObservable(); }
  /**
   * Toggles the selectorError BehaviorSubject between true and false.
   */
  set setSelectorError(error: boolean) { this.selectorError.next(error); }
  /**
   * Observable used in the Text Widget with an async pipe in the template
   * file to show the widget or error content.
   */
  get isTextError(): Observable<boolean> { return this.textError.asObservable(); }
  /**
   * Toggles the textError BehaviorSubject between true and false.
   */
  set setTextError(error: boolean) { this.textError.next(error); }
  /**
   * Observable used in the Text Widget with an async pipe in the template
   * file to show the widget or error content.
   */
  get isTitleError(): Observable<boolean> { return this.titleError.asObservable(); }
   /**
    * Toggles the textError BehaviorSubject between true and false.
    */
  set setTitleError(error: boolean) { this.titleError.next(error); }
  /**
   * Getter for all supported image files.
   */
  get supportedImageFiles(): string[] { return this.SUPPORTEDIMAGEFILES; }
  /**
   * Getter for all supported text files.
   */
  get supportedTextFiles(): string[] { return this.SUPPORTEDTEXTFILES; }
  /**
   * Getter for all supported widget types.
   */
  get supportedWidgetTypes(): string[] { return this.SUPPORTEDWIDGETTYPES; }

  /**
   * @returns An object representing what the current cell's valueMin, valueMax,
   * and valueMin & valueMax operators are. Used for deciding what operators to
   * look between the values.
   * @param line The valueMax property of one line from the CSV classification
   * file for Graduated layers.
   */
  determineValueOperator(line: any): any {

    var valueMin: any = null;
    var valueMax: any = null;
    var minOp: IM.Operator = null;
    var maxOp: IM.Operator = null;
    var minOpPresent = false;
    var maxOpPresent = false;

    // Check to see if either of them are actually positive or negative infinity.
    if (line.valueMin.toUpperCase().includes('-INFINITY')) {
      valueMin = Number.MIN_SAFE_INTEGER;
      minOp = IM.Operator.gt;
    }
    if (line.valueMax.toUpperCase().includes('INFINITY')) {
      valueMax = Number.MAX_SAFE_INTEGER;
      maxOp = IM.Operator.lt;
    }

    // Contains operator
    if (line.valueMin.includes(IM.Operator.gt)) {
      valueMin = parseFloat(line.valueMin.replace(IM.Operator.gt, ''));
      minOp = IM.Operator.gt;
      minOpPresent = true;
    }
    if (line.valueMin.includes(IM.Operator.gtet)) {
      valueMin = parseFloat(line.valueMin.replace(IM.Operator.gtet, ''));
      minOp = IM.Operator.gtet;
      minOpPresent = true;
    }
    if (line.valueMin.includes(IM.Operator.lt)) {
      valueMin = parseFloat(line.valueMin.replace(IM.Operator.lt, ''));
      minOp = IM.Operator.lt;
      minOpPresent = true;
    }
    if (line.valueMin.includes(IM.Operator.ltet)) {
      valueMin = parseFloat(line.valueMin.replace(IM.Operator.ltet, ''));
      minOp = IM.Operator.ltet;
      minOpPresent = true;
    }

    // Contains operator
    if (line.valueMax.includes(IM.Operator.gt)) {
      valueMax = parseFloat(line.valueMax.replace(IM.Operator.gt, ''));
      maxOp = IM.Operator.gt;
      maxOpPresent = true;
    }
    if (line.valueMax.includes(IM.Operator.gtet)) {
      valueMax = parseFloat(line.valueMax.replace(IM.Operator.gtet, ''));
      maxOp = IM.Operator.gtet;
      maxOpPresent = true;
    }
    if (line.valueMax.includes(IM.Operator.lt)) {
      valueMax = parseFloat(line.valueMax.replace(IM.Operator.lt, ''));
      maxOp = IM.Operator.lt;
      maxOpPresent = true;
    }
    if (line.valueMax.includes(IM.Operator.ltet)) {
      valueMax = parseFloat(line.valueMax.replace(IM.Operator.ltet, ''));
      maxOp = IM.Operator.ltet;
      maxOpPresent = true;
    }

    // If no operator is detected in the valueMin property.
    if (minOpPresent === false) {
      valueMin = parseFloat(line.valueMin);
      minOp = IM.Operator.gt;
    }
    // If no operator is detected in the valueMax property.
    if (maxOpPresent === false) {
      valueMax = parseFloat(line.valueMax);
      maxOp = IM.Operator.ltet;
    }

    // The following two if, else if statements are done if only a number is given as valueMin and valueMax.
    // If the line.valueMin is an integer or float.
    // if (MapUtil.isInt(line.valueMin)) {
    //   valueMin = parseInt(line.valueMin);
    //   minOp = IM.Operator.gtet;
    // } else if (MapUtil.isFloat(line.valueMin)) {
    //   valueMin = parseFloat(line.valueMin);
    //   minOp = IM.Operator.gt;
    // }

    // If the line.valueMax is an integer or float.
    // if (MapUtil.isInt(line.valueMax)) {
    //   valueMax = parseInt(line.valueMax);
    //   maxOp = IM.Operator.ltet;
    // } else if (MapUtil.isFloat(line.valueMax)) {
    //   valueMax = parseFloat(line.valueMax);
    //   maxOp = IM.Operator.ltet;
    // }

    // Each of the attributes below have been assigned; return as an object.
    return {
      valueMin: valueMin,
      valueMax: valueMax,
      minOp: minOp,
      maxOp: maxOp,
      level: line.level
    }

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

}