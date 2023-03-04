import { Component,
          Input }                 from '@angular/core';

import { forkJoin,
          Observable,
          Subscription }          from 'rxjs';

import { faCaretDown,
          faCaretUp,
          faCheck,
          faExclamation,
          faQuestion,
          faXmark }               from '@fortawesome/free-solid-svg-icons';

import { ClassifyLevel,
          EventService,
          OwfCommonService, 
          Path,
          SelectEvent,
          StatusIndicatorWidget } from '@OpenWaterFoundation/common/services';
import { DashboardService }       from '../../dashboard.service';



@Component({
  selector: 'widget-status-indicator',
  templateUrl: './status-indicator.component.html',
  styleUrls: ['./status-indicator.component.css']
})
export class StatusIndicatorComponent {

  /** The indicator used for displaying the change in the main data value for this
   * status indicator widget. */
  change = {
    increase: false,
    decrease: false,
    equal: false
  };
  /** Array of each level (or line) in the classification file that will be used
   * to determine how a data point is classified. */
  classifyLevels: ClassifyLevel[] = [];
  /** An observable that is only set if a classification file is supplied. */
  classifyFile$: Observable<any>;
  /** Subscription used when reading in a CSV file for this component's data. */
  CSVSub: Subscription;
  /** Represents the change in the main data value, to be shown at the bottom of
   * this component. */
  dataChange: string;
  /** String array representing the type of error that occurred while building this
   * widget. Used by the error widget. */
  errorTypes: string[] = [];
  /** All used icons in the StatusIndicatorComponent. */
  faCaretDown = faCaretDown;
  faCaretUp = faCaretUp;
  faCheck = faCheck;
  faExclamation = faExclamation;
  faQuestion = faQuestion;
  faXmark = faXmark;
  /**
   * Displays an icon in this component that represents the state of the data:
   * * `failure` - A red X.
   * * `passing` - A green check mark.
   * * `unknown` - A black question mark.
   * * `warning` - A yellow exclamation.
   */
  indicatorIcon = {
    failure: false,
    passing: false,
    unknown: false,
    warning: false
  };
  /** Observable that's updated as a BehaviorSubject when a critical error creating
   * this component occurs. */
  isIndicatorError$: Observable<boolean>;
  /** Subscription used when reading in a JSON file for this component's data. */
  JSONSub: Subscription;
  /** The main data to be displayed on this Status Indicator widget. */
  mainData: string;
  /** The attribute provided to this component when created, e.g.
   *   <widget-status-indicator [statusIndicatorWidget]="widget"></widget-status-indicator> */
  @Input('statusIndicatorWidget') statusIndicatorWidget: StatusIndicatorWidget;
  

  /**
   * Constructor for the StatusIndicatorComponent.
   * @param commonService Reference to the injected Common library service.
   * @param dashboardService The injected dashboard service.
   * @param eventService The injected event service for dashboard widgets.
   */
  constructor(
    private commonService: OwfCommonService,
    private dashboardService: DashboardService,
    private eventService: EventService
  ) {
    
  }


  /**
   * Checks if this widget was given a path to a classification file for setting
   * the indicator icon.
   */
  private checkForClassificationFile(): void {

    // Determine if the Chart widget has a SelectEvent. If not, the initialization
    // of the Status Indicator widget can be performed.
    if (this.dashboardService.hasSelectEvent(this.statusIndicatorWidget) === false) {
      // Found a classification file.
      if (this.statusIndicatorWidget.classificationFile) {

        var fullClassificationPath = this.commonService.buildPath(Path.dbP, this.statusIndicatorWidget.classificationFile);
        this.classifyFile$ = this.commonService.papaParse(fullClassificationPath);
        this.initStatusIndicator();
      }
      // No classification file given.
      else {
        this.initStatusIndicator();
      }
      
    }
  }

