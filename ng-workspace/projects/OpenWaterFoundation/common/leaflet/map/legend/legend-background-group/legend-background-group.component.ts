import { AfterViewInit,
          Component,
          EventEmitter,
          Input, 
          Output }          from '@angular/core';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';

@Component({
  selector: 'legend-background-group',
  templateUrl: './legend-background-group.component.html',
  styleUrls: ['./legend-background-group.component.css']
})
export class LegendBackgroundGroupComponent implements AfterViewInit {

  /** The background geoLayerViewGroup passed as input from the Map Component when
   * this component is created. */
  @Input() geoLayerViewGroup: any;
  /** EventEmitter that alerts the Map component (parent) that an update has happened,
   * and sends the selected background's geoLayerView name property. */
  @Output() callSelectBackgroundLayer = new EventEmitter<any>();


  /**
   * 
   * @param commonService The reference to the injected Common library.
   */
  constructor(public commonService: OwfCommonService) {}

  /**
   * Called right after the constructor.
   */
  ngAfterViewInit(): void {
  }

  /**
   * When a background radio button is clicked, emit the layer's name property as
   * an event to the Map Component so it can change the map's background layer.
   * @param backgroundGeoLayerViewName The background geoLayerView name property.
   */
  selectBackgroundLayer(backgroundGeoLayerViewName: string) {
    this.callSelectBackgroundLayer.emit(backgroundGeoLayerViewName);
  }

}
