import { Component,
          Input }           from '@angular/core';

import { EventService,
          OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';
import { DashboardService } from '../../dashboard.service';
import { forkJoin,
          Observable,
          Subscription }    from 'rxjs';


@Component({
  selector: 'widget-status-indicator',
  templateUrl: './status-indicator.component.html',
  styleUrls: ['./status-indicator.component.css']
})
export class StatusIndicatorComponent {
  
  /**
   * 
   */
  allFeatures: any[] = [];
  /**
   * 
   */
  changeDec: boolean;
  /**
   * 
   */
  changeInc: boolean;
  /**
   * 
   */
  classificationLevels: any[] = [];
  /**
   * 
   */
  classifyFile$: Observable<any>;
  /**
   * 
   */
  CSVSub: Subscription;
  /**
   * 
   */
  dataChange: string;
  /** String array representing the type of error that occurred while building this
   * widget. Used by the error widget. */
  errorTypes: string[] = [];
  /** Displays a red X icon in the widget if set to true. */
  failureIndicator: boolean;
  /** Observable that's updated as a BehaviorSubject when a critical error creating
   * this component occurs. */
  isIndicatorError$: Observable<boolean>;
  /**
   * 
   */
  JSONSub: Subscription;
  /** The main data to be displayed on this Status Indicator widget. */
  mainData: string;
  /**
   * 
   */
  mainDataSub$: Subscription;
  /** Displays a green check icon in the widget if set to true. */
  passingIndicator: boolean;
  /** The attribute provided to this component when created, e.g.
   *   <widget-status-indicator [statusIndicatorWidget]="widget"></widget-status-indicator> */
  @Input('statusIndicatorWidget') statusIndicatorWidget: IM.StatusIndicatorWidget;
  /**
   * 
   */
  unknownIndicator: boolean;
  /** Displays a yellow exclamation icon in the widget if set to true. */
  warningIndicator: boolean;
  


  /**
   * 
   * @param commonService The injected Common library service.
   */
  constructor(private commonService: OwfCommonService,
    private eventService: EventService,
    private dashboardService: DashboardService) {}


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

        var fullClassificationPath = this.commonService.buildPath(IM.Path.dbP, [this.statusIndicatorWidget.classificationFile]);
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
   * Checks the properties of the given chart object and determines what action
   * to take.
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
    
    this.eventService.getWidgetEvent(this.statusIndicatorWidget).subscribe((selectEvent: IM.SelectEvent) => {

      // Check if the initial selectEvent was passed.
      if (selectEvent === null) {
        return;
      }

      console.log(selectEvent);
    });
  }

  /**
   * Called right after the constructor.
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
   * @param classifyData The object returned from Papaparsing the classification
   * CSV file.
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
      var valueObj = this.dashboardService.determineValueOperator(line);
      this.classificationLevels.push(valueObj);
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

    this.dataChange = (Number(this.mainData) - Number(previousValue)).toFixed(2);

    if (Number(this.mainData) >= Number(previousValue)) {
      this.changeInc = true;
    } else {
      this.changeDec = true;
    }

    if (this.statusIndicatorWidget.classificationFile) {
      this.setIconFromClassification();
    } else {

    }
    
    // this.toggleDataLoading = false;
  }

  /**
   * Gets CSV data from a data source and processes it so this widget can utilize it.
   */
  private retrieveCSVData(): void {

    var delimitedData$: Observable<any>[] = [];
    
    if (this.classifyFile$) {
      delimitedData$.push(this.classifyFile$);
    }

    var fullCSVDataPath = this.commonService.buildPath(IM.Path.dbP, [this.statusIndicatorWidget.dataPath]);
    delimitedData$.push(this.commonService.papaParse(fullCSVDataPath, true));

    this.CSVSub = forkJoin(delimitedData$).subscribe((delimitedData: any[]) => {

      var classifyData: any;
      var mainData: any;

      if (delimitedData.length === 1) {
        mainData = delimitedData[0].data;
        this.processCSVData(mainData);
      } else if (delimitedData.length === 2) {
        classifyData = delimitedData[0].data;
        this.processClassifyData(classifyData);
        mainData = delimitedData[1].data;
        this.processCSVData(mainData);
      }

    });
  }

  /**
   * Gets JSON data from a data source and processes it so this widget can utilize it.
   */
  private retrieveJSONData(): void {

    var allData$: Observable<any>[] = [];

    if (this.classifyFile$) {
      allData$.push(this.classifyFile$);
    }

    var fullJSONDataPath = this.commonService.buildPath(IM.Path.dbP, [this.statusIndicatorWidget.dataPath]);
    allData$.push(this.commonService.getJSONData(fullJSONDataPath));

    this.JSONSub = forkJoin(allData$).subscribe((allData: any) => {

      var classifyData: any;
      var mainData: any;

      if (allData.length === 1) {
        mainData = allData[0];
      } else if (allData.length === 2) {
        classifyData = allData[0].data;
        this.processClassifyData(classifyData);
        mainData = allData[1];
      }

      console.log(allData);

      var dataArray: any[] = this.dashboardService.processWidgetJSONData(mainData, this.statusIndicatorWidget);

      if (mainData !== null) {

        var givenProperty = this.dashboardService.getProvidedValue(this.statusIndicatorWidget);
        this.mainData = dataArray[dataArray.length - 1][givenProperty];

        var previousValue = dataArray[dataArray.length - 2][givenProperty];

        this.dataChange = (Number(this.mainData) - Number(previousValue)).toFixed(2);

        if (Number(this.mainData) >= Number(previousValue)) {
          this.changeInc = true;
        } else {
          this.changeDec = true;
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

    for (let classifyLevel of this.classificationLevels) {
      if (this.dashboardService.operators[classifyLevel.minOp](Number(this.mainData), classifyLevel.valueMin) &&
          //                             |------operator-----||---------a----------|  |----------b----------|
          this.dashboardService.operators[classifyLevel.maxOp](Number(this.mainData), classifyLevel.valueMax)) {

        switch(classifyLevel.level.toLowerCase()) {
          case 'black': this.unknownIndicator = true; break;
          case 'red': this.failureIndicator = true; break;
          case 'yellow': this.warningIndicator = true; break;
          case 'green': this.passingIndicator = true; break;
          default: this.unknownIndicator = true;
        }
      }
    }
  }

}
