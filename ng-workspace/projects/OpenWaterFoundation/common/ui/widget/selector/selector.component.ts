import { Component,
          EventEmitter,
          Input,
          Output, 
          ViewChild }               from '@angular/core';

import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

import { OwfCommonService }         from '@OpenWaterFoundation/common/services';
import * as IM                      from '@OpenWaterFoundation/common/services';
import { WidgetService }            from '../widget.service';


@Component({
  selector: 'widget-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.css']
})
export class SelectorComponent {

  allFeatures: any[];
  /** The reference to the virtual scroll viewport in the template file by using
   * the @ViewChild decorator. The change detector looks for the first element or
   * directive matching the selector in the view DOM, and if it changes, the property
   * is updated. */
  @ViewChild(CdkVirtualScrollViewport, { static: false }) cdkVirtualScrollViewPort: CdkVirtualScrollViewport;

  @Input() dataPath: string;

  filteredFeatures: any[];

  @Output() testEmit = new EventEmitter<any>();


  /**
   * 
   * @param owfCommonService The injected Common library service.
   */
  constructor(private owfCommonService: OwfCommonService,
    private widgetService: WidgetService) {}


  /**
   * Called when mat-option is clicked from the Date Mat Form Field. It sends data back to the Map component
   * with the date so the map and necessary Leaflet controls can be updated.
   * @param feature The date a user has selected.
   */
  updateItem(feature: any): void {
    console.log(feature);
  }

  /**
   * Called right after the constructor.
   */
  ngOnInit(): void {
    this.owfCommonService.getJSONData(this.owfCommonService.buildPath(IM.Path.dbP, [this.dataPath]))
    .subscribe((geoJson: any) => {
      this.allFeatures = geoJson.features;
      this.filteredFeatures = this.allFeatures;
    })
  }

  /**
   * Whenever the mat-select field is clicked, check if the event exists and use the
   * @ViewChild decorated class variable to check the size of the viewport and scroll
   * to the first element; this way, the viewport will always start there.
   */
  openSelectChange($event: any): void {
    if ($event) {
      this.cdkVirtualScrollViewPort.scrollToIndex(0);
      this.cdkVirtualScrollViewPort.checkViewportSize();
    }
  }

  /**
   * 
   * @param inputValue 
   * @param key 
   */
  searchFeatures(inputValue: string, key: string) {
    // If the value in the search bar is empty, then all dates can be shown.
    if (inputValue === '') {
      return this.allFeatures;
    }

    let filter = inputValue.toLowerCase();

    if (key.toLowerCase() === 'backspace') {
      return this.allFeatures.filter((feature: any) => {
        return feature.properties.abbrev.toLowerCase().includes(filter);
      });
    } else {
      return this.filteredFeatures.filter((feature: any) => {
        return feature.properties.abbrev.toLowerCase().includes(filter);
      });
    }
  }

  sendData(data: string): void {
    console.log(data);
    // this.widgetService.setTestObs(data);
  }

  /**
   * 
   * @param event The KeyboardEvent object created every time a key is pressed by the user.
   */
  userInput(event: any, inputType: string) {

    if (inputType === 'feature') {
      this.filteredFeatures = this.searchFeatures(event.target.value, event.key);
    }
  }

}
