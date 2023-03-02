import { Component,
          Input } from '@angular/core';

import { ImageWidget,
          OwfCommonService,
          Path }  from '@OpenWaterFoundation/common/services';


@Component({
  selector: 'widget-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.css']
})
export class ImageComponent {

  /** The attribute provided to this component when created, e.g.
   *   <widget-image [imageWidget]="path/to/image.png"></widget-image> */
  @Input('imageWidget') imageWidget: ImageWidget;
  /** String array representing the type of error that occurred while building this
   * widget. Used by the error widget. */
  errorTypes: string[] = [];
  /** The path to the image file after it has been built with the OWF service to
   * deal with either an absolute or relative path provided. */
  fullDataPath: string;
  /** Set to true if no path is given or a bad path is provided in the dashboard
    * configuration file. */
  widgetError: boolean;


  /**
   * Constructor for the ImageComponent.
   * @param commonService Reference to the injected Common library service.
   */
  constructor(private commonService: OwfCommonService) {
    
  }


  /**
   * Checks if the widget object passes initial mandatory property tests, and creates
   * and displays an error widget if not.
   */
  private checkWidgetObject(): void {

    if (!this.imageWidget.imagePath) {
      this.widgetError = true;
      this.errorTypes.push('no imagePath');
      return;
    }
    if (!this.imageWidget.name) {
      this.widgetError = true;
      this.errorTypes.push('no name');
      return;
    }

    this.fullDataPath = this.commonService.buildPath(Path.dbP, this.imageWidget.imagePath);
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive. Called after the constructor.
   */
  ngOnInit(): void {

    this.checkWidgetObject();
  }

}
