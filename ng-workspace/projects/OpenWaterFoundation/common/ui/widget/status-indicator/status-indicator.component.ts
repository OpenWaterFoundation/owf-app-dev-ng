import { Component,
          Input }           from '@angular/core';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';


@Component({
  selector: 'widget-status-indicator',
  templateUrl: './status-indicator.component.html',
  styleUrls: ['./status-indicator.component.css']
})
export class StatusIndicatorComponent {
  
  /** Displays a red down caret icon in the widget if set to true. */
  changeDecBad: boolean;
  /** Displays a green down caret icon in the widget if set to true. */
  changeDecGood: boolean;
  /** Displays a red up caret icon in the widget if set to true. */
  changeIncBad: boolean;
  /** Displays a green up caret icon in the widget if set to true. */
  changeIncGood: boolean;
  /** Displays a red X icon in the widget if set to true. */
  failureIndicator: boolean;
  /** Displays a green check icon in the widget if set to true. */
  passingIndicator: boolean;
  /** The title of this widget from the widget's `title` property in the dashboard
   * configuration file. */
  @Input() title: string;
  /** Displays a yellow exclamation icon in the widget if set to true. */
  warningIndicator: boolean;
  /**
   * 
   */
  widgetError: boolean;


  /**
   * 
   * @param owfCommonService The injected Common library service.
   */
  constructor(private owfCommonService: OwfCommonService) {}


  /**
   * Called right after the constructor.
   */
  ngOnInit(): void {
    // HARD CODE the displaying 'main' and 'change' indicator icons for now.
    this.passingIndicator = true; this.changeDecBad = true;
  }

  

}
