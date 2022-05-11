import { Component,
          Input,
          ViewChild }               from '@angular/core';

import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

import { BehaviorSubject,
          Observable }              from 'rxjs';

import { OwfCommonService }         from '@OpenWaterFoundation/common/services';
import * as IM                      from '@OpenWaterFoundation/common/services';
import { DashboardService }            from '../../dashboard.service';

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
  /**
   * 
   */
  private dataLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);
  /**
   * 
   */
  dataLoading$ = this.dataLoadingSubject.asObservable();
  /** The SelectorWidget object passed from the Dashboard Component from the dashboard
   * configuration file **widgets** array. */
  @Input() selectorWidget: IM.SelectorWidget;
  /** The array of feature objects that have been filtered by a user search. To be
   * updated and reflected in the mat-select main widget dropdown. */
  filteredFeatures: any[];
  /** Observable representing the ChartSelectorError BehaviorSubject from the
   * widgetService. Used by the template to show an error widget. */
  isSelectorError$: Observable<boolean>;
  /** String array representing the type of error that occurred while building this
   * widget. Used by the error widget. */
  errorTypes: string[] = [];


  /**
   * The Selector Widget Component constructor.
   * @param commonService The injected Common library service.
   */
  constructor(private commonService: OwfCommonService,
    private dashboardService: DashboardService) {}


  /**
   * Checks the properties of the given chart object and determines what action
   * to take.
   */
  checkWidgetObject(): void {

    var error = false;

    if (!this.selectorWidget.dataPath) {
      this.errorTypes.push('no dataPath');
      error = true;
    }
    if (!this.selectorWidget.dataFormat) {
      this.errorTypes.push('no dataFormat');
      error = true;
    }
    if (!this.selectorWidget.displayName) {
      this.errorTypes.push('no displayName');
      error = true;
    }
    if (!this.selectorWidget.name) {
      this.errorTypes.push('no name');
      error = true;
    }

    if (error === true) {
      this.dashboardService.setSelectorError = true;
      return;
    }

    // The object has been verified and the initial Selector Widget code can now
    // be executed.
    var dataFormat = this.selectorWidget.dataFormat.toLowerCase();

    if (dataFormat === 'csv') {
      this.retrieveCSVData();
    } else if (dataFormat === 'geojson' || dataFormat === 'json') {

      if (!this.selectorWidget.JSONArrayName) {
        this.errorTypes.push('no JSONArrayName');
        this.dashboardService.setSelectorError = true;
        return;
      }
      this.retrieveJSONData();
    }
  }

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
  getAllProperties(features: any[]): any[] {
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
    this.isSelectorError$ = this.dashboardService.isSelectorError;
    this.checkWidgetObject();
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

        this.allFeatures = this.dashboardService.processWidgetCSVData(result.data, this.selectorWidget);
        this.filteredFeatures = this.allFeatures;
        console.log(this.allFeatures);
        // Send the initial event to the Chart Widget.
        let initialSelectEvent: IM.SelectEvent = {
          selectedItem: this.allFeatures[0],
          widgetName: this.selectorWidget.name
        }
        this.dashboardService.sendWidgetEvent(initialSelectEvent);
        
        this.toggleDataLoading = false;
      },
      error: (error: Papa.ParseError, file: File) => {
        this.errorTypes.push('bad csv');
        this.toggleDataLoading = false;
        this.dashboardService.setSelectorError = true;
        return;
      }
    });
  }

  /**
   * Uses the common service to read in data as JSON, and sets the necessary data
   * so this Selector Widget correctly shows them in its dropdown.
   */
  retrieveJSONData(): void {
    this.commonService.getJSONData(this.commonService.buildPath(IM.Path.dbP, [this.selectorWidget.dataPath]))
    .subscribe((JSONData: any) => {

      this.allFeatures = this.dashboardService.processWidgetJSONData(JSONData, this.selectorWidget);
      
      this.filteredFeatures = this.allFeatures;
      // Send the initial event to the Chart Widget.
      let initialSelectEvent: IM.SelectEvent = {
        selectedItem: this.allFeatures[0],
        widgetName: this.selectorWidget.name
      }
      this.dashboardService.sendWidgetEvent(initialSelectEvent);

      this.toggleDataLoading = false;
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
   * 
   */
  private set toggleDataLoading(loaded: boolean) {
    this.dataLoadingSubject.next(loaded);
  }

  /**
   * Called when mat-option is clicked from the Date Mat Form Field. It sends the
   * selected data to the widgetService BehaviorSubject, which will update any other
   * widgets that are subscribed to it.
   * @param item The feature item object that's been selected.
   */
  updateSelectedItem(item: any): void {
    var widgetEvent: IM.SelectEvent = {
      selectedItem: item,
      widgetName: this.selectorWidget.name
    };

    this.dashboardService.sendWidgetEvent(widgetEvent);
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
