import { Component,
          Inject, 
          OnDestroy, 
          OnInit}                from '@angular/core';
import { MatDialog,
          MatDialogConfig,
          MatDialogRef,
          MAT_DIALOG_DATA }       from '@angular/material/dialog';

import { forkJoin }               from 'rxjs';

import { DialogTSTableComponent } from '../dialog-tstable/dialog-tstable.component';

import { DateTime }               from '@OpenWaterFoundation/common/util/time';
import { StateMod_TS }            from '@OpenWaterFoundation/common/dwr/statemod';
import { MonthTS,
          TS,
          YearTS,
          DateValueTS }           from '@OpenWaterFoundation/common/ts';
import { DataUnits }              from '@OpenWaterFoundation/common/util/io';
import { OwfCommonService }       from '@OpenWaterFoundation/common/services';
import * as IM                    from '@OpenWaterFoundation/common/services';
import { WindowManager,
          WindowType }            from '@OpenWaterFoundation/common/ui/window-manager';

import * as Papa                  from 'papaparse';
import * as moment_               from 'moment';
const moment = moment_;
import { Chart }                  from 'chart.js';
import                                 'chartjs-plugin-zoom';

// I believe that if this type of 'import' is used, the package needs to be added
// to the angular.json scripts array.
declare var Plotly: any;

@Component({
  selector: 'dialog-TSGraph',
  templateUrl: './dialog-TSGraph.component.html',
  styleUrls: ['./dialog-TSGraph.component.css', '../main-dialog-style.css']
})
export class DialogTSGraphComponent implements OnInit, OnDestroy {
  /** The array of objects to pass to the tstable component for data table creation. */
  public attributeTable: any[] = [];
  /** This variable lets the template file know if neither a CSV, DateValue, or StateMod file is given. */
  public badFile = false;
  /** A string representing the chartPackage property given (or not) from a popup configuration file. */
  public chartPackage: string;
  /** A string containing the name to be passed to the TSTableComponent's first column name: DATE or DATE / TIME. */
  public dateTimeColumnName: string;
  /** The graph template object retrieved from the popup configuration file property resourcePath. */
  public graphTemplateObject: any;
  /** The name of the download file for the dialog-tstable component. */
  private downloadFileName: string;
  /** The object containing all of the layer's feature properties. */
  public featureProperties: any;
  /** The absolute or relative path to the data file used to populate the graph being created. */
  public graphFilePath: string;
  /** Set to false so the Material progress bar never shows up.*/
  public isLoading = false;
  /** Boolean for helping dialog-tstable component determine what kind of file needs downloading. */
  public isTSFile: boolean;
  /** A string representing the documentation retrieved from the txt, md, or html file to be displayed for a layer. */
  public mainTitleString: string;
  /**
   * Used as a path resolver and contains the path to the map configuration that is using this TSGraphComponent.
   * To be set in the app service for relative paths.
   */
  public mapConfigPath: string;
  /**
   * The array of TS objects that was originally read in using the StateMod or DateValue Java converted code. Used as a
   * reference in the dialog-tstable component for downloading to the user's local machine.
   */
  public TSArrayOGResultRef: TS[];
  /**
   * The string representing the TSID before the first tilde (~) in the graph template object. Used to help create
   * a unique graph ID.
   */
  public TSID_Location: string;
  /**
   * An array containing the value header names after the initial DATE / TIME header. To be passed to dialog-tstable for
   * downloading files.
   */
  public valueColumns: string[] = [];
  /** A string representing the button ID of the button clicked to open this dialog. */
  public windowID: string;
  /** The windowManager instance, which creates, maintains, and removes multiple open dialogs in an application. */
  public windowManager: WindowManager = WindowManager.getInstance();


  /**
   * @constructor for the DialogTSGraph Component
   * @param owfCommonService A reference to the top level service OwfCommonService
   * @param dialogRef The reference to the DialogTSGraphComponent. Used for creation and sending of data.
   * @param dialogService A reference to the map service, for sending data
   * @param data The incoming templateGraph object containing data about from the graph template file
   */
  constructor(public owfCommonService: OwfCommonService,
              public dialog: MatDialog,
              public dialogRef: MatDialogRef<DialogTSGraphComponent>,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.windowID = dataObject.data.windowID;
    this.featureProperties = dataObject.data.featureProperties;
    this.chartPackage = dataObject.data.chartPackage;
    this.downloadFileName = dataObject.data.downloadFileName ? dataObject.data.downloadFileName : undefined;
    this.graphTemplateObject = dataObject.data.graphTemplate;
    this.graphFilePath = dataObject.data.graphFilePath;
    this.mapConfigPath = dataObject.data.mapConfigPath;
    this.TSID_Location = dataObject.data.TSID_Location;
  }


