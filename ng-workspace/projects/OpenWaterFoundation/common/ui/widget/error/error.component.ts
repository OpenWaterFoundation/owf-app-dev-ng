import { Component,
          Input }           from '@angular/core';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';
import { WidgetService }    from '../widget.service';


@Component({
  selector: 'widget-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent {

  @Input('errorType') errorType: string;

  @Input('name') errorWidgetName: IM.Widget;

  readonly supportedImageFiles = [
    'jpg',
    'png'
  ];

  readonly supportedTextFiles = [
    'html',
    'md'
  ];

  /**
   * 
   * @param owfCommonService The injected Common library service.
   * @param widgetService The inject local Widget service.
   */
  constructor(private owfCommonService: OwfCommonService,
              private widgetService: WidgetService) {}


  /**
   * 
   */
  imageError(): void {
    switch(this.errorType) {
      case 'no dataPath': this.noDataPath(); break;
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
      case IM.Widget.text: 
    }
  }

  /**
   * 
   */
  noDataPath(): void {
    console.error('No "dataPath" property found for the "' + this.errorWidgetName +
    '" Widget. Confirm the "dataPath" property of this ' + this.errorWidgetName +
    ' widget has been provided and is correct.');
  }

  textError(): void {
    switch(this.errorType) {
      case 'no dataPath': this.noDataPath(); break;
      case 'unsupported file': this.unsupportedFile(); break;
    }
  }

  /**
   * 
   */
  unsupportedFile(): void {
    
    console.error('"' + this.errorWidgetName + '" data files must be one of the following' +
    ' supported types: ');
  }

}