  /**
   * Checks the properties of the given chart object and determines what action to
   * take.
   */
  private checkWidgetObject(): void {

    var error = false;

    if (!this.statusIndicatorWidget.title) {
      this.errorTypes.push('no title');
      error = true;
    }

    if (!this.statusIndicatorWidget.dataPath) {
      console.warn('The Status Indicator widget must contain a `dataPath` property. ' +
      'In the future the `dataPath` property can be left off if this widget is listening ' +
      'to another widget for its data.');
      return;
    }

    if (!this.statusIndicatorWidget.dataFormat) {
      this.errorTypes.push('no dataFormat');
      error = true;
    } else {
      var dataFormat = this.statusIndicatorWidget.dataFormat.toLowerCase();
      if (dataFormat === 'csv' || dataFormat === 'json') {
  
        if (!this.statusIndicatorWidget.attributeName && !this.statusIndicatorWidget.columnName &&
          !this.statusIndicatorWidget.propertyName) {
            this.errorTypes.push('no value property');
            error = true;
          }
      }
    }

    if (error === true) {
      this.dashboardService.setIndicatorError = true;
      return;
    }

    // The widget object has passed its inspection and can be created.
    this.checkForClassificationFile();
  }

  /**
   * Initializes the status indicator widget by reading in the supplied data from
   * the `dataPath` widget property and sets up variables to be shown in the widget.
   */
  private initStatusIndicator(): void {

    var dataFormat = this.statusIndicatorWidget.dataFormat.toLowerCase();

    if (dataFormat === 'csv') {
      this.retrieveCSVData();
    } else if (dataFormat === 'json') {
      this.retrieveJSONData();
    }
  }