  /**
   * Creates the attributeTable array of objects to be passed to the dialog-tstable component for displaying a data table
   * @param x_axisLabels The array of x-axis labels from the graph being created to show in the data table
   * @param axisObject The axisObject contains either the chartJS or plotly created data array
   * @param units The units being used on the graph to be shown as a column
   */
  private addToAttributeTable(x_axisLabels: string[], axisObject: any, TSAlias: string, units: string, TSIndex: number, datePrecision?: number): void {
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

      if (axisObject.csv_y_axisData) {
        for (let i = 0; i < x_axisLabels.length; i++) {
          // Push the object into the attributeTable
          this.attributeTable.push({
            [column1Name]: x_axisLabels[i],
            // Ternary operator determining if the value is NaN. The data table will show nothing if that's the case
            [displayedUnits]: isNaN(axisObject.csv_y_axisData[i]) ? '' : axisObject.csv_y_axisData[i].toFixed(outputPrecision)
          });
        }
      }
      // If a plotly graph was created, use the plotly created data array
      else if (axisObject.plotly_yAxisData) {
        for (let i = 0; i < x_axisLabels.length; i++) {
          // Push the object into the attributeTable
          this.attributeTable.push({
            [column1Name]: x_axisLabels[i],
            // Ternary operator determining if the value is NaN. The data table will show nothing if that's the case
            [displayedUnits]: isNaN(axisObject.plotly_yAxisData[i]) ? '' : axisObject.plotly_yAxisData[i].toFixed(outputPrecision)
          });
        }
      }
      // If a chartJS graph was created, use the chartJS created data array
      else {
        for (let i = 0; i < x_axisLabels.length; i++) {
          // Push the object into the attributeTable
          this.attributeTable.push({
            [column1Name]: x_axisLabels[i],
            // Ternary operator determining if the value is NaN. The data table will show nothing if that's the case
            [displayedUnits]: isNaN(axisObject.chartJS_yAxisData[i]) ? '' : axisObject.chartJS_yAxisData[i].toFixed(outputPrecision)
          });
        }
      }
    }
    // If the second or more time series, just add the data column for it
    else {
      // Create the column name for the current time series' units
      var displayedUnits = units ? TSAlias + ' (' + units + ')' : TSAlias;
      this.valueColumns.push(displayedUnits);
      var foundIndex: number;

      if (axisObject.csv_y_axisData) {
        for (let i = 0; i < this.attributeTable.length; i++) {
          foundIndex = x_axisLabels.findIndex(element => element === this.attributeTable[i][column1Name]);
          if (foundIndex !== -1) {
            this.attributeTable[i][displayedUnits] = isNaN(axisObject.csv_y_axisData[foundIndex]) ? '' : axisObject.csv_y_axisData[foundIndex].toFixed(outputPrecision);
            continue;
          } else {
            this.attributeTable[i][displayedUnits] = '';
            continue;
          }
        }

        var start_counter = 0;
        var end_counter = 1;
        for (let i = 0; i < x_axisLabels.length; i++) {
          if (x_axisLabels[i] < this.attributeTable[start_counter][column1Name]) {
            this.attributeTable.splice(start_counter, 0, { 
              [column1Name]: x_axisLabels[i],
              [displayedUnits]: isNaN(axisObject.csv_y_axisData[i]) ? '' : axisObject.csv_y_axisData[i].toFixed(outputPrecision)
            })
            start_counter++;

          } else if (x_axisLabels[i] > this.attributeTable[this.attributeTable.length - end_counter][column1Name]) {
            this.attributeTable.push({
              [column1Name]: x_axisLabels[i],
              [displayedUnits]: isNaN(axisObject.csv_y_axisData[i]) ? '' : axisObject.csv_y_axisData[i].toFixed(outputPrecision)
            })
            end_counter++;
          }
        }
      }
      // If a plotly graph was created, use the plotly created data array
      else if (axisObject.plotly_yAxisData) {
        for (let i = 0; i < this.attributeTable.length; i++) {
          foundIndex = x_axisLabels.findIndex(element => element === this.attributeTable[i][column1Name]);
          if (foundIndex !== -1) {
            this.attributeTable[i][displayedUnits] =
            isNaN(axisObject.plotly_yAxisData[foundIndex]) ? '' : axisObject.plotly_yAxisData[foundIndex].toFixed(outputPrecision);
            continue;
          } else {
            this.attributeTable[i][displayedUnits] = '';
            continue;
          }
        }

        var start_counter = 0;
        var end_counter = 1;
        for (let i = 0; i < x_axisLabels.length; i++) {
          if (x_axisLabels[i] < this.attributeTable[start_counter][column1Name]) {
            this.attributeTable.splice(start_counter, 0, { 
              [column1Name]: x_axisLabels[i],
              [displayedUnits]: isNaN(axisObject.plotly_yAxisData[i]) ? '' : axisObject.plotly_yAxisData[i].toFixed(outputPrecision)
            })
            start_counter++;

          } else if (x_axisLabels[i] > this.attributeTable[this.attributeTable.length - end_counter][column1Name]) {
            this.attributeTable.push({
              [column1Name]: x_axisLabels[i],
              [displayedUnits]: isNaN(axisObject.plotly_yAxisData[i]) ? '' : axisObject.plotly_yAxisData[i].toFixed(outputPrecision)
            })
            end_counter++;
          }
        }
      }
      // If a chartJS graph was created, use the chartJS created data array
      else {
        for (let i = 0; i < x_axisLabels.length; i++) {
          // Ternary operator determining if the value is NaN. The data table will show nothing if that's the case
          this.attributeTable[i][displayedUnits] =
          isNaN(axisObject.chartJS_yAxisData[i]) ? '' : axisObject.chartJS_yAxisData[i].toFixed(outputPrecision);
        }
      }
    }
    this.isLoading = false;
  }

  /**
   * This function actually creates the graph canvas element to show in the dialog. One or more PopulateGraph instances
   * is given, and we take each one of the PopulateGraph attributes and use them to populate the Chart object that is
   * being created. 
   * @param config An array of PopulateGraph instances (objects?)
   */
  createChartJSGraph(config: PopulateGraph[]): void {

    // Create the graph labels array for the x axis
    var mainGraphLabels = this.createChartMainGraphLabels(config);
    
    // Typescript does not support dynamic invocation, so instead of creating ctx
    // on one line, we can cast the html element to a canvas element. Then we can
    // create the ctx variable by using getContext() on the canvas variable.
    var canvas = <HTMLCanvasElement> document.getElementById('myChart');
    var ctx = canvas.getContext('2d');

    // TODO: jpkeahey 2020.06.03 - Maybe use a *ngFor loop in the DialogTSGraphComponent
    // template file to create as many charts as needed. As well as a for loop
    // here obviously for going through subProducts?
    var myChart = new Chart(ctx, {
      type: validate(config[0].chartType, 'GraphType'),
      data: {
        labels: validate(mainGraphLabels, 'xAxisDataLabels'),                       // X-axis labels
        datasets: [
          {
            label: config[0].legendLabel,
            data: config[0].datasetData,                                     // Y-axis data
            backgroundColor: 'rgba(33, 145, 81, 0)',              // The graph fill color, with a = 'alpha' = 0 being 0 opacity
            borderColor: validate(config[0].datasetBackgroundColor, 'borderColor'), // Color of the border or line of the graph
            borderWidth: 1,
            spanGaps: false,
            lineTension: 0
          }
        ]
      },
      options: {
        animation: {
          duration: 0
        },
        responsive: true,
        legend: {
          position: 'bottom'
        },
        scales: {
          xAxes: [
            {
              display: true,
              distribution: 'linear',
              ticks: {
                maxTicksLimit: 10,                                                  // No more than 10 ticks
                maxRotation: 0                                                      // Don't rotate labels
              }
            }
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: config[0].yAxesLabelString
              }
            }
          ]
        },
        elements: {                                                                 // Show each element on the
          point: {                                                                  // graph with a small circle
            radius: 1
          }
        },
        tooltips: {
          callbacks: {
            title: function (tooltipItem, data) {                                   // Returns the date ['x'] from the
              return data.datasets[tooltipItem[0].datasetIndex].data[tooltipItem[0].index]['x']; // dataset at the clicked
            }                                                                       // tooltips index
          }                                                                         //,
                                                                                    //intersect: false,
                                                                                    //mode: 'nearest'
        },
        plugins: {                                                                  // Extra plugin for zooming
          zoom: {                                                                   // and panning.
            pan: {
              enabled: true,
              mode: 'x'
            },
            zoom: {
              enabled: true,
              drag: false,
              mode: 'x'
            }
          }
        }
      }
    });

    // If the passed in config array object has more than one PopulateGraph instance, there is more than one time series to show
    // in the graph. 
    if (config.length > 1) {
      for (let i = 1; i < config.length; i++) {
        // Push a dataset object straight into the datasets property in the current graph.
        myChart.data.datasets.push({
          label: config[i].legendLabel,
          data: config[i].datasetData,
          type: validate(config[i].chartType, 'GraphType'),
          backgroundColor: 'rgba(33, 145, 81, 0)',
          borderColor: validate(config[i].datasetBackgroundColor, 'borderColor'),
          borderWidth: 1,
          spanGaps: false,
          lineTension: 0
        });
        // Don't forget to update the graph!
        myChart.update();
      }
      
    }

    /**
     * This helper function decides if the given property in the chart config object above is defined. If it isn't, an error
     * message is created with a detailed description of which graph template attribute was incorrect. It will also let the
     * user know a default will be used instead.
     * @param property The property that is to be used to populate the graph
     * @param templateAttribute A string representing a broad description of the property being validated
     */
    function validate(property: any, templateAttribute: string): any {

      if (!property) {
        switch(templateAttribute) {
          case 'GraphType':
            console.error('[' + templateAttribute + '] not defined or incorrectly set. Using the default line graph');
            return 'line';
          case 'xAxisDataLabels':
            throw new Error('Fatal Error: [' + templateAttribute +
                              '] not set. Needed for chart creation. Check graph template file and graph data file.');
          case 'borderColor':
            console.error('[' + templateAttribute + '] not defined or incorrectly set. Using the default color black');
            return 'black';
        }
      }
      // TODO: jpkeahey 2020.06.12 - If the property exists, just return it for now. Can check if it's legit later
      else {
        return property;
      }
    }
  }

  /**
   * Determine the full length of days to create on the chart to be shown
   * @param config The array of PopulateGraph instances created from the createTSChartJSGraph function. Contains configuration
   * metadata and data about each time series graph that needs to be created
   */
  private createChartMainGraphLabels(config: PopulateGraph[]): string[] {

    var labelStartDate = '3000-01';
    var labelEndDate = '1000-01';
    var mainGraphLabels: string[] = [];

    // If the files read were StateMod files, go through them all and determine the absolute first and last dates
    if (config[0].graphFileType === 'TS') {
      
      for (let instance of config) {
        if (new Date(instance.startDate) < new Date(labelStartDate)) {
          labelStartDate = instance.startDate;
        }
        if (new Date(instance.endDate) > new Date(labelEndDate)) {
          labelEndDate = instance.endDate;
        }
      }
      // Create the array and populate with dates in between the two dates given
      // TODO: jpkeahey 2020.07.02 - This only uses months right now, and nothing else
      mainGraphLabels = this.getDates(labelStartDate, labelEndDate, 'months');
    } else if (config[0].graphFileType === 'csv') {
      mainGraphLabels = config[0].dataLabels;
    }
    return mainGraphLabels;
  }

  /**
   * Takes the results given from Papa Parse and creates a PopulateGraph instance by assigning its members. It then adds the
   * PopulateGraph instance to an array for each CSV file found in the graph config file
   * @param results The results array returned asynchronously from Papa Parse. Contains at least one result object
   */
  private createCSVConfig(results: any[]): void {

    var chartConfig: Object = this.graphTemplateObject;
    var chartConfigData = chartConfig['product']['subProducts'][0]['data'];
    var chartConfigProperties = chartConfig['product']['subProducts'][0]['properties'];
    var configArray: PopulateGraph[] = [];
    var templateYAxisTitle: string;
    var chartJSGraph: boolean;
    var legendPosition: any;

    for (let rIndex = 0; rIndex < results.length; rIndex++) {

      // Set up the parts of the graph that won't need to be set more than once, such as the LeftYAxisTitleString
      if (rIndex === 0) {
        templateYAxisTitle = chartConfigProperties.LeftYAxisTitleString;
        legendPosition = this.setPlotlyLegendPosition(chartConfigProperties.LeftYAxisLegendPosition);
      }
      // These two are the string representing the keys in the current result.
      // They will be used to populate the x- and y-axis arrays
      let x_axis = Object.keys(results[rIndex].data[0])[0];
      let y_axis = Object.keys(results[rIndex].data[0])[1];

      // Populate the arrays needed for the x- and y-axes
      var x_axisLabels: string[] = [];
      var y_axisData: number[] = [];
      for (let resultObj of results[rIndex].data) {
        x_axisLabels.push(resultObj[x_axis]);
        y_axisData.push(parseFloat(resultObj[y_axis]));
      }
      // Populate various other chart properties. They will be checked for validity in createGraph()
      var graphType: string = chartConfigData[rIndex]['properties'].GraphType.toLowerCase();
      var backgroundColor: string = chartConfigData[rIndex]['properties'].Color;
      var TSAlias: string = chartConfigData[rIndex]['properties'].TSAlias;
      var units: string = chartConfigProperties.LeftYAxisUnits;

      var datePrecision: number = this.determineDatePrecision(chartConfigData[rIndex]['properties'].TSID);
      var legendLabel = this.formatLegendLabel(chartConfigData[rIndex]);

      this.addToAttributeTable(x_axisLabels, {csv_y_axisData: y_axisData}, (TSAlias !== '') ? TSAlias : legendLabel, units, rIndex, datePrecision);

      // Create the PopulateGraph instance that will be passed to create either the Chart.js or Plotly.js graph
      var config: PopulateGraph = {
        chartMode: this.verifyGraphProp(graphType, GraphProp.cm),
        chartType: this.verifyGraphProp(graphType, GraphProp.ct),
        dataLabels: x_axisLabels,
        datasetData: y_axisData,
        datasetBackgroundColor: backgroundColor,
        graphFileType: 'csv',
        legendLabel: (TSAlias !== '') ? TSAlias : legendLabel,
        legendPosition: legendPosition,
        yAxesLabelString: templateYAxisTitle
      }
      // Push the config instance into the configArray to be sent to createXXXGraph()
      configArray.push(config);
    }    

    // Determine whether a chartJS graph or Plotly graph needs to be made
    // NOTE: Plotly is the default charting package
    if (!this.chartPackage) {
      chartJSGraph = false;
    } else if (this.chartPackage.toUpperCase() === 'PLOTLY') {
      chartJSGraph = false;
    } else {
      chartJSGraph = true;
    }

    if (chartJSGraph) {
      this.createChartJSGraph(configArray);
    } else {      
      this.createPlotlyGraph(configArray, true);
    }
  }

  /**
   * Sets up properties, and creates the configuration object for the Chart.js graph
   * @param timeSeries The Time Series object retrieved asynchronously from the StateMod file
   */
  private createTSConfig(timeSeries: TS[]): void {

    var chartConfig: Object = this.graphTemplateObject;
    var chartConfigData: any[] = chartConfig['product']['subProducts'][0]['data'];
    var chartConfigProperties = chartConfig['product']['subProducts'][0]['properties'];
    var configArray: PopulateGraph[] = [];
    var chartJSGraph: boolean;
    var templateYAxisTitle: string = '';
    var legendPosition: any;

    // Go through each time series object in the timeSeries array and create a PopulateGraph instance for each
    // graph that needs to be made
    for (let i = 0; i < timeSeries.length; i++) {
      // Set up the parts of the graph that won't need to be set more than once, such as the LeftYAxisTitleString
      if (i === 0) {
        templateYAxisTitle = chartConfigProperties.LeftYAxisTitleString;
        legendPosition = this.setPlotlyLegendPosition(chartConfigProperties.LeftYAxisLegendPosition, chartConfigData.length);
      }

      var graph_x_axisLabels: string[];
      var data_table_x_axisLabels: string[];
      var x_axisLabels: any;
      var type = '';
      
      if (timeSeries[i] instanceof MonthTS) {
        type = 'months';
        x_axisLabels = this.getDates(timeSeries[i].getDate1().getYear() + "-" + this.zeroPad(timeSeries[i].getDate1().getMonth(), 2),
                                      timeSeries[i].getDate2().getYear() + "-" + this.zeroPad(timeSeries[i].getDate2().getMonth(), 2),
                                      type);
      } else if (timeSeries[i] instanceof YearTS) {
        type = 'years';
        x_axisLabels = this.getDates(timeSeries[i].getDate1().getYear(),
                                      timeSeries[i].getDate2().getYear(),
                                      type);
      }

      // If graph_dates exists, it's not a placeholder, and can populate the graph_x_axisLabels
      if (x_axisLabels.graph_dates) 
        graph_x_axisLabels = x_axisLabels.graph_dates;
      // Populate the data_table_x_axisLabels
      data_table_x_axisLabels = x_axisLabels.data_table_dates

      var start = timeSeries[i].getDate1().getYear() + "-" + this.zeroPad(timeSeries[i].getDate1().getMonth(), 2);      
      var end = timeSeries[i].getDate2().getYear() + "-" + this.zeroPad(timeSeries[i].getDate2().getMonth(), 2);

      var axisObject = this.setAxisObject(timeSeries[i], graph_x_axisLabels, type);
      // Populate the rest of the properties from the graph config file. This uses the more granular graphType for each time series
      var chartType: string = chartConfigData[i]['properties'].GraphType.toLowerCase();
      var backgroundColor: string = chartConfigData[i]['properties'].Color;
      var TSAlias: string = chartConfigData[i]['properties'].TSAlias;
      var units: string = timeSeries[i].getDataUnits();
      var datePrecision = timeSeries[i].getDataIntervalBase();
      // var legendLabel = this.formatLegendLabel(chartConfigData[i]);
      
      var legendLabel: string;
      if (chartConfigData[i].properties.LegendFormat === "Auto") {
        legendLabel = timeSeries[i].formatLegend('%A');
      } else {
        legendLabel = timeSeries[i].formatLegend(chartConfigData[i].properties.LegendFormat);
      }

      this.addToAttributeTable(data_table_x_axisLabels, axisObject, (TSAlias !== '') ? TSAlias : legendLabel,
                                units, i, datePrecision);

      // Create the PopulateGraph object to pass to the createGraph function.
      var chartConfigObject: PopulateGraph = {
        chartMode: this.verifyGraphProp(chartType, GraphProp.cm),
        chartType: this.verifyGraphProp(chartType, GraphProp.ct),
        dateType: type,
        datasetData: axisObject.chartJS_yAxisData,
        plotlyDatasetData: axisObject.plotly_yAxisData,
        plotly_xAxisLabels: graph_x_axisLabels,
        datasetBackgroundColor: this.verifyGraphProp(backgroundColor, GraphProp.bc),
        graphFileType: 'TS',
        legendLabel: (TSAlias !== '') ? TSAlias : legendLabel,
        legendPosition: legendPosition,
        startDate: start,
        endDate: end,
        yAxesLabelString: templateYAxisTitle
      }

      configArray.push(chartConfigObject);
    }
    // Determine whether a chartJS graph or Plotly graph needs to be made.
    if (!this.chartPackage) {
      chartJSGraph = false;
    } else if (this.chartPackage.toUpperCase() === 'PLOTLY') {
      chartJSGraph = false;
    } else {
      chartJSGraph = true;
    }

    if (chartJSGraph) {
      this.createChartJSGraph(configArray);
    } else {
      this.createPlotlyGraph(configArray, false);
    }
    
  }

  /**
   * The final function that, when it reaches its end, will plot the plotly graph with the given data
   * @param config The configuration array that contains all time series data planned to show on the plotly graph
   */
  private createPlotlyGraph(config: PopulateGraph[], CSV: boolean): void {
    // The final data array of objects that is given to Plotly.react() to create the graph
    var finalData: { x: number[], y: number[], type: string }[] = [];
    // The data object being pushed onto the finalData array
    var data: any;
    // The array containing the colors of each graph being displayed, in the order in which they appear
    var colorwayArray: string[] = [];
    
    // Go through the config array and add the necessary configuration data into the data object that will be added to the
    // finalData array. The finalData array is what's given as the second argument to Plotly.plot();
    for (let i = 0; i < config.length; i++) {
      data = {};
      
      data.name = config[i].legendLabel;
      
      data.mode = config[i].chartMode;
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
          width: 1.5
        }
        // Connects between ALL gaps
        // data.connectgaps = true;
      }
      data.type =  config[i].chartType;
      data.x = CSV ? config[i].dataLabels : config[i].plotly_xAxisLabels;
      data.y = CSV ? config[i].datasetData : config[i].plotlyDatasetData;

      colorwayArray.push(config[i].datasetBackgroundColor);
      finalData.push(data);
    }
    // Builds the layout object that will be given as the third argument to the Plotly.plot() function. Creates the graph layout
    // such as graph height and width, legend and axes options, etc.
    var layout = {
      // An array of strings describing the color to display the graph as for each time series
      colorway: colorwayArray,
      height: 550,
      // Create the legend inside the graph and display it in the upper right
      legend: {
        bordercolor: '#c2c1c1',
        borderwidth: 1,
        // Positioning the legend on the x-y axes
        x: config[0].legendPosition.x,
        y: config[0].legendPosition.y
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
        title: config[0].yAxesLabelString,
        // Keeps the y-axis at a fixed range, so when the user zooms, an x-axis zoom takes place
        fixedrange: true
      }
    };
    
    // The fourth and last argument in the Plotly.plot() function, this object contains the graph configuration options
    var plotlyConfig = {
      responsive: true,
      scrollZoom: true
    };
    // Plots the actual plotly graph with the given <div> id, data array, layout and configuration objects organize and maintain
    // multiple opened dialogs in the future.  (https://plotly.com/javascript/plotlyjs-function-reference/#plotlyplot)
    Plotly.react(this.windowID + this.TSID_Location, finalData, layout, plotlyConfig);
  }


  /**
   * This basic function returns a datePrecision number to be used when creating attribute table cell value precision.
   * @param TSID The entire TSID value from the graph config json file
   */
  public determineDatePrecision(TSID: string): number {
    if (TSID.toUpperCase().includes('YEAR') || TSID.toUpperCase().includes('MONTH') ||
        TSID.toUpperCase().includes('WEEK') || TSID.toUpperCase().includes('DAY')) {
          return 100;
    } else return 10;
  }

  /**
   * Go through each dataUnit in the @var dataUnits array that was created when it was read in from the app configuration file
   * in the nav-bar component and set in the app-service. If the units is equal to either the abbreviation or long name, then
   * @return the output precision from the dataUnit, and use that in toFixed() when displaying in the table
   * @param units String representing the units being displayed in the TSGraph
   */
  private determineOutputPrecision(units: string): number {
    var dataUnits: DataUnits[] = this.owfCommonService.getDataUnitArray();

    if (dataUnits && dataUnits.length > 0) {
      for (let dataUnit of dataUnits) {
        if (dataUnit.getAbbreviation().toUpperCase() === units.toUpperCase() || dataUnit.getLongName().toUpperCase() === units.toUpperCase()) {
          return dataUnit.getOutputPrecision();
        }
      }
    }
    // Return a default of 2
    return 2;
  }

  /**
   * 
   * @param chartConfigProperties 
   */
  private formatLegendLabel(chartConfigProperties: any): string {
    var legendLabel: string;
    // Determine what the legend label will be for both this time series graph and the data table, depending on what
    // the full TSID is
    if (chartConfigProperties['properties'].TSID.split('~').length === 2) {
      legendLabel = chartConfigProperties['properties'].TSID.split("~")[1];
    } else if (chartConfigProperties['properties'].TSID.split('~').length === 3) {
      legendLabel = chartConfigProperties['properties'].TSID.split("~")[2];
    }
    // Format the file name by removing an file paths and extensions
    legendLabel = legendLabel.substring(legendLabel.lastIndexOf('/') + 1, legendLabel.lastIndexOf('.'));
    // If the file name is too long (e.g. too many dots (.)), wrapping in the column header cell will look bad, and not doing
    // anything will disappear behind the next column. This converts every third period in the file name to a , with a space
    // behind it. This will help shorten column name sizing without sacrificing readability
    // if ((legendLabel.match(/\./g) || [] ).length >= 3) {
    //   var count = 0;
    //   legendLabel = legendLabel.replace(/\./g, function(match: any) {
    //     count++;
    //     return (count % 3 === 0) ? ', ' : match;
    //   })
    // }

    return legendLabel;
  }

  /**
   * Returns an array of dates between the start and end dates, either per day or month. Skeleton code obtained from
   * https://gist.github.com/miguelmota/7905510
   * @param startDate Date to be the first index in the returned array of dates
   * @param endDate Date to be the last index in the returned array of dates
   * @param interval String describing the interval of how far apart each date should be
   */
  private getDates(startDate: any, endDate: any, interval: string): any {

    var graph_dates: any[] = [];
    var data_table_dates: any[] = [];
    var currentDate: any;

    switch (interval) {
      case 'days':
        currentDate = startDate;

        let addDays = function(days: any) {
          let date = new Date(this.valueOf());
          date.setDate(date.getDate() + days);
          return date;
        };
        // Iterate over each date from start to end and push them to the dates array that will be returned
        while (currentDate <= endDate) {
          // Push an ISO 8601 formatted version of the date into the x axis array that will be used for the data table
          data_table_dates.push(currentDate.format('YYYY-MM-DD'));
          graph_dates.push(currentDate);
          currentDate = addDays.call(currentDate, 1);
        }

        return { graph_dates: graph_dates,
                  data_table_dates: data_table_dates };

      case 'months':
        currentDate = moment(startDate);
        var stopDate = moment(endDate);
        // Iterate over each date from start to end and push them to the dates array that will be returned
        while (currentDate <= stopDate) {
          // Push an ISO 8601 formatted version of the date into the x axis array that will be used for the data table
          data_table_dates.push(currentDate.format('YYYY-MM'));
          graph_dates.push(moment(currentDate).format('MMM YYYY'));
          currentDate = moment(currentDate).add(1, 'months');
        }

        return { graph_dates: graph_dates,
                  data_table_dates: data_table_dates };

      case 'years':
        currentDate = moment(startDate.toString());
        var stopDate = moment(endDate.toString());
        // Iterate over each date from start to end and push them to the dates array that will be returned
        while (currentDate <= stopDate) {
          // Push an ISO 8601 formatted version of the date into the x axis array that will be used for the data table
          data_table_dates.push(currentDate.format('YYYY'));
          graph_dates.push(moment(currentDate).format('YYYY'));
          currentDate = moment(currentDate).add(1, 'y');
        }
        return { graph_dates: graph_dates,
                  data_table_dates: data_table_dates };      
    } 
  }

  /**
  * Initial function call when the Dialog component is created. Determines whether a CSV or StateMod file is to be read
  * for graph creation.
  */
  // TODO: jpkeahey 2020.07.02 - Might need to change how this is implemented, since Steve said both CSV and StateMod (or other)
  // files could be in the same popup template file. They might not be mutually exclusive in the future.
  ngOnInit(): void {
    this.owfCommonService.setMapConfigPath(this.mapConfigPath);
    this.owfCommonService.setChartTemplateObject(this.graphTemplateObject);
    this.owfCommonService.setGraphFilePath(this.graphFilePath);
    this.owfCommonService.setTSIDLocation(this.TSID_Location);
    // Set the mainTitleString to be used by the map template file to display as the TSID location (for now)
    this.mainTitleString = this.graphTemplateObject['product']['properties'].MainTitleString;

    if (this.graphFilePath.includes('.csv')) {
      this.parseCSVFile();
      this.isTSFile = false;
    }
    else if (this.graphFilePath.includes('.stm')) {
      this.parseTSFile(IM.Path.sMP);
      this.isTSFile = true;
    }
    else if (this.graphFilePath.includes('.dv')) {
      this.parseTSFile(IM.Path.dVP);
      this.isTSFile = true;
    }
    else {
      this.badFile = true;
    }
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked, and removes this
   * dialog's window ID from the windowManager.
   */
  public onClose(): void {
    this.dialogRef.close();
    this.windowManager.removeWindow(this.windowID);
  }

  /**
   * Called once, before the instance is destroyed. If the page is changed or a link is clicked on in the dialog that opens
   * a new map, make sure to close the dialog and remove it from the window manager.
   */
  public ngOnDestroy(): void {
    this.dialogRef.close();
    this.windowManager.removeWindow(this.windowID);
  }

  /**
   * Creates and opens the DialogTSTableComponent dialog container showing the time series table for the selected feature on
   * the Leaflet map.
   */
  public openTSTableDialog(): void {
    // Used for testing large data tables
    // for (let i = 0; i < 7; i++) {
    //   this.attributeTable = this.attributeTable.concat(this.attributeTable);
    // }

    var windowID = this.windowID + '-dialog-tsTable';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    // Create and use a MatDialogConfig object to pass to the DialogTSGraphComponent for the graph that will be shown
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      attributeTable: this.attributeTable,
      dateTimeColumnName: this.dateTimeColumnName,
      downloadFileName: this.downloadFileName ? this.downloadFileName : undefined,
      featureProperties: this.featureProperties,
      isTSFile: this.isTSFile,
      TSArrayRef: this.TSArrayOGResultRef,
      windowID: windowID,
      valueColumns: this.valueColumns
    }
    const dialogRef: MatDialogRef<DialogTSTableComponent, any> = this.dialog.open(DialogTSTableComponent, {
      data: dialogConfig,
      hasBackdrop: false,
      panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
      height: "700px",
      width: "650px",
      minWidth: "450px",
      minHeight: "300px",
      maxHeight: "90vh",
      maxWidth: "90vw"
    });
    this.windowManager.addWindow(windowID, WindowType.TABLE);
  }

  /**
   * Calls Papa Parse to asynchronously read in a CSV file.
   */
  private parseCSVFile(): void {

    var templateObject: Object = this.owfCommonService.getChartTemplateObject();
    // The array of each data object in the graph config file
    var dataArray: any[] = templateObject['product']['subProducts'][0]['data'];
    // This array will hold all results returned from Papa Parse, whether one CSV is used, or multiple
    var allResults: any[] = [];
    // The file path string to the TS File
    var filePath: string;

    // Go through each data object in the templateObject from the graph config file
    for (let data of dataArray) {

      // Depending on whether it's a full TSID used in the graph template file, determine what the file path of the StateMod
      // file is. (TSIDLocation~/path/to/filename.stm OR TSIDLocation~StateMod~/path/to/filename.stm)
      if (data.properties.TSID.split('~').length === 2) {
        filePath = data.properties.TSID.split('~')[1];
      } else if (data.properties.TSID.split('~').length === 3) {
        filePath = data.properties.TSID.split('~')[2];
      }

      Papa.parse(this.owfCommonService.buildPath(IM.Path.csvPath, [filePath]), {
        delimiter: ",",
        download: true,
        comments: "#",
        skipEmptyLines: true,
        header: true,
        complete: (result: any, file: any) => {
          allResults.push(result);

          if (allResults.length === dataArray.length) {
            this.createCSVConfig(allResults);
          }
        }
      });

    }
    
  }

  /**
   * A StateMod file is being processed here. Get the template object to determine if there is more than one time series to
   * display. So either one StateMod file is read, or a forkJoin needs to be used to read multiple StateMod files asynchronously.
   * @param TSFile A string defining whether the TSFile to be created is StateMod or DateValue
   */
  private parseTSFile(TSFile: IM.Path): void {

    var templateObject = this.owfCommonService.getChartTemplateObject();
    // Defines a TSObject so it can be instantiated as the desired object later.
    var TSObject: any;
    // Create an array to hold the Observables of each file read.
    var dataArray: any[] = [];
    // The file path string to the TS File.
    var filePath: string;
    // The TSID used by the readTimeSeries function in the converted Java code that utilizes it as a TS identifier.
    var TSIDLocation: string;

    switch (TSFile) {
      case IM.Path.sMP: TSObject = new StateMod_TS(this.owfCommonService); break;
      case IM.Path.dVP: TSObject = new DateValueTS(this.owfCommonService); break;
    }

    
    for (let data of templateObject['product']['subProducts'][0]['data']) {
      // Obtain the TSID location for the readTimeSeries method.
      TSIDLocation = data.properties.TSID.split('~')[0];
      // If a full TSID used in the graph template file, determine the file path of the StateMod
      // file. (TSIDLocation~/path/to/filename.stm OR TSIDLocation~StateMod~/path/to/filename.stm)
      if (data.properties.TSID.split('~').length === 2) {
        filePath = data.properties.TSID.split('~')[1];
      } else if (data.properties.TSID.split('~').length === 3) {
        filePath = data.properties.TSID.split('~')[2];
      }
      // Don't subscribe yet!  
      dataArray.push(TSObject.readTimeSeries(TSIDLocation, this.owfCommonService.buildPath(TSFile, [filePath]),
      null,
      null,
      null,
      true));
    }
    
    // Now that the array has all the Observables needed, forkJoin and subscribe to them all. Their results will now be
    // returned as an Array with each index corresponding to the order in which they were pushed onto the array.
    forkJoin(dataArray).subscribe((resultsArray: TS[]) => {
      this.TSArrayOGResultRef = resultsArray;
      this.createTSConfig(resultsArray);
    });
    
  }

  /**
   * @returns an array of the data values to display on the y Axis of the time series graph being created
   * @param timeSeries The current time series to use to extract the y axis data for the graph
   * @param x_axisLabels The x Axis labels created for the graph
   * @param type The interval type of the time series ('years', 'months', etc...)
   */
  private setAxisObject(timeSeries: any, x_axisLabels: string[], type: string): any {

    var chartJS_yAxisData: number[] = [];
    var plotly_yAxisData: number[] = [];

    let startDate: DateTime = timeSeries.getDate1();
    let endDate: DateTime = timeSeries.getDate2();
    // The DateTime iterator for the the while loop.
    let iter: DateTime = startDate;
    // The index of the x_axisLabel array to push into the chartJS_yAxisData as the x property.
    var labelIndex = 0;      
    
    do {
      // Grab the value from the current Time Series that's being looked at.
      let value = timeSeries.getDataValue(iter);
      // This object will hold both the x and y values so the ChartJS object explicitly knows what value goes with what label
      // This is very useful for displaying multiple Time Series on one graph with different dates used for both.
      var dataObject: any = {};

      // Set the x value as the current date      
      dataObject.x = x_axisLabels[labelIndex];
      // If it's missing, replace value with NaN and push onto the array. If not just push the value onto the array.
      if (timeSeries.isDataMissing(value)) {
        dataObject.y = NaN;
        plotly_yAxisData.push(NaN);
      } else {
        dataObject.y = value;
        plotly_yAxisData.push(value);
      }
      chartJS_yAxisData.push(dataObject);
      // Update the interval and labelIndex now that the dataObject has been pushed onto the chartJS_yAxisData array.
      iter.addInterval(timeSeries.getDataIntervalBase(), timeSeries.getDataIntervalMult());
      labelIndex++;
      // If the month and year are equal, the end has been reached. This will only happen once.
      if (type === 'months') {
        if (iter.getMonth() === endDate.getMonth() && iter.getYear() === endDate.getYear()) {
          dataObject = {};
          var lastValue = timeSeries.getDataValue(iter);
  
          dataObject.x = x_axisLabels[labelIndex];
          if (timeSeries.isDataMissing(lastValue)) {
            dataObject.y = NaN;
            plotly_yAxisData.push(NaN);
          } else {
            dataObject.y = lastValue;
            plotly_yAxisData.push(lastValue);
          }
          chartJS_yAxisData.push(dataObject);
        }
      }
      else if (type === 'years') {
        if (iter.getYear() === endDate.getYear()) {
          dataObject = {};
          var lastValue = timeSeries.getDataValue(iter);
  
          dataObject.x = x_axisLabels[labelIndex];
          if (timeSeries.isDataMissing(lastValue)) {
            dataObject.y = NaN;
            plotly_yAxisData.push(NaN);
          } else {
            dataObject.y = lastValue;
            plotly_yAxisData.push(lastValue);
          }
          chartJS_yAxisData.push(dataObject);
        }
      }

    } while (iter.getMonth() !== endDate.getMonth() || iter.getYear() !== endDate.getYear())

    return {chartJS_yAxisData: chartJS_yAxisData,
            plotly_yAxisData: plotly_yAxisData }
  }

  /**
   * @returns an object with the X and Y offsets for positioning the legend in a Plotly graph.
   * @param legendPosition A string representing the LeftYAxisLegendPosition property from the TSTool graph template file.
   * @param graphCount An optional number of the amount of 'traces' or graphs on showing on the graph itself.
   */
  private setPlotlyLegendPosition(legendPosition: string, graphCount?: number): any {

    var position: {
      x: number, 
      y: number
    } = { x: 0, y: 0 };

    switch(legendPosition) {
      case 'Bottom':
        position.x = 0.4, position.y = -0.15;
        if (graphCount) {
          offsetY();
          return position;
        } else {
          return position;
        }
      case 'BottomLeft':
        position.x = 0, position.y = -0.15;
        if (graphCount) {
          offsetY();
          return position;
        } else {
          return position;
        }
      case 'BottomRight':
        position.x = 0.75, position.y = -0.15;
        if (graphCount) {
          offsetY();
          return position;
        } else {
          return position;
        }
      case 'Left':
        position.x = -0.5, position.y = 0.5;
        return position;
      case 'Right':
        position.x = 1, position.y = 0.5;
        return position;
      case 'InsideLowerLeft':
        position.x = 0, position.y = 0;
        return position;
      case 'InsideLowerRight':
        position.x = 0.75, position.y = 0;
        return position;
      case 'InsideUpperLeft':
        position.x = 0.01, position.y = 1;
        return position;
      case 'InsideUpperRight':
        position.x = 0.75, position.y = 1;
        return position;
    }

    /**
     * For each graph in the table, offset the Y axis of the legend by 0.05, so that whether there's 1 or 6 graphs, the legend
     * won't cover the graph or X axis.
     */
    function offsetY(): void {
      for (let i = 0; i < graphCount; i++) {
        position.y -= 0.05;
      }
    }
  }

  /**
   * Verifies that a potential property being given to a graph config object will not produce any errors by conditionally
   * checking the property and possibly manipulating it before returning it to the PopulateGraph object
   * @param property The variable obtained from the graph config file trying to be implemented as a Plotly property
   * @param type The type of property being scrutinized
   */
  private verifyGraphProp(property: string, type: GraphProp): any {

    switch(type) {
      // CHART MODE
      case GraphProp.cm:
        if (property.toUpperCase() === 'LINE') { return 'lines'; }
        else if (property.toUpperCase() === 'POINT') { return 'markers' }
        else {
          console.warn('Unknown property "' + property.toUpperCase() + '" - Not Line or Point. Using default Graph Type Line');
          return 'lines';
        }
      // CHART TYPE
      case GraphProp.ct:
        if (property.toUpperCase() === 'LINE' || property.toUpperCase() === 'POINT')
          return 'scatter';
        else return 'scatter';
      // BACKGROUND COLOR
      case GraphProp.bc:
        // Convert C / Java '0x' notation into hex hash '#' notation
        if (property.startsWith('0x')) {
          return property.replace('0x', '#');
        } else if (property !== '') {
          return property;
        } else {
          console.warn('No graph property Color detected. Using the default graph color black');
          return 'black';
        }
    }
  }

  /**
   * Helper function that left pads a number by a given amount of places, e.g. num = 1, places = 2, returns 01
   * @param num The number that needs padding
   * @param places The amount the padding will go out to the left
   */
  private zeroPad(num: number, places: number) {    
    return String(num).padStart(places, '0');
  }

}

/**
 * Passes an interface as an argument instead of many arguments when a graph object is created
 */
interface PopulateGraph {
  chartMode?: string;
  chartType: string;
  datasetBackgroundColor?: string;
  datasetData?: number[];
  dataLabels?: string[];
  dateType?: string;
  endDate?: string;
  graphFileType: string;
  legendLabel: string;
  legendPosition: any;
  plotlyDatasetData?: number[];
  plotly_xAxisLabels?: any[];
  startDate?: string;
  yAxesLabelString: string;
}

enum GraphProp {
  bc = 'backgroundColor',
  cm = 'chartMode',
  ct = 'chartType'
}