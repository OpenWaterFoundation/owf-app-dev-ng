import { Component,
          Input }           from '@angular/core';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';


@Component({
  selector: 'widget-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.css']
})
export class ImageComponent {

  /** The attribute provided as an attribute to this component when created, e.g.
   *   <widget-image [dataPath]="path/to/image.png"></widget-image> */
  @Input() dataPath: string;

  errorType: string;
  /** The path to the image file after it has been built with the OWF service to
   * deal with either an absolute or relative path provided. */
  fullDataPath: string;

  widgetError: boolean;


  /**
   * 
   * @param commonService The injected Common library service.
   */
  constructor(private commonService: OwfCommonService) {}


  /**
   * Called right after the constructor.
   */
  ngOnInit(): void {

    if (!this.dataPath) {
      this.widgetError = true;
      this.errorType = 'no dataPath';
      return;
    }
    this.fullDataPath = this.commonService.buildPath(IM.Path.dbP, [this.dataPath]);
  }

  

}
