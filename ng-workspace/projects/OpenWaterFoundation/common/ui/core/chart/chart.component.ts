import { Component,
          EventEmitter,
          Input,
          OnDestroy,
          OnInit, 
          Output}          from '@angular/core';

import { BehaviorSubject,
          forkJoin,
          Observable,
          Subscription }    from 'rxjs';

import structuredClone      from '@ungap/structured-clone';

import { EventService,
          OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM               from '@OpenWaterFoundation/common/services';
import { DataUnits }         from '@OpenWaterFoundation/common/util/io';
import { DayTS,
          MonthTS,
          TS,
          YearTS }          from '@OpenWaterFoundation/common/ts';
import { DatastoreManager } from '@OpenWaterFoundation/common/util/datastore';
import { ChartService }     from './chart.service';
// I believe that if this type of 'import' is used, the package needs to be added
// to the angular.json scripts array.
declare var Plotly: any;


@Component({
  selector: 'core-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit, OnDestroy {

  /**
   * 
   */
  private attributeTable = [];
  /** Subscription to be unsubscribed to at component destruction to prevent memory
  * leaks.*/
  private allResultsSub$: Subscription;
  /** The attribute provided to this component when created from a dialog, e.g.
   * <core-chart [chartDialog]="widget"></core-chart> */
  @Input('chartDialog') chartDialog: IM.ChartDialog;
  /** The way this Chart component is being displayed in the InfoMapper. */
  @Input('chartDisplayType') chartDisplayType: IM.ChartDisplayType;
  /** Set to true if any errors occur in the Chart Widget. */
  private chartError: BehaviorSubject<boolean> = new BehaviorSubject(false);
  /** The attribute provided to this component when created from a widget, e.g.
  * <core-chart [chartWidget]="widget"></core-chart> */
  @Input('chartWidget') chartWidget: IM.ChartWidget;
  /** The BehaviorSubject that is set to whether this widget is currently getting
  * data, or has finished and ready to display. */
  private dataLoading: BehaviorSubject<boolean> = new BehaviorSubject(true);
  /** The dataLoading BehaviorSubject as an observable so it can be 'listened' to
  * in the template file and conditionally show HTML as needed. */
  dataLoading$ = this.dataLoading.asObservable();
  /**
   * 
   */
  private dateTimeColumnName = '';
  /** String array representing the type of error that occurred while building this
  * widget. Used by the error widget. */
  errorTypes: string[] = [];
  /** Datastore manager to determine what datastore should be used to retrieve information
  * from. Can find built-in and user provided datastores. */
  private dsManager: DatastoreManager = DatastoreManager.getInstance();
  /** The graph template object retrieved from the popup configuration file property
  * resourcePath. */
  graphTemplate: IM.GraphTemplate;
  /** The original unparsed graph template file. */
  graphTemplatePrime: IM.GraphTemplate;
  /** The object containing all of the layer's feature properties. */
  featureProperties: any;
  /** Subscription for the initial files to read if provided in the Chart Widget. */
  initialResultsSub$: Subscription;
  /** Observable that's updated as a BehaviorSubject when a critical error creating
  * this component occurs. */
  isChartError$: Observable<boolean>;
  /** Boolean for helping dialog-tstable component determine what kind of file needs
  * downloading. */
  isTSFile: boolean;
  /** The array of TS objects that was originally read in using the StateMod or DateValue
  * Java converted code. Used as a reference in the dialog-tstable component for
  * downloading to the user's local machine. */
  TSArrayOGResultRef: TS[];
  /** Used to help create a unique graph ID. */
  TSIDLocation: string;
  /** EventEmitter that alerts the Map component (parent) that an update has happened,
   * and sends the basin name. */
  @Output() updateAttributeTable = new EventEmitter<IM.AttributeTableParams>();
  /** Subscription for reading in a graph template file if it hasn't been retrieved yet. */
  private updateResultsSub: Subscription;
  /**
   * 
   */
  private valueColumns: string[] = [];


  /**
  * @constructor for the DialogTSGraph Component.
  * @param commonService A reference to the top level service OwfCommonService.
  */
  constructor(private commonService: OwfCommonService,
    private chartService: ChartService,
    private eventService: EventService) { }

  /**
   * Observable used in the Chart Widget that's used with an async pipe in the template
   * file to show the widget or error content.
   */
  get isChartError(): Observable<boolean> { return this.chartError.asObservable(); }
  /**
    * Toggles the chartError BehaviorSubject between true and false.
    */
  set setChartError(error: boolean) { this.chartError.next(error); }
  /**
  * Toggles the BehaviorSubject so the widget knows when data has finished loading.
  */
  private set toggleDataLoading(loaded: boolean) {
    this.dataLoading.next(loaded);
  }

  /**
   * Creates the attributeTable array of objects to be passed to the dialog-tstable
   * component for displaying in a data table.
   * @param xAxisLabels The array of x-axis labels from the graph being created
   * to show in the data table.
   * @param axisObject The axisObject contains either the chartJS or plotly created
   * data array.
   * @param units The units being used on the graph to be shown as a column.
   */
  private addToAttributeTable(xAxisLabels: string[], axisObject: any, TSAlias: string, units: string, TSIndex: number, datePrecision?: number): void {

    // Retrieve the output precision from the DataUnits array if it exists, and if not default to 2
    var outputPrecision = this.determineOutputPrecision(units);
    // For the first column header name, have it be DATE if the datePrecision is week, month or year,
    // or DATE / TIME if day, hour, minute, etc..
    var column1Name = (datePrecision > 30) ? 'DATE': 'DATE / TIME';
    this.dateTimeColumnName = column1Name;
    // If the first time series, create the Date / Time column, and the data column for the time series
    if (TSIndex === 0) {
      // Create the column name for the current time series' units, including units if it exists, and skipping it otherwise
      var displayedUnits = units ? TSAlias + ' (' + units + ')' : TSAlias;
      this.valueColumns.push(displayedUnits);

      if (axisObject.csvYAxisData) {
        for (let i = 0; i < xAxisLabels.length; i++) {
          // Push the object into the attributeTable
          this.attributeTable.push({
            [column1Name]: xAxisLabels[i],
            // Ternary operator determining if the value is NaN. The data table will show nothing if that's the case
            [displayedUnits]: isNaN(axisObject.csvYAxisData[i]) ? '' : axisObject.csvYAxisData[i].toFixed(outputPrecision)
          });
        }
      }
      // If a plotly graph was created, use the plotly created data array.
      else if (axisObject.plotlyYAxisData) {
        for (let i = 0; i < xAxisLabels.length; i++) {
          // Push the object into the attributeTable.
          this.attributeTable.push({
            [column1Name]: xAxisLabels[i],
            // Ternary operator determining if the value is NaN. The data table will show nothing if that's the case.
            [displayedUnits]: isNaN(axisObject.plotlyYAxisData[i]) ? '' : axisObject.plotlyYAxisData[i].toFixed(outputPrecision)
          });
        }
      }
    }
    // If the second or more time series, just add the data column for it.
    else {
      // Create the column name for the current time series' units.
      var displayedUnits = units ? TSAlias + ' (' + units + ')' : TSAlias;
      this.valueColumns.push(displayedUnits);
      var foundIndex: number;

      if (axisObject.csvYAxisData) {
        for (let i = 0; i < this.attributeTable.length; i++) {
          foundIndex = xAxisLabels.findIndex(element => element === this.attributeTable[i][column1Name]);
          if (foundIndex !== -1) {
            this.attributeTable[i][displayedUnits] = isNaN(axisObject.csvYAxisData[foundIndex]) ? '' : axisObject.csvYAxisData[foundIndex].toFixed(outputPrecision);
            continue;
          } else {
            this.attributeTable[i][displayedUnits] = '';
            continue;
          }
        }

        var startCount = 0;
        var endCount = 1;
        for (let i = 0; i < xAxisLabels.length; i++) {
          if (xAxisLabels[i] < this.attributeTable[startCount][column1Name]) {
            this.attributeTable.splice(startCount, 0, { 
              [column1Name]: xAxisLabels[i],
              [displayedUnits]: isNaN(axisObject.csvYAxisData[i]) ? '' : axisObject.csvYAxisData[i].toFixed(outputPrecision)
            })
            startCount++;

          } else if (xAxisLabels[i] > this.attributeTable[this.attributeTable.length - endCount][column1Name]) {
            this.attributeTable.push({
              [column1Name]: xAxisLabels[i],
              [displayedUnits]: isNaN(axisObject.csvYAxisData[i]) ? '' : axisObject.csvYAxisData[i].toFixed(outputPrecision)
            })
            endCount++;
          }
        }
      }
      // If a plotly graph was created, use the plotly created data array
      else if (axisObject.plotlyYAxisData) {
        for (let i = 0; i < this.attributeTable.length; i++) {
          foundIndex = xAxisLabels.findIndex(element => element === this.attributeTable[i][column1Name]);
          if (foundIndex !== -1) {
            this.attributeTable[i][displayedUnits] =
            isNaN(axisObject.plotlyYAxisData[foundIndex]) ? '' : axisObject.plotlyYAxisData[foundIndex].toFixed(outputPrecision);
            continue;
          } else {
            this.attributeTable[i][displayedUnits] = '';
            continue;
          }
        }

        var startCount = 0;
        var endCount = 1;

        for (let i = 0; i < xAxisLabels.length; i++) {
          if (xAxisLabels[i] < this.attributeTable[startCount][column1Name]) {
            this.attributeTable.splice(startCount, 0, { 
              [column1Name]: xAxisLabels[i],
              [displayedUnits]: isNaN(axisObject.plotlyYAxisData[i]) ? '' : axisObject.plotlyYAxisData[i].toFixed(outputPrecision)
            })
            startCount++;

          } else if (xAxisLabels[i] > this.attributeTable[this.attributeTable.length - endCount][column1Name]) {
            this.attributeTable.push({
              [column1Name]: xAxisLabels[i],
              [displayedUnits]: isNaN(axisObject.plotlyYAxisData[i]) ? '' : axisObject.plotlyYAxisData[i].toFixed(outputPrecision)
            })
            endCount++;
          }
        }
      }
    }
    // Send the AttributeTableParams object to the Dialog component.
    this.updateAttributeTable.emit({
      attributeTable: this.attributeTable,
      dateTimeColumnName: this.dateTimeColumnName,
      valueColumns: this.valueColumns
    });
  }

  /**
   * Build and return an object with the graph's main title and sub titles if provided,
   * and empty strings if not.
   */
  private buildTitleText(): { mainTitle: string, subTitle: string } {

    var mainTitle = '';
    var subTitle = '';

    // Check for main title string.
    if (this.graphTemplate.product.subProducts[0].properties.MainTitleString !== '') {
      mainTitle = this.graphTemplate.product.subProducts[0].properties.MainTitleString;
    } else if (this.graphTemplate.product.properties.MainTitleString !== '') {
      mainTitle = this.graphTemplate.product.properties.MainTitleString;
    }

    // Check for sub title string.
    if (this.graphTemplate.product.subProducts[0].properties.SubTitleString !== '') {
      subTitle = this.graphTemplate.product.subProducts[0].properties.SubTitleString;
    } else if (this.graphTemplate.product.properties.SubTitleString !== '') {
      subTitle = this.graphTemplate.product.properties.SubTitleString;
    }

    return {
      mainTitle: mainTitle,
      subTitle: subTitle
    }
  }

  /**
  * Checks the properties of the given chart object and determines what action
  * to take.
  */
  private checkWidgetObject(): void {

    var error = false;

    if (!this.chartWidget.graphTemplatePath) {
      this.errorTypes.push('no graphTemplatePath');
      error = true;
    }
    if (!this.chartWidget.name) {
      this.errorTypes.push('no name');
      error = true;
    }

    if (error === true) {
      this.toggleDataLoading = false;
      this.setChartError = true;
      return;
    }

    // Determine if the Chart widget has a SelectEvent. If not, the initialization
    // of the Chart widget can be performed.
    if (this.eventService.hasSelectEvent(this.chartWidget) === false) {
      // The widget object has passed its inspection and can be created.
      this.setupForWidget();
    }
  }

  /**
  * Sets up and plots the plotly graph with the given data. Can display multiple
  * graph objects on one graph.
  * @param totalGraphConfig An array of PopulateGraph typed objects that contain all time
  * series data planned to be shown on the plotly graph.
  */
  private createPlotlyGraph(totalGraphConfig: IM.PopulateGraph[]): void {

    // The final data array of objects that is given to Plotly.react to create the graph.
    var finalData: { x: number[], y: number[], type: string }[] = [];
    // The data object being pushed onto the finalData array.
    var data: any;
    // The array containing the colors of each graph being displayed, in the order
    // in which they appear.
    var colorwayArray: string[] = [];
    // Plotly wants each graph object in the reverse order to draw each graph on
    // the chart in the correct order.
    if (this.graphTemplate.product.subProducts[0].properties.GraphType.toLowerCase() === 'areastacked') {
      totalGraphConfig.reverse();
    }

    // Iterate over the config array and add the necessary configuration data into
    // the data object that will be added to the finalData array. The finalData array
    // is what's given as the second argument to Plotly.react.
    for (let graphConfig of totalGraphConfig) {
      data = {};

      data.name = graphConfig.legendLabel;

      data.mode = graphConfig.chartMode;
      // data.connectgaps = true;

      if (data.mode === 'lines+markers') {
        data.line = {
          width: 1
        };
        data.marker = {
          size: 4
        };
      } else if (data.mode === 'lines') {
        data.line = {
          width: Number(graphConfig.lineWidth)
        }
        // Connects between ALL gaps
        // data.connectgaps = true;
      }
      // else if (data.mode === 'markers') {
      //   data.marker = {
      //     size: 
      //   }
      // }

      if (graphConfig.fillType) {
        data.fill = graphConfig.fillType;
      }

      if (graphConfig.stackGroup) {
        data.stackgroup = graphConfig.stackGroup
      }

      data.type = graphConfig.chartType;
      data.x = graphConfig.isCSV ? graphConfig.dataLabels : graphConfig.plotlyXAxisLabels;
      data.y = graphConfig.isCSV ? graphConfig.datasetData : graphConfig.plotlyDatasetData;

      colorwayArray.push(graphConfig.datasetBackgroundColor);
      finalData.push(data);
    }

    var title = this.buildTitleText();

    // Builds the layout object that will be given as the third argument to the
    // Plotly.plot() function. Creates the graph layout such as graph height and
    // width, legend and axes options, etc.
    var layout = {
      title: {
        text: title.mainTitle + '<br><sub>' + title.subTitle + '</sub>'
      },
      // An array of strings describing the color to display the graph as for each
      // time series.
      colorway: colorwayArray,
      autosize: true,
      // Create the legend inside the graph and display it in the upper right.
      legend: {
        bordercolor: '#c2c1c1',
        borderwidth: 1,
        // Positioning the legend on the x-y axes
        x: totalGraphConfig[0].legendPosition.x,
        y: totalGraphConfig[0].legendPosition.y
      },
      showlegend: true,
      // width: 900,
      xaxis: {
        // Maximum amount of ticks on the x-axis
        nticks: 8,
        tickangle: 0
      },
      yaxis: {
        // 'r' removes the k from the thousands place for numbers larger than 10,000. 
        // This formatting is taken from d3 formatting:
        // https://github.com/d3/d3-format/blob/main/README.md#locale_format
        tickformat: 'r',
        title: totalGraphConfig[0].yAxesLabelString,
        // Keeps the y-axis at a fixed range, so when the user zooms, an x-axis zoom takes place
        fixedrange: true
      }
    };

    // The fourth and last argument in the Plotly.plot() function, this object contains
    // the graph configuration options
    var plotlyConfig = {
      responsive: true,
      scrollZoom: true
    };
    // Plots the plotly graph with the given <div> id (TSIDLocation), data array, layout
    // and configuration objects organize and maintain multiple opened dialogs in
    // the future. (https://plotly.com/javascript/plotlyjs-function-reference/#plotlyreact)
    Plotly.react(this.TSIDLocation, finalData, layout, plotlyConfig);
  }

  /**
   * Go through each dataUnit in the @var dataUnits array that was created when
   * it was read in from the app configuration file in the nav-bar component and
   * set in the app-service.
   * @return The output precision from the dataUnit.
   * @param units String representing the units being displayed in the TSGraph.
   */
  private determineOutputPrecision(units: string): number {
    var dataUnits: DataUnits[] = this.commonService.getDataUnitArray();

    if (dataUnits && dataUnits.length > 0) {
      for (let dataUnit of dataUnits) {
        if (dataUnit.getAbbreviation().toUpperCase() === units.toUpperCase() ||
            dataUnit.getLongName().toUpperCase() === units.toUpperCase()) {
          return dataUnit.getOutputPrecision();
        }
      }
    }
    // Return a default precision of 2.
    return 2;
  }

  /**
  * Takes a Papa Parse result object and creates a PopulateGraph instance
  * for the Plotly graphing package API.
  * @param delimitedData The results object returned asynchronously from Papa Parse.
  * Contains at least one result array with its index in the graphTemplate data
  * array.
  */
  private makeDelimitedPlotlyObject(delimitedData: any, graphData: IM.GraphData, index: number): IM.PopulateGraph {

    var chartConfigProp = this.graphTemplate.product.subProducts[0].properties;
    var templateYAxisTitle: string;
    var legendPosition: any;

    // Set properties that won't need to be set more than once.
    // if (i === 0) {
    templateYAxisTitle = chartConfigProp.LeftYAxisTitleString;
    legendPosition = this.chartService.setPlotlyLegendPosition(chartConfigProp.LeftYAxisLegendPosition);
    // }
    // These two are the string representing the keys in the current result.
    // They will be used to populate the X & Y axes arrays.
    let xAxis = Object.keys(delimitedData.data[0])[0];
    let yAxis = Object.keys(delimitedData.data[0])[1];

    // Populate the arrays needed for the X & Y axes.
    var xAxisLabels: string[] = [];
    var yAxisData: number[] = [];
    for (let resultObj of delimitedData.data) {
      xAxisLabels.push(resultObj[xAxis]);
      yAxisData.push(parseFloat(resultObj[yAxis]));
    }
    // Populate various other chart properties. They will be checked for validity
    // in createPlotlyGraph().
    var graphType: string = graphData.properties.GraphType.toLowerCase();
    var backgroundColor: string = graphData.properties.Color;
    var TSAlias: string = graphData.properties.TSAlias;
    var units: string = chartConfigProp.LeftYAxisUnits;

    var datePrecision: number = this.chartService.determineDatePrecision(graphData.properties.TSID);
    var legendLabel = this.chartService.formatLegendLabel(graphData.properties.TSID);

    this.addToAttributeTable(xAxisLabels, { csvYAxisData: yAxisData },
      (TSAlias !== '') ? TSAlias : legendLabel, units, index, datePrecision);

    // Return the PopulateGraph instance that will be passed to create the Plotly graph.
    return {
      chartMode: this.chartService.verifyPlotlyProp(graphType, IM.GraphProp.cm),
      chartType: this.chartService.verifyPlotlyProp(graphType, IM.GraphProp.ct),
      dataLabels: xAxisLabels,
      datasetData: yAxisData,
      datasetBackgroundColor: backgroundColor,
      graphFileType: 'csv',
      isCSV: true,
      legendLabel: (TSAlias !== '') ? TSAlias : legendLabel,
      legendPosition: legendPosition,
      yAxesLabelString: templateYAxisTitle
    }
  }

  /**
  * Listens to another widget and updates when something is updated in said widget.
  */
  // TODO jpkeahey 2022-05-10: Name this listenForSelectEvent? Put this function
  // in a for loop and listen to all events?
  private listenForEvent(): void {

    // TODO jpkeahey 2022-04-27: This might need to be in a for loop for multiple
    // Event objects in the eventHandlers.
    this.eventService.getWidgetEvent(this.chartWidget).subscribe((selectEvent: IM.SelectEvent) => {

      // Check if the initial selectEvent was passed.
      if (selectEvent === null) {
        return;
      }

      // If graphTemplatePrime hasn't been set yet, read it in and set it here.
      if (!this.graphTemplatePrime) {
        this.updateResultsSub = this.commonService.getJSONData(
          this.commonService.buildPath(IM.Path.dbP, [this.chartWidget.graphTemplatePath])
        ).subscribe({
          next: (graphTemplate: IM.GraphTemplate) => {
            this.graphTemplatePrime = graphTemplate;
            // Update the chart with the new feature object data.
            this.updateChartVariables(selectEvent);
          }
        });
      } else {
        // Update the chart with the new feature object data.
        this.updateChartVariables(selectEvent);
      }
    });
  }

  /**
  * Sets up properties and creates the configuration object to be used by Plotly.
  * @param timeSeries The array of all Time Series objects retrieved asynchronously
  * from the StateMod file.
  */
  private makeTSPlotlyObject(timeSeries: TS, graphData: IM.GraphData, index: number): IM.PopulateGraph {

    var chartConfigProp = this.graphTemplate.product.subProducts[0].properties;
    var templateYAxisTitle: string = '';
    var legendPosition: any;

    // Set up the parts of the graph object that won't need to be set more than once.
    // TODO: Think about moving this up a method.
    // if (i === 0) {
    templateYAxisTitle = chartConfigProp.LeftYAxisTitleString;
    legendPosition = this.chartService.setPlotlyLegendPosition(chartConfigProp.LeftYAxisLegendPosition,
      this.graphTemplate.product.subProducts[0].data.length);
    // }

    // 
     var xAxisLabels: string[] = this.chartService.getDates(
      timeSeries.getDate1().toString(),
      timeSeries.getDate2().toString(),
      timeSeries);

    var start = timeSeries.getDate1().getYear() + "-" +
      this.chartService.zeroPad(timeSeries.getDate1().getMonth(), 2);

    var end = timeSeries.getDate2().getYear() + "-" +
      this.chartService.zeroPad(timeSeries.getDate2().getMonth(), 2);

    var yAxisData = this.chartService.setYAxisData(timeSeries);

    // Populate the rest of the properties from the graph config file. This uses
    // the more granular graphType for each time series.
    var chartType: string = graphData.properties.GraphType.toLowerCase();
    if (!chartType) {
      chartType = chartConfigProp.GraphType.toLowerCase();
    }
    var lineWidth: string = graphData.properties.LineWidth.toLowerCase();
    var backgroundColor: string = graphData.properties.Color;
    var TSAlias = graphData.properties.TSAlias;
    var units: string = timeSeries.getDataUnits();
    var datePrecision = timeSeries.getDataIntervalBase();

    var legendLabel: string;
    if (graphData.properties.LegendFormat === "Auto") {
      legendLabel = timeSeries.formatLegend('%A');
    } else {
      legendLabel = timeSeries.formatLegend(graphData.properties.LegendFormat);
    }

    this.addToAttributeTable(xAxisLabels, { plotlyYAxisData: yAxisData },
      (TSAlias !== '') ? TSAlias : legendLabel, units, index, datePrecision);

    // Return the PopulateGraph instance that will be passed to create the Plotly graph.
    return {
      chartMode: this.chartService.verifyPlotlyProp(chartType, IM.GraphProp.cm),
      chartType: this.chartService.verifyPlotlyProp(chartType, IM.GraphProp.ct),
      endDate: end,
      fillType: this.chartService.verifyPlotlyProp(chartType, IM.GraphProp.fl),
      plotlyDatasetData: yAxisData,
      plotlyXAxisLabels: xAxisLabels,
      datasetBackgroundColor: this.chartService.verifyPlotlyProp(backgroundColor, IM.GraphProp.bc),
      graphFileType: 'TS',
      legendLabel: (TSAlias !== '') ? TSAlias : legendLabel,
      legendPosition: legendPosition,
      lineWidth: this.chartService.verifyPlotlyProp(lineWidth, IM.GraphProp.lw),
      stackGroup: this.chartService.verifyPlotlyProp(chartType, IM.GraphProp.sk),
      startDate: start,
      yAxesLabelString: templateYAxisTitle
    }
  }

  /**
  * Initial function call when the Dialog component is created. Determines whether
  * a CSV or StateMod file is to be read for graph creation.
  */
  ngOnInit(): void {
    
    this.isChartError$ = this.isChartError;

    switch(this.chartDisplayType) {
      case IM.ChartDisplayType.dlg:
        this.setupForDialog();
        break;
      case IM.ChartDisplayType.emd: break;
      case IM.ChartDisplayType.ful: break;
      case IM.ChartDisplayType.wid:
        this.checkWidgetObject();
        if (this.eventService.hasSelectEvent(this.chartWidget) === true) {
          this.listenForEvent();
        }
        break;
    }

    
  }

  /**
  * Called once, before the instance is destroyed. Unsubscribes from all defined
  * subscriptions to prevent memory leaks.
  */
  ngOnDestroy(): void {
    if (this.allResultsSub$) {
      this.allResultsSub$.unsubscribe();
    }
    if (this.initialResultsSub$) {
      this.initialResultsSub$.unsubscribe()
    }
    if (this.updateResultsSub) {
      this.updateResultsSub.unsubscribe();
    }
  }

  /**
  * Use the DatastoreManager to obtain all data necessary to display on a Plotly
  * chart.
  */
  private obtainAndCreateAllGraphs(): void {

    var chartError = false;
    var allDataObservables: Observable<any>[] = [];
    var allGraphObjects: IM.PopulateGraph[] = [];
    // The array of all graphData objects in the graph template file.
    const graphData = this.graphTemplate.product.subProducts[0].data;

    // Iterate over all graphData objects in the graph template file.
    graphData.forEach((graphData) => {
      var dataObservable = this.dsManager.getDatastoreData(this.commonService, graphData.properties.TSID);
      allDataObservables.push(dataObservable);
    });

    this.allResultsSub$ = forkJoin(allDataObservables).subscribe((allResults: any[]) => {

      allResults.forEach((result: any, i: number) => {

        // Check for any errors.
        if (result.error) {
          console.error('Graph Template file: Graph object in position ' + (i + 1) +
            ' from the data array has errored. If this chart object does not have an ' +
            'eventHandler, ${} properties are not allowed in the path to the data.');
          chartError = true;
          return;
        }

        var TSID = this.commonService.parseTSID(graphData[i].properties.TSID);
        var datastore = this.dsManager.getDatastore(TSID.datastore);

        switch (datastore.type) {
          case IM.DatastoreType.delimited:
            allGraphObjects.push(this.makeDelimitedPlotlyObject(result, graphData[i], i));
            break;
          case IM.DatastoreType.dateValue:
          case IM.DatastoreType.stateMod:
            allGraphObjects.push(this.makeTSPlotlyObject(result, graphData[i], i));
            break;
        }
      });

      if (chartError === true) {
        this.setChartError = true;
        return;
      } else {
        this.setChartError = false;
      }

      this.createPlotlyGraph(allGraphObjects);
    });
  }

  /**
   * Loops through (and checks) each TSID given in a graph template and creates
   * a unique string.
   * @returns A unique ID to be used in the template file div that Plotly uses to
   * render the chart on the DOM.
   */
  private setUniqueID(): any {

    var uniqueID = '';

    this.graphTemplate.product.subProducts[0].data.forEach((graphData, i) => {
      var TSIDLocation = this.commonService.parseTSID(graphData.properties.TSID).location;
      if (TSIDLocation === null) {
        return null;
      } else {
        uniqueID += TSIDLocation + '-' + i
      }
    });

    return uniqueID;
  }

  /**
   * 
   */
  private setupForDialog(): void {

    this.graphTemplate = this.chartDialog.graphTemplate;
    this.toggleDataLoading = false;

    this.TSIDLocation = this.setUniqueID();

    this.obtainAndCreateAllGraphs();
  }

  /**
  * Retrieves  and performs other necessary actions
  * to set up and display a chart using a widget object.
  */
  private setupForWidget(): void {

    this.initialResultsSub$ = this.commonService.getJSONData(
      this.commonService.buildPath(IM.Path.dbP, [this.chartWidget.graphTemplatePath])
    ).subscribe({

      next: (graphTemplate: IM.GraphTemplate) => {

        this.graphTemplatePrime = graphTemplate;
        // Create a clone of the original graph template file.
        this.graphTemplate = structuredClone(this.graphTemplatePrime);

        this.toggleDataLoading = false;

        if (this.setUniqueID() !== null) {
          this.TSIDLocation = this.setUniqueID();
        } else if (this.setUniqueID() === null) {
          this.errorTypes.push('bad TSID');
          this.setChartError = true;
          return;
        }

        this.obtainAndCreateAllGraphs();
      }
    });
  }

  /**
  * Called when an item has been selected from this widget's dropdown list. Uses
  * an object with the new data so it can be used to update the drawn chart.
  * @param selectEvent The ChartSelector communicator object passed by the BehaviorSubject
  * when it has been updated.
  */
  private updateChartVariables(selectEvent: IM.SelectEvent): void {

    this.featureProperties = selectEvent.selectedItem;
    this.graphTemplate = structuredClone(this.graphTemplatePrime);

    // Replace the ${properties} in the graphTemplate object from the graph
    // template file.
    this.commonService.replaceProperties(this.graphTemplate, this.featureProperties);

    // Set the class variable TSIDLocation to the first dataGraph object from the
    // graphTemplate object. This is used as a unique identifier for the Plotly
    // graph <div> id attribute.
    this.toggleDataLoading = false;

    if (this.setUniqueID() !== null) {
      this.TSIDLocation = this.setUniqueID();
    } else if (this.setUniqueID() === null) {
      this.errorTypes.push('bad TSID');
      this.setChartError = true;
      return;
    }

    this.obtainAndCreateAllGraphs();
  }

}
