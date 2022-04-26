import { Component,
          Input } from '@angular/core';

import * as IM    from '@OpenWaterFoundation/common/services';


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
  /** The list of supported image widget files. */
  readonly supportedImageFiles: string[] = [
    'jpg',
    'png'
  ];
  /** The list of supported text widget files. */
  readonly supportedTextFiles: string[] = [
    'html',
    'md'
  ];

  /**
   * @constructor The Error widget component constructor.
   */
  constructor() {}


  /**
   * Determine what Chart widget error occurred.
   */
  private chartError(): void {

    this.errorTypes.forEach((errorType: string) => {
      switch(errorType) {
        case 'no chartFeaturePath': this.noDataPath('chartFeaturePath'); break;
        case 'no graphTemplatePath': this.noDataPath('graphTemplatePath'); break;
      }
    });
  }

  /**
   * Determine what Image widget error occurred.
   */
  private imageError(): void {

    this.errorTypes.forEach((errorType: string) => {
      switch(errorType) {
        case 'no imagePath': this.noDataPath('imagePath'); break;
        case 'unsupported file': this.unsupportedFile(); break;
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
      case IM.Widget.img: this.imageError(); break;
      case IM.Widget.sel: this.selectorError(); break;
      case IM.Widget.txt: this.textError(); break;
    }

    this.printWidgetURL();
  }

  /**
   * Universal error message for any widget not given a `dataPath` property.
   */
  private noDataPath(dataPathName: string): void {

    console.error("Required property '" + dataPathName + "' not found in the " +
    this.errorWidgetName + " widget. Confirm the '" + dataPathName + "' property of this " +
    this.errorWidgetName + " widget exists.");
  }

  /**
   * Prints the link to the offending widget's documentation page on GitHub.
   */
  private printWidgetURL(): void {

    var widgetDocURL = 'https://github.com/OpenWaterFoundation/owf-app-infomapper-ng-doc-user/' +
    'blob/master/mkdocs-project/docs/appendix-adding-a-dashboard/widget-' +
    this.errorWidgetName.toLowerCase() + '.md';

    console.error("Widget documentation can be found at " + widgetDocURL + ".");
  }

  /**
   * 
   */
  private selectorError(): void {

    this.errorTypes.forEach((errorType: string) => {
      switch(errorType) {
        case 'no dataPath': this.noDataPath('dataPath'); break;
        case 'no dataFormat': this.noDataPath('dataFormat'); break;
        case 'no displayName': this.noDataPath('displayName'); break;
      }
    });
  }

  /**
   * Determine what Text widget error occurred.
   */
  private textError(): void {

    this.errorTypes.forEach((errorType: string) => {
      switch(errorType) {
        case 'no textPath': this.noDataPath('textPath'); break;
        case 'unsupported file': this.unsupportedFile(); break;
      }
    });
  }

  /**
   * Error message if an unsupported file is provided in the dashboard configuration
   * file, and lists the currently supported files.
   */
  private unsupportedFile(): void {

    var supportedFiles: string[];

    switch(this.errorWidgetName) {
      case IM.Widget.img:
        supportedFiles = this.supportedImageFiles; break;
      case IM.Widget.txt:
        supportedFiles = this.supportedTextFiles; break;
    }
    
    console.error('"' + this.errorWidgetName + '" widget data files must be one ' +
    'of the following supported types: [' + supportedFiles + ']');
  }

}

