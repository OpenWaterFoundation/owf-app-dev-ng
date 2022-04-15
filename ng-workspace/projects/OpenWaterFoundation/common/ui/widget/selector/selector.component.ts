import { Component,
          Input,
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

  /**
   * 
   */
  allFeatures: any[];
  /**
   * 
   */
  allFoundProps: string[];
  /** The reference to the virtual scroll viewport in the template file by using
   * the @ViewChild decorator. The change detector looks for the first element or
   * directive matching the selector in the view DOM, and if it changes, the property
   * is updated. */
  @ViewChild(CdkVirtualScrollViewport, { static: false }) cdkVirtualScrollViewPort: CdkVirtualScrollViewport;
  /**
   * 
   */
  dataType: IM.DataType;
  /**
   * 
   */
  @Input() selectorWidget: IM.SelectorWidget;
  /**
   * 
   */
  filteredFeatures: any[];


  /**
   * 
   * @param commonService The injected Common library service.
   */
  constructor(private commonService: OwfCommonService,
    private widgetService: WidgetService) {}


  // private determineDataType(executeFn: (...args: any[]) => any): any {
  //   switch(this.dataType) {
  //     case IM.DataType.CDSSWebService: return executeFn();
  //     case IM.DataType.geoJson: return executeFn();
  //   }
  // }

  /**
   * 
   * @param feature 
   * @returns 
   */
  // TODO: jpkeahey 2022.04.14 - This is being called hundreds of times in seconds due to it being
  // a function call using data binding in the template file. Using a 
  getFeaturePropValue(feature: any): string {
    var props: IM.ParsedProp;

    props = this.commonService.obtainPropertiesFromLine(this.selectorWidget.displayName, feature);
    this.allFoundProps = props.foundProps;
    return props.line;
  }

  /**
   * 
   * @param features 
   * @returns 
   */
  private getAllProperties(features: any[]): any[] {
    var featureProperties: any[] = [];

    features.forEach((feature: any) => {
      featureProperties.push(feature.properties);
    });

    return featureProperties;
  }

  /**
   * Called right after the constructor.
   */
  ngOnInit(): void {
    this.commonService.getJSONData(this.commonService.buildPath(IM.Path.dbP, [this.selectorWidget.dataPath]))
    .subscribe((data: any) => {

      // geoJson.
      if (data.features) {
        this.allFeatures = this.getAllProperties(data.features);
      }
      // CDSS Web Services.
      else if (data.ResultList) {
        this.allFeatures = data.ResultList;
      }
      
      this.filteredFeatures = this.allFeatures;

    });
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
   * @param feature 
   * @param filter 
   * @returns 
   */
  private searchAllFoundProps(feature: any, filter: string): string {

    for (let prop of this.allFoundProps) {

      if (feature[prop] === null) {
        continue;
      }

      if (feature[prop].toLowerCase().includes(filter) === false) {
        continue;
      } else {
        return feature[prop].toLowerCase().includes(filter);
      }
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
        return this.searchAllFoundProps(feature, filter);
      });
    } else {
      return this.filteredFeatures.filter((feature: any) => {
        return this.searchAllFoundProps(feature, filter);
      });
    }
  }

  /**
   * Called when mat-option is clicked from the Date Mat Form Field. It sends the
   * selected data to the widgetService BehaviorSubject, which will update any other
   * widgets that are subscribed to it.
   * @param item The item a user has selected.
   */
  updateItem(item: any): void {
    this.widgetService.updateSelectedItem(item);
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

type executeFunc<TArgs extends any[], TResult> = (...args: TArgs) => TResult;