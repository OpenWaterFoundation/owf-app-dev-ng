import { Component,
          EventEmitter,
          Input, 
          Output } from '@angular/core';


@Component({
  selector: 'legend-background-group',
  templateUrl: './legend-background-group.component.html',
  styleUrls: ['./legend-background-group.component.css']
})
export class LegendBackgroundGroupComponent {

  /** The background geoLayerViewGroup passed as input from the Map Component when
   * this component is created. */
  @Input('geoLayerViewGroup') geoLayerViewGroup: any;
  /** EventEmitter that alerts the Map component (parent) that an update has happened,
   * and sends the selected background's geoLayerView name property. */
  @Output('callSelectBackgroundLayer') callSelectBackgroundLayer = new EventEmitter<any>();


  /**
   * Constructor for the LegendBackgroundGroupComponent.
   */
  constructor() {}


  /**
   * Check the background geoLayerViewGroup to see if the expandedInitial property
   * exists and is set to true or false. Show or hide the background layers depending
   * which one is present, and false by default (hiding the layers).
   */
  getBackgroundExpanded(): boolean {
    if (this.geoLayerViewGroup.properties.isBackground === 'true') {
      if (this.geoLayerViewGroup.properties.expandedInitial &&
        this.geoLayerViewGroup.properties.expandedInitial === 'true') {
          return true;
        }
      else {
        return false;
      }
    } else {
      return false;
    }
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
