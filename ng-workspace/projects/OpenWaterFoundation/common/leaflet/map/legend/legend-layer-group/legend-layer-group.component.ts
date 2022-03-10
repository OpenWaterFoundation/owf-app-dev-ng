import { AfterViewInit,
          Component,
          EventEmitter,
          Input, 
          Output }          from '@angular/core';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';

@Component({
  selector: 'legend-layer-group',
  templateUrl: './legend-layer-group.component.html',
  styleUrls: ['./legend-layer-group.component.css']
})
export class LegendLayerGroupComponent implements AfterViewInit {

  /** The geoLayerViewGroup passed as input from the Map Component when
   * this component is created. */
  @Input() geoLayerViewGroup: any;
  /** EventEmitter that alerts the Map component (parent) that an update has happened,
   * and sends the selected background's geoLayerView name property. */
  @Output() callSelectBackgroundLayer = new EventEmitter<any>();


  /**
   * 
   * @param owfCommonService The reference to the injected Common library.
   */
  constructor(public owfCommonService: OwfCommonService) {}

  /**
   * Called right after the constructor.
   */
  ngAfterViewInit(): void {
  }


}
