import { Component,
          Input }           from '@angular/core';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';
import { DashboardService } from '../../dashboard.service';
import { Observable }       from 'rxjs';
import * as Papa            from 'papaparse';


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

  changeDec: boolean;

  changeInc: boolean;
  /** Displays a red down caret icon in the widget if set to true. */
  changeDecBad: boolean;
  /** Displays a green down caret icon in the widget if set to true. */
  changeDecGood: boolean;
  /** Displays a red up caret icon in the widget if set to true. */
  changeIncBad: boolean;
  /** Displays a green up caret icon in the widget if set to true. */
  changeIncGood: boolean;
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
  /** The main data to be displayed on this Status Indicator widget. */
  mainData: string;
  /** Displays a green check icon in the widget if set to true. */
  passingIndicator: boolean;
  /** The title of this widget from the widget's `title` property in the dashboard
   * configuration file. */
  @Input('statusIndicatorWidget') statusIndicatorWidget: IM.StatusIndicatorWidget;
  /** Displays a yellow exclamation icon in the widget if set to true. */
  warningIndicator: boolean;


  /**
   * 
   * @param commonService The injected Common library service.
   */
  constructor(private commonService: OwfCommonService,
    private dashboardService: DashboardService) {}


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

    // Determine if the Chart widget has a SelectEvent. If not, the initialization
    // of the Status Indicator widget can be performed.
    if (this.dashboardService.hasSelectEvent(this.statusIndicatorWidget) === false) {
      this.initStatusIndicator();
    }
  }

  /**
   * Initializes the status indicator widget by reading in the supplied data from
   * the `dataPath` widget property and sets up variables to be shown in the widget.
   */
  private initStatusIndicator(): void {

    // HARD CODE the displaying 'main' indicator icon for now.
    this.passingIndicator = true;

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
    
    this.dashboardService.getWidgetEvent(this.statusIndicatorWidget).subscribe((selectEvent: IM.SelectEvent) => {

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
   * Gets CSV data from a data source and processes it so this widget can utilize it.
   */
  private retrieveCSVData(): void {

    var fullDataPath = this.commonService.buildPath(IM.Path.dbP, [this.statusIndicatorWidget.dataPath]);

    Papa.parse(fullDataPath, {
      delimiter: ",",
      download: true,
      comments: "#",
      skipEmptyLines: true,
      header: false,
      complete: (result: Papa.ParseResult<any>) => {

        var dataArray = this.dashboardService.processWidgetCSVData(result.data, this.statusIndicatorWidget);

        var givenProperty = this.dashboardService.getProvidedValue(this.statusIndicatorWidget);
        this.mainData = dataArray[dataArray.length - 1][givenProperty];

        var previousValue = dataArray[dataArray.length - 2][givenProperty];

        this.dataChange = (Number(this.mainData) - Number(previousValue)).toFixed(2);

        if (Number(this.mainData) >= Number(previousValue)) {
          this.changeInc = true;
        } else {
          this.changeDec = true;
        }
        
        // this.toggleDataLoading = false;
      },
      error: (error: Papa.ParseError, file: File) => {
        this.errorTypes.push('bad csv');
        // this.toggleDataLoading = false;
        this.dashboardService.setSelectorError = true;
        return;
      }
    });
  }

  /**
   * Gets JSON data from a data source and processes it so this widget can utilize it.
   */
  private retrieveJSONData(): void {

    this.commonService.getJSONData(
      this.commonService.buildPath(IM.Path.dbP, [this.statusIndicatorWidget.dataPath])
    ).subscribe((data: any) => {

      var dataArray: any[] = this.dashboardService.processWidgetJSONData(data, this.statusIndicatorWidget);

      if (data !== null) {

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

      console.log(data);
      
      // this.allFeatures = data.ResultList;
      // var measValueAverage = 0;
      // for (let feature of this.allFeatures) {
      //   measValueAverage += feature.measValue;
      // }
      // this.average = (measValueAverage / this.allFeatures.length).toFixed(2);
      // this.difference = (Math.abs(Number(this.average) - this.statusIndicatorWidget.referenceValue)).toFixed(2);

    });
  }

}
