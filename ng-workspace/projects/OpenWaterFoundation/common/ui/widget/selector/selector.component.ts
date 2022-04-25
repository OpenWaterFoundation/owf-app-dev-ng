import { Component,
          Input,
          ViewChild }               from '@angular/core';

import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

import { Observable }               from 'rxjs';

import { OwfCommonService }         from '@OpenWaterFoundation/common/services';
import * as IM                      from '@OpenWaterFoundation/common/services';
import { WidgetService }            from '../widget.service';

import * as Papa                    from 'papaparse';


@Component({
  selector: 'widget-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.css']
})
export class SelectorComponent {

  /** The initial array of all objects to be displayed as options in this Selector
   * Widget's dropdown. */
  allFeatures: any[];
  /** An array containing all found ${} properties (that have been parsed) in the
   * **displayName** string from the dashboard configuration file. */
  allFoundProps: string[];
  /** The reference to the virtual scroll viewport in the template file by using
   * the @ViewChild decorator. The change detector looks for the first element or
   * directive matching the selector in the view DOM, and if it changes, the property
   * is updated. */
  @ViewChild(CdkVirtualScrollViewport, { static: false }) cdkVirtualScrollViewPort: CdkVirtualScrollViewport;
  /** The SelectorWidget object passed from the Dashboard Component from the dashboard
   * configuration file **widgets** array. */
  @Input() selectorWidget: IM.SelectorWidget;
  /** The array of feature objects that have been filtered by a user search. To be
   * updated and reflected in the mat-select main widget dropdown. */
  filteredFeatures: any[];
  /** Observable representing the ChartSelectorError BehaviorSubject from the
   * widgetService. Used by the template to show an error widget. */
  isSelectorError$: Observable<boolean>;


  /**
   * The Selector Widget Component constructor.
   * @param commonService The injected Common library service.
   */
  constructor(private commonService: OwfCommonService,
    private widgetService: WidgetService) {}


  /**
   * Parses and displays the `displayName` property using the ${property} notation
   * so it can be shown in the Selector's dropdown list.
   * @param feature The feature object from the allFeatures array.
   * @returns The parsed and replaced `displayName` ${property} string.
   */
  // TODO: jpkeahey 2022.04.14 - This is being called hundreds of times in seconds due to it being
  // a function call using data binding in the template file.
  getFeaturePropValue(feature: any): string {
    var props: IM.ParsedProp;

    props = this.commonService.obtainPropertiesFromLine(this.selectorWidget.displayName, feature);
    this.allFoundProps = props.foundProps;
    return props.line;
  }

  /**
   * @param features Array of all GeoJSON objects.
   * @returns An array of only the extracted feature objects to keep the allFeatures
   * class variable agnostic going forward.
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

    this.isSelectorError$ = this.widgetService.isSelectorError;

    var dataFormat = this.selectorWidget.dataFormat.toLowerCase();

    if (dataFormat === 'csv') {
      this.retrieveCSVData();
    } else if (dataFormat === 'geojson' || dataFormat === 'json') {
      this.retrieveJSONData();
    }

  }

  /**
   * Whenever the mat-select field is clicked, check if the event exists and use the
   * `@ViewChild` decorated class variable to check the size of the viewport and scroll
   * to the first element; this way, the viewport will always start there.
   */
  openSelectChange($event: any): void {
    if ($event) {
      this.cdkVirtualScrollViewPort.scrollToIndex(0);
      this.cdkVirtualScrollViewPort.checkViewportSize();
    }
  }

  /**
   * Uses Papaparse to read in a build an array of objects to this Selector Widget
   * correctly shows them in its dropdown.
   */
  retrieveCSVData(): void {

    var fullDataPath = this.commonService.buildPath(IM.Path.dbP, [this.selectorWidget.dataPath]);

    Papa.parse(fullDataPath, {
      delimiter: ",",
      download: true,
      comments: "#",
      skipEmptyLines: true,
      header: false,
      complete: (result: Papa.ParseResult<any>) => {

        var headers: string[] = result.data[this.selectorWidget.skipDataLines];
        var lineToStart = this.selectorWidget.skipDataLines + 1;
        var parsedResult: any[] = [];

        for (let dataIndex = lineToStart; dataIndex < result.data.length; ++dataIndex) {

          var parsedObject = {};

          for (let headerIndex = 0; headerIndex < headers.length; ++headerIndex) {
            parsedObject[headers[headerIndex]] = result.data[dataIndex][headerIndex];
          }
          parsedResult.push(parsedObject);
        }
        
        this.allFeatures = parsedResult;
        this.filteredFeatures = this.allFeatures;
      },
      error: (error: Papa.ParseError) => {
        console.error('Error!');
      }
    });
  }

  /**
   * Uses the common service to read in data as JSON, and sets the necessary data
   * so this Selector Widget correctly shows them in its dropdown.
   */
  retrieveJSONData(): void {
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
   * Iterates over the found ${} property notation and filters by all of them. This
   * way, a user search will return the desired item in the dropdown by whichever
   * property is searched for.
   * @param feature The feature object with it's properties and values.
   * @param filter The currently searched for user input string.
   * @returns ???
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
   * Determine whether the user input has been erased completely, the backspace
   * or any other key was pressed, and calls the necessary code.
   * @param inputValue The full value entered by the user so far in the search bar.
   * @param key The most current key that was entered.
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
   * @param item The feature item object that's been selected.
   */
  updateItem(item: any): void {
    this.widgetService.updateSelectedItem({
      selectedItem: item
    });
  }

  /**
   * Determines what kind of input is being used and calls the necessary function.
   * @param event The KeyboardEvent object created when a key is pressed by the user.
   * @param inputType String representing the type of input.
   */
  userInput(event: any, inputType: string) {

    if (inputType === 'feature') {
      this.filteredFeatures = this.searchFeatures(event.target.value, event.key);
    }
  }

}
