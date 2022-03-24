import { Component,
          EventEmitter,
          Output }           from '@angular/core';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';
import { WidgetService }    from '../widget.service';


@Component({
  selector: 'widget-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.css']
})
export class SelectorComponent {

  @Output() testEmit = new EventEmitter<any>();

  /**
   * 
   * @param owfCommonService The injected Common library service.
   */
  constructor(private owfCommonService: OwfCommonService,
              private widgetService: WidgetService) {}


  /**
   * Called right after the constructor.
   */
  ngOnInit(): void {
    
  }

  sendData(data: string): void {
    this.widgetService.setTestObs(data);
  }

}