  /**
   * Listens to another widget and updates when something is updated in said widget.
   */
  private listenForEvent(): void {
    
    this.eventService.getWidgetEvent(this.statusIndicatorWidget).subscribe((selectEvent: SelectEvent) => {

      // Check if the initial selectEvent was passed.
      if (selectEvent === null) {
        return;
      }
    });
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive. Called after the constructor.
   */
  ngOnInit(): void {

    this.isIndicatorError$ = this.dashboardService.isIndicatorError;

    this.checkWidgetObject();
    this.listenForEvent();
  }

  /**
   * Called once, before the instance is destroyed.
   */
  ngOnDestroy(): void {
    // Unsubscribe from all existing subscriptions.
    if (this.CSVSub) {
      this.CSVSub.unsubscribe();
    }
    if (this.JSONSub) {
      this.JSONSub.unsubscribe();
    }
  }

  /**
   * Checks if an error occurred from Papaparse, then iterates over each line from
   * the classification file and creates the necessary array of objects used for
   * classification.
   * @param classifyData The object returned from parsing the classification CSV
   * file with Papaparse.
   * @returns An array of each line read in with its min and max Values,
   * operators, and the level the line is classified as.
   */
  private processClassifyData(classifyData: any): void {

    if (classifyData.error) {
      this.errorTypes.push('bad csv');
      // this.toggleDataLoading = false;
      this.dashboardService.setIndicatorError = true;
      return;
    }

    for (let line of classifyData) {
      this.classifyLevels.push(this.dashboardService.determineValueOperator(line));
    }
  }

  /**
   * Sets the necessary class variables used for displaying in this Status Indicator
   * widget.
   * @param delimitedData The object returned from Papaparsing.
   */
  private processCSVData(delimitedData: any): void {

    if (delimitedData.error) {
      this.errorTypes.push('bad csv');
      // this.toggleDataLoading = false;
      this.dashboardService.setIndicatorError = true;
      return;
    }

    var dataArray = this.dashboardService.processWidgetCSVData(delimitedData, this.statusIndicatorWidget);

    var givenProperty = this.dashboardService.getProvidedValue(this.statusIndicatorWidget);
    this.mainData = dataArray[dataArray.length - 1][givenProperty];

    var previousValue = dataArray[dataArray.length - 2][givenProperty];

    if (this.mainData && previousValue) {
      this.dataChange = (Number(this.mainData) - Number(previousValue)).toFixed(2);
    } else {
      this.dataChange = 'No current data';
    }

    console.log('Main data:', this.mainData);
    console.log('Previous data:', previousValue);

    if (!this.mainData) {
      this.mainData = '-';
      this.change.equal = true;
    }
    else if (Number(this.mainData) > Number(previousValue)) {
      this.change.increase = true;
    }
    else if (Number(this.mainData) < Number(previousValue)) {
      this.change.decrease = true;
    }
    else if (Number(this.mainData) === Number(previousValue)) {
      this.change.equal = true;
    }

    if (this.statusIndicatorWidget.classificationFile) {
      this.setIconFromClassification();
    } else {

    }
    
    // this.toggleDataLoading = false;
  }

  /**
   * Gets CSV data from a data source and processes it so this widget can utilize
   * it.
   */
  private retrieveCSVData(): void {

    var delimitedData$: Observable<any>[] = [];
    
    if (this.classifyFile$) {
      delimitedData$.push(this.classifyFile$);
    }

    var fullCSVDataPath = this.commonService.buildPath(Path.dbP, this.statusIndicatorWidget.dataPath);
    delimitedData$.push(this.commonService.papaParse(fullCSVDataPath, true));

    this.CSVSub = forkJoin(delimitedData$).subscribe((delimitedData: any[]) => {

      var mainData: any;

      if (delimitedData.length === 1) {
        mainData = delimitedData[0].data;
        this.processCSVData(mainData);
      } else if (delimitedData.length === 2) {
        this.processClassifyData(delimitedData[0].data);
        mainData = delimitedData[1].data;
        this.processCSVData(mainData);
      }

    });
  }

  /**
   * Gets JSON data from a data source and processes it so this widget can utilize
   * it.
   */
  private retrieveJSONData(): void {

    var allData$: Observable<any>[] = [];

    if (this.classifyFile$) {
      allData$.push(this.classifyFile$);
    }

    var fullJSONDataPath = this.commonService.buildPath(Path.dbP, this.statusIndicatorWidget.dataPath);
    allData$.push(this.commonService.getJSONData(fullJSONDataPath));

    this.JSONSub = forkJoin(allData$).subscribe((allData: any) => {

      var mainData: any;

      if (allData.length === 1) {
        mainData = allData[0];
      }
      else if (allData.length === 2) {
        this.processClassifyData(allData[0].data);
        mainData = allData[1];
      }

      var dataArray: any[] = this.dashboardService.processWidgetJSONData(mainData, this.statusIndicatorWidget);

      if (mainData !== null) {

        var givenProperty = this.dashboardService.getProvidedValue(this.statusIndicatorWidget);
        this.mainData = dataArray[dataArray.length - 1][givenProperty];

        var previousValue = dataArray[dataArray.length - 2][givenProperty];

        if (this.mainData && previousValue) {
          this.dataChange = (Number(this.mainData) - Number(previousValue)).toFixed(2);
        } else {
          this.dataChange = 'No current data';
        }

        if (!this.mainData) {
          this.mainData = '-';
          this.change.equal = true;
        }
        else if (Number(this.mainData) > Number(previousValue)) {
          this.change.increase = true;
        }
        else if (Number(this.mainData) < Number(previousValue)) {
          this.change.decrease = true;
        }
        else if (Number(this.mainData) === Number(previousValue)) {
          this.change.equal = true;
        }

      } else {
        this.errorTypes.push('unsupported data type');
        this.dashboardService.setIndicatorError = true;
        return;
      }

    });
  }

  /**
   * Set the display icon in the indicator depending on where the mainData point
   * falls between the given classified points.
   */
  private setIconFromClassification(): void {

    for (let classifyLevel of this.classifyLevels) {

      if (this.mainData === '-') {
        this.indicatorIcon.unknown = true;
        return;
      }

      if (this.dashboardService.operators[classifyLevel.minOp](Number(this.mainData), classifyLevel.valueMin) &&
          //                             |------operator-----||---------a----------|  |----------b----------|
          this.dashboardService.operators[classifyLevel.maxOp](Number(this.mainData), classifyLevel.valueMax)) {

        switch(classifyLevel.level.toLowerCase()) {
          case 'black': this.indicatorIcon.unknown = true; break;
          case 'red': this.indicatorIcon.failure = true; break;
          case 'yellow': this.indicatorIcon.warning = true; break;
          case 'green': this.indicatorIcon.passing = true; break;
          default: this.indicatorIcon.unknown = true;
        }
      }
    }
  }

}
