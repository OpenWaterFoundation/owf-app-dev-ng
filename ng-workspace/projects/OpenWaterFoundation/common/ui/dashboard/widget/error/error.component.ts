import { Component,
          Input }           from '@angular/core';

import * as IM              from '@OpenWaterFoundation/common/services';
import { DashboardService } from '../../dashboard.service';


@Component({
  selector: 'widget-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent {

  /** A string provided as input to this widget template tag that describes
   * what error occurred. */
  @Input('errorTypes') errorTypes: string[];
  /** An InfoMapper widget type to describe the widget where the error
   * took place. */
  @Input('name') errorWidgetName: IM.Widget;


  /**
   * @constructor The Error widget component constructor.
   */
  constructor(private dashboardService: DashboardService) {}


  /**
   * Determine what Chart widget error occurred.
   */
  private chartError(): void {

    this.errorTypes.forEach((errorType: string) => {
      switch(errorType) {
        case 'no chartFeaturePath': this.missingRequiredProp('chartFeaturePath'); break;
        case 'no graphTemplatePath': this.missingRequiredProp('graphTemplatePath'); break;
        case 'no name': this.missingRequiredProp('name'); break;
      }
    });
  }

  /**
   * There was an error getting the CSV file, either locally or from a server.
   */
  private csvError(): void {

    console.error('There was an issue with getting the CSV file from the ' +
    this.errorWidgetName + ' widget.');
    console.error('If it was a 500 error, refresh the page to resolve.');
  }

  /**
   * Determine what Dashboard error occurred. Happens when creating the dashboard,
   * before widget code is executed.
   */
  private dashboardError(): void {

    this.errorTypes.forEach((errorType: string) => {
      switch(errorType) {
        case 'no type': this.missingRequiredProp('type'); break;
        case 'unsupported type': this.unsupportedTypes(); break;
      }
    });
  }

  /**
   * Determine what Image widget error occurred.
   */
  private imageError(): void {

    this.errorTypes.forEach((errorType: string) => {
      switch(errorType) {
        case 'no imagePath': this.missingRequiredProp('imagePath'); break;
        case 'no name': this.missingRequiredProp('name'); break;
        case 'unsupported file': this.unsupportedFile(); break;
      }
    });
  }

  /**
   * Determine what Status Indicator widget error occurred.
   */
  private indicatorError(): void {

    this.errorTypes.forEach((errorType: string) => {
      switch(errorType) {
        case 'no dataFormat': this.missingRequiredProp('dataFormat'); break;
        case 'no title': this.missingRequiredProp('title'); break;
        case 'no value property':
          this.missingRequiredProp('`attributeName`, `columnName`, or `propertyName`'); break;
        case 'unsupported data type': /** ADD FUNCTION HERE. */ break;
      }
    });
  }

  /**
   * Called right after the constructor.
   */
  ngOnInit(): void {
    // Determine which widget is erroring.
    switch(this.errorWidgetName) {
      case IM.Widget.cht: this.chartError(); break;
      case IM.Widget.dsh: this.dashboardError(); break;
      case IM.Widget.img: this.imageError(); break;
      case IM.Widget.ind: this.indicatorError(); break;
      case IM.Widget.sel: this.selectorError(); break;
      case IM.Widget.tMd: this.textError(); break;
      case IM.Widget.tHL: this.textError(); break;
    }

    if (this.errorWidgetName !== IM.Widget.dsh) {
      this.printWidgetURL();
    }
  }

  /**
   * Universal error message for any widget not given a some property.
   */
  private missingRequiredProp(missingProp: string): void {

    console.error("Required property '" + missingProp + "' not found in the " +
    this.errorWidgetName + " widget. Confirm the '" + missingProp + "' property of this " +
    this.errorWidgetName + " widget exists.");
  }

  /**
   * 
   */
  private noJSONArrayName(): void {
    console.error("Property 'JSONArrayName' is required when using JSON data, " +
    "and was not found in the " + this.errorWidgetName + " widget. Add the property to the " +
    "widget object in the dashboard configuration file.");
  }

  /**
   * Prints the link to the offending widget's documentation page on GitHub.
   */
  private printWidgetURL(): void {

    var errorWidgetName = this.errorWidgetName.toLowerCase();

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
      switch(errorType) {
        case 'no dataPath': this.missingRequiredProp('dataPath'); break;
        case 'no dataFormat': this.missingRequiredProp('dataFormat'); break;
        case 'no displayName': this.missingRequiredProp('displayName'); break;
        case 'no name': this.missingRequiredProp('name'); break;
        case 'no JSONArrayName': this.noJSONArrayName(); break;
        case 'bad csv': this.csvError(); break;
      }
    });
  }

  /**
   * Determine what Text widget error occurred.
   */
  private textError(): void {

    this.errorTypes.forEach((errorType: string) => {
      switch(errorType) {
        case 'no textPath': this.missingRequiredProp('textPath'); break;
        case 'no name': this.missingRequiredProp('name'); break;
        case 'unsupported file': this.unsupportedFile(); break;
      }
    });
  }

  unsupportedDataType(): void {

  }

  /**
   * Error message if an unsupported file is provided in the dashboard configuration
   * file, and lists the currently supported files.
   */
  private unsupportedFile(): void {

    var supportedFiles: string[];

    switch(this.errorWidgetName) {
      case IM.Widget.img:
        supportedFiles = this.dashboardService.supportedImageFiles; break;
      case IM.Widget.tMd:
      case IM.Widget.tHL:
        supportedFiles = this.dashboardService.supportedTextFiles; break;
    }
    
    console.error('"' + this.errorWidgetName + '" widget data files must be one ' +
    'of the following supported types: [' + supportedFiles + ']');
  }

  /**
   * 
   */
  private unsupportedTypes(): void {
    console.error('Incorrectly named Dashboard widget type.');
    console.error('Widget type must be one of the following supported ' +
    'types: [' + this.dashboardService.supportedWidgetTypes + ']');
  }

}

