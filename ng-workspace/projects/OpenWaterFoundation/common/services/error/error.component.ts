import { Component,
          Input, 
          OnInit}                from '@angular/core';

import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

import * as IM                   from '../types';
import { StaticStructures }      from '../static-structures';


@Component({
  selector: 'common-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {

  /** A string describing where (what component) the error came from. */
  @Input('errorLocation') errorLocation: string;
  /** An array of strings provided as input to this component template tag that
   * describe what errors occurred. */
  @Input('errorTypes') errorTypes: string[];
  /** The offending widget object. */
  @Input('widget') widget: IM.DashboardWidget;
  /** All used icons in the ErrorComponent. */
  faTriangleExclamation = faTriangleExclamation;

  /**
  * @constructor The Error widget component constructor.
  */
  constructor() { }


  /**
  * A TSID with no tildes added was used in a widget.
  */
  badTSIDError(): void {
    console.error('Incorrectly made TSID from the ' + this.widget.type + ' widget ' +
      'with name "' + this.widget.name + '". A path is required.');
  }

  /**
  * Determine what Chart widget error occurred.
  */
  private chartError(): void {

    this.errorTypes.forEach((errorType: string) => {
      switch (errorType) {
        case 'no type': this.noRequiredProperty('type'); break;
        case 'bad TSID': this.badTSIDError(); break;
        case 'no chartFeaturePath': this.noRequiredProperty('chartFeaturePath'); break;
        case 'no graphTemplatePath': this.noRequiredProperty('graphTemplatePath'); break;
        case 'no name': this.noRequiredProperty('name'); break;
      }
    });
  }

  /**
  * There was an error getting the CSV file, either locally or from a server.
  */
  private csvError(): void {

    console.error('There was an issue with getting the CSV file from the ' +
      this.widget.type + ' widget with name "' + this.widget.name + '".');
    console.error('If it was a 500 error, refresh the page to resolve.');
  }

  /**
   * 
   */
  private dashboardError(): void {

    // Determine which widget is erroring.
    switch (this.widget.type) {
      case IM.Widget.cht: this.chartError(); break;
      case IM.Widget.img: this.imageError(); break;
      case IM.Widget.ind: this.indicatorError(); break;
      case IM.Widget.sel: this.selectorError(); break;
      case IM.Widget.txt: this.textError(); break;
      case IM.Widget.ttl: this.titleError(); break;
      case undefined: this.noRequiredProperty('type'); break;
      default: this.unsupportedTypes(); break;
    }
    this.printWidgetURL();
  }

  /**
  * Determine what Image widget error occurred.
  */
  private imageError(): void {

    this.errorTypes.forEach((errorType: string) => {
      switch (errorType) {
        case 'no type': this.noRequiredProperty('type'); break;
        case 'no imagePath': this.noRequiredProperty('imagePath'); break;
        case 'no name': this.noRequiredProperty('name'); break;
        case 'unsupported file': this.unsupportedFile(); break;
      }
    });
  }

  /**
  * Determine what Status Indicator widget error occurred.
  */
  private indicatorError(): void {

    this.errorTypes.forEach((errorType: string) => {
      switch (errorType) {
        case 'no type': this.noRequiredProperty('type'); break;
        case 'no dataFormat': this.noRequiredProperty('dataFormat'); break;
        case 'no title': this.noRequiredProperty('title'); break;
        case 'no value property':
          this.noRequiredProperty('`attributeName`, `columnName`, or `propertyName`'); break;
        case 'unsupported data type': /** ADD FUNCTION HERE. */ break;
      }
    });
  }

  /**
  * Called right after the constructor.
  */
  ngOnInit(): void {

    if (this.errorLocation.includes('dashboard') || this.errorLocation.includes('widget')) {
      this.dashboardError();
    }

    
  }

  /**
  * Universal error message for any widget not given a some property.
  */
  private noRequiredProperty(missingProp: string): void {

    console.error("Required property '" + missingProp + "' not found in the " +
      this.widget.type + " widget with name \"" + this.widget.name +
      "\". Confirm the '" + missingProp + "' property of this " +
      this.widget.type + " widget exists.");
  }

  /**
  * Prints an error message saying that the JSONArrayName is required.
  */
  private noJSONArrayName(): void {
    console.error("Property 'JSONArrayName' is required when using JSON data, " +
      "and was not found in the " + this.widget.type + " widget with name \"" +
      this.widget.name + "\". Add the property to the " +
      "widget object in the dashboard configuration file.");
  }

  /**
  * Prettily prints all elements of a supported array so it's easier for a user
  * to discern what went wrong.
  * @param type The array of all currently supported files, types, etc.
  * @returns A string to be displayed in an error message.
  */
  private prettifySupported(type: string): string {

    var allTypes: string[] = [];

    switch (type) {
      case 'widgetTypes': allTypes = StaticStructures.supportedWidgetTypes; break;
      case 'imageFiles': allTypes = StaticStructures.supportedImageFiles; break;
      case 'textFiles': allTypes = StaticStructures.supportedTextFiles; break;
    }

    var prettifiedSupported = '';

    for (let i = 0; i < allTypes.length; ++i) {
      if (i === allTypes.length - 1) {
        prettifiedSupported += '"' + allTypes[i] + '"';
      } else {
        prettifiedSupported += '"' + allTypes[i] + '", ';
      }
    }
    return prettifiedSupported;
  }

  /**
  * Prints the link to the offending widget's documentation page on GitHub if
  * the type exists, otherwise return.
  */
  private printWidgetURL(): void {

    if (!this.widget.type) {
      return;
    }

    var errorWidgetName = this.widget.type.toLowerCase();

    // Make sure the errorWidgetName will work with the GitHub URL.
    if (errorWidgetName.includes('statusindicator')) {
      errorWidgetName = 'status-indicator';
    }

    var widgetDocURL = 'https://github.com/OpenWaterFoundation/owf-app-infomapper-ng-doc-user/' +
      'blob/master/mkdocs-project/docs/appendix-adding-a-dashboard/widget-' +
      errorWidgetName + '.md';

    console.error("Widget documentation can be found at " + widgetDocURL + ".");
  }

  /**
  * Determine what Selector widget error occurred.
  */
  private selectorError(): void {

    this.errorTypes.forEach((errorType: string) => {
      switch (errorType) {
        case 'bad csv': this.csvError(); break;
        case 'no type': this.noRequiredProperty('type'); break;
        case 'no dataPath': this.noRequiredProperty('dataPath'); break;
        case 'no dataFormat': this.noRequiredProperty('dataFormat'); break;
        case 'no displayName': this.noRequiredProperty('displayName'); break;
        case 'no name': this.noRequiredProperty('name'); break;
        case 'no JSONArrayName': this.noJSONArrayName(); break;
      }
    });
  }

  /**
  * Determine what Text widget error occurred.
  */
  private textError(): void {

    this.errorTypes.forEach((errorType: string) => {
      switch (errorType) {
        case 'no type': this.noRequiredProperty('type'); break;
        case 'no contentType': this.noRequiredProperty('contentType'); break;
        case 'no textPath': this.noRequiredProperty('textPath'); break;
        case 'no name': this.noRequiredProperty('name'); break;
        case 'unsupported file': this.unsupportedFile(); break;
      }
    });
  }

  /**
  * Determine what Title widget error occurred.
  */
  private titleError(): void {

    this.errorTypes.forEach((errorType: string) => {
      switch (errorType) {
        case 'no title': this.noRequiredProperty('title'); break;
        case 'no name': this.noRequiredProperty('name'); break;
      }
    });
  }

  /**
  * Error message if an unsupported file is provided in the dashboard configuration
  * file, and lists the currently supported files.
  */
  private unsupportedFile(): void {

    var fileType: string;

    switch (this.widget.type) {
      case IM.Widget.img:
        fileType = 'imageFiles';
      case IM.Widget.txt:
        fileType = 'textFiles';
    }

    console.error('Widget name "' + this.widget.name + '" is using an unsupported file.');
    console.error('"' + this.widget.type + '" widget data files must be one ' +
      'of the following supported types: ' +
      this.prettifySupported(fileType) + '.');
  }

  /**
  * Prettily prints a message that lists all currently supported dashboard widget
  * types and alerts the user what was given is unsupported.
  */
  private unsupportedTypes(): void {

    console.error('Dashboard widget type "' + this.widget.type + '" with name "' +
      this.widget.name + '" is unsupported.');
    console.error('Widget type must be one of the following supported ' +
      'types: ' + this.prettifySupported('widgetTypes') + '.');
  }

}

