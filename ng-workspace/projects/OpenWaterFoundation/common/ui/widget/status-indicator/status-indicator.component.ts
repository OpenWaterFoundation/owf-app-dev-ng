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

    
  }

  

}
