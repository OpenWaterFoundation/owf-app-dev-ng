import { Component,
          Input }           from '@angular/core';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';


@Component({
  selector: 'widget-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent {

  /** A string provided as input to this widget template tag that describes
   * what error occurred. */
  @Input('errorType') errorType: string;
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
   * @param commonService The injected Common library service.
   */
  constructor(private commonService: OwfCommonService) {}


  /**
   * Determine what Image widget error occurred.
   */
  imageError(): void {
    switch(this.errorType) {
      case 'no imagePath': this.noDataPath('imagePath'); break;
      case 'unsupported file': this.unsupportedFile(); break;
    }
  }

  /**
   * Called right after the constructor.
   */
  ngOnInit(): void {
    // Determine which widget is erroring.
    switch(this.errorWidgetName) {
      case IM.Widget.img: this.imageError(); break;
      case IM.Widget.text: this.textError(); break;
    }
  }

  /**
   * Universal error message for any widget not given a `dataPath` property.
   */
  noDataPath(dataPathName: string): void {
    console.error("No '" + dataPathName + "' property found for the " + this.errorWidgetName +
    " Widget. Confirm the '" + dataPathName + "' property of this " + this.errorWidgetName +
    " widget has been provided and is correct.");
  }

  /**
   * Determine what Text widget error occurred.
   */
  textError(): void {
    switch(this.errorType) {
      case 'no textPath': this.noDataPath('textPath'); break;
      case 'unsupported file': this.unsupportedFile(); break;
    }
  }

  /**
   * Error message if an unsupported file is provided in the dashboard configuration
   * file, and lists the currently supported files.
   */
  unsupportedFile(): void {

    var supportedFiles: string[];

    switch(this.errorWidgetName) {
      case IM.Widget.img:
        supportedFiles = this.supportedImageFiles; break;
      case IM.Widget.text:
        supportedFiles = this.supportedTextFiles; break;
    }
    
    console.error('"' + this.errorWidgetName + '" widget data files must be one ' +
    'of the following supported types: [' + supportedFiles + ']');
  }

}

