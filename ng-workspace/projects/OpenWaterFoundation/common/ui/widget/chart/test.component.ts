import { Component,
          Inject,
          Input,
          OnDestroy, 
          OnInit}                 from '@angular/core';
import { MatDialog,
          MatDialogConfig,
          MatDialogRef,
          MAT_DIALOG_DATA }       from '@angular/material/dialog';

import { forkJoin,
          Observable }            from 'rxjs';

import { OwfCommonService }       from '@OpenWaterFoundation/common/services';
import * as IM                    from '@OpenWaterFoundation/common/services';

import { DialogService, DialogTSTableComponent } from '@OpenWaterFoundation/common/ui/dialog';

import { StateMod_TS }            from '@OpenWaterFoundation/common/dwr/statemod';
import { MonthTS,
          TS,
          YearTS,
          DateValueTS }           from '@OpenWaterFoundation/common/ts';
import { DataUnits }              from '@OpenWaterFoundation/common/util/io';
// import { DialogService }          from '@OpenWaterFoundation/common/ui/dialog';
import { WindowManager,
          WindowType }            from '@OpenWaterFoundation/common/ui/window-manager';
import { WidgetService }          from '../widget.service';

import * as Papa                  from 'papaparse';

// I believe that if this type of 'import' is used, the package needs to be added
// to the angular.json scripts array.
declare var Plotly: any;

@Component({
  selector: 'widget-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent {
  // /** The array of objects to pass to the tstable component for data table creation. */
  // public attributeTable: any[] = [];
  // /** This variable lets the template file know if neither a CSV, DateValue, or
  // * StateMod file is given. */
  // public badFile = false;
  // /** A string representing the chartPackage property given (or not) from a popup
  // * configuration file. */
  // public chartPackage: string;
  // /**
  //  * 
  //  */
  // @Input() chartData: any;
  // /** A string containing the name to be passed to the TSTableComponent's first
  // * column name: DATE or DATE / TIME. */
  // public dateTimeColumnName: string;
  // /** The graph template object retrieved from the popup configuration file property
  // * resourcePath. */
  // public graphTemplateObject: any;
  // /** The name of the download file for the dialog-tstable component. */
  // private downloadFileName: string;
  // /** The object containing all of the layer's feature properties. */
  // public featureProperties: any;
  // /** The absolute or relative path to the data file used to populate the graph
  // * being created. */
  // public graphFilePath: string;
  // /** Set to false so the Material progress bar never shows up.*/
  // public isLoading = false;
  // /** Boolean for helping dialog-tstable component determine what kind of file needs
  // * downloading. */
  // public isTSFile: boolean;
  // /** A string representing the documentation retrieved from the txt, md, or html
  // * file to be displayed for a layer. */
  // public mainTitleString: string;
  // /** Used as a path resolver and contains the path to the map configuration that
  // * is using this TSGraphComponent. To be set in the app service for relative paths. */
  // public mapConfigPath: string;
  // /** The array of TS objects that was originally read in using the StateMod or DateValue
  // * Java converted code. Used as a reference in the dialog-tstable component for
  // * downloading to the user's local machine. */
  // public TSArrayOGResultRef: TS[];
  // /** The string representing the TSID before the first tilde (~) in the graph template
  // * object. Used to help create a unique graph ID. */
  // public TSID_Location: string;
  // /** An array containing the value header names after the initial DATE / TIME
  // * header. To be passed to dialog-tstable for downloading files. */
  // public valueColumns: string[] = [];
  // /** The windowManager instance, which creates, maintains, and removes multiple
  // * open dialogs in an application. */
  // public windowManager: WindowManager = WindowManager.getInstance();


  /**
  * @constructor for the DialogTSGraph Component.
  * @param owfCommonService A reference to the top level service OwfCommonService.
  * @param dialogService A reference to the map service, for sending data.
  * @param dialog 
  */
  constructor(private owfCommonService: OwfCommonService) {

  //   this.featureProperties = this.chartData.featureProperties;
  //   this.chartPackage = this.chartData.chartPackage;
  //   this.downloadFileName = this.chartData.downloadFileName ? this.chartData.downloadFileName : undefined;
  //   this.graphTemplateObject = this.chartData.graphTemplate;
  //   this.graphFilePath = this.chartData.graphFilePath;
  //   this.mapConfigPath = this.chartData.mapConfigPath;
  //   this.TSID_Location = this.chartData.TSID_Location;
  //   console.log(this.featureProperties);
  //   console.log(this.chartPackage);
  //   console.log(this.downloadFileName);
  //   console.log(this.graphFilePath);
  //   console.log(this.mapConfigPath);
  //   console.log(this.TSID_Location);

  }


//   /**
//   * Creates the attributeTable array of objects to be passed to the dialog-tstable
//   * component for displaying a data table.
//   * @param x_axisLabels The array of x-axis labels from the graph being created
//   * to show in the data table.
//   * @param axisObject The axisObject contains either the chartJS or plotly created
//   * data array.
//   * @param units The units being used on the graph to be shown as a column.
//   */
//   private addToAttributeTable(x_axisLabels: string[], axisObject: any, TSAlias: string, units: string, TSIndex: number, datePrecision?: number): void {
//     // Retrieve the output precision from the DataUnits array if it exists, and if not default to 2
//     var outputPrecision = this.determineOutputPrecision(units);
//     // For the first column header name, have it be DATE if the datePrecision is week, month or year,
//     // or DATE / TIME if day, hour, minute, etc..
//     var column1Name = (datePrecision > 30) ? 'DATE' : 'DATE / TIME';
//     this.dateTimeColumnName = column1Name;
//     // If the first time series, create the Date / Time column, and the data column for the time series
//     if (TSIndex === 0) {
//       // Create the column name for the current time series' units, including units if it exists, and skipping it otherwise
//       var displayedUnits = units ? TSAlias + ' (' + units + ')' : TSAlias;
//       this.valueColumns.push(displayedUnits);

//       if (axisObject.csv_y_axisData) {
//         for (let i = 0; i < x_axisLabels.length; i++) {
//           // Push the object into the attributeTable
//           this.attributeTable.push({
//             [column1Name]: x_axisLabels[i],
//             // Ternary operator determining if the value is NaN. The data table will show nothing if that's the case
//             [displayedUnits]: isNaN(axisObject.csv_y_axisData[i]) ? '' : axisObject.csv_y_axisData[i].toFixed(outputPrecision)
//           });
//         }
//       }
//       // If a plotly graph was created, use the plotly created data array
//       else if (axisObject.plotly_yAxisData) {
//         for (let i = 0; i < x_axisLabels.length; i++) {
//           // Push the object into the attributeTable
//           this.attributeTable.push({
//             [column1Name]: x_axisLabels[i],
//             // Ternary operator determining if the value is NaN. The data table will show nothing if that's the case
//             [displayedUnits]: isNaN(axisObject.plotly_yAxisData[i]) ? '' : axisObject.plotly_yAxisData[i].toFixed(outputPrecision)
//           });
//         }
//       }
//       // If a chartJS graph was created, use the chartJS created data array
//       else {
//         for (let i = 0; i < x_axisLabels.length; i++) {
//           // Push the object into the attributeTable
//           this.attributeTable.push({
//             [column1Name]: x_axisLabels[i],
//             // Ternary operator determining if the value is NaN. The data table will show nothing if that's the case
//             [displayedUnits]: isNaN(axisObject.chartJS_yAxisData[i]) ? '' : axisObject.chartJS_yAxisData[i].toFixed(outputPrecision)
//           });
//         }
//       }
//     }
//     // If the second or more time series, just add the data column for it
//     else {
//       // Create the column name for the current time series' units
//       var displayedUnits = units ? TSAlias + ' (' + units + ')' : TSAlias;
//       this.valueColumns.push(displayedUnits);
//       var foundIndex: number;

//       if (axisObject.csv_y_axisData) {
//         for (let i = 0; i < this.attributeTable.length; i++) {
//           foundIndex = x_axisLabels.findIndex(element => element === this.attributeTable[i][column1Name]);
//           if (foundIndex !== -1) {
//             this.attributeTable[i][displayedUnits] = isNaN(axisObject.csv_y_axisData[foundIndex]) ? '' : axisObject.csv_y_axisData[foundIndex].toFixed(outputPrecision);
//             continue;
//           } else {
//             this.attributeTable[i][displayedUnits] = '';
//             continue;
//           }
//         }

//         var start_counter = 0;
//         var end_counter = 1;
//         for (let i = 0; i < x_axisLabels.length; i++) {
//           if (x_axisLabels[i] < this.attributeTable[start_counter][column1Name]) {
//             this.attributeTable.splice(start_counter, 0, {
//               [column1Name]: x_axisLabels[i],
//               [displayedUnits]: isNaN(axisObject.csv_y_axisData[i]) ? '' : axisObject.csv_y_axisData[i].toFixed(outputPrecision)
//             })
//             start_counter++;

//           } else if (x_axisLabels[i] > this.attributeTable[this.attributeTable.length - end_counter][column1Name]) {
//             this.attributeTable.push({
//               [column1Name]: x_axisLabels[i],
//               [displayedUnits]: isNaN(axisObject.csv_y_axisData[i]) ? '' : axisObject.csv_y_axisData[i].toFixed(outputPrecision)
//             })
//             end_counter++;
//           }
//         }
//       }
//       // If a plotly graph was created, use the plotly created data array
//       else if (axisObject.plotly_yAxisData) {
//         for (let i = 0; i < this.attributeTable.length; i++) {
//           foundIndex = x_axisLabels.findIndex(element => element === this.attributeTable[i][column1Name]);
//           if (foundIndex !== -1) {
//             this.attributeTable[i][displayedUnits] =
//               isNaN(axisObject.plotly_yAxisData[foundIndex]) ? '' : axisObject.plotly_yAxisData[foundIndex].toFixed(outputPrecision);
//             continue;
//           } else {
//             this.attributeTable[i][displayedUnits] = '';
//             continue;
//           }
//         }

//         var start_counter = 0;
//         var end_counter = 1;
//         for (let i = 0; i < x_axisLabels.length; i++) {
//           if (x_axisLabels[i] < this.attributeTable[start_counter][column1Name]) {
//             this.attributeTable.splice(start_counter, 0, {
//               [column1Name]: x_axisLabels[i],
//               [displayedUnits]: isNaN(axisObject.plotly_yAxisData[i]) ? '' : axisObject.plotly_yAxisData[i].toFixed(outputPrecision)
//             })
//             start_counter++;

//           } else if (x_axisLabels[i] > this.attributeTable[this.attributeTable.length - end_counter][column1Name]) {
//             this.attributeTable.push({
//               [column1Name]: x_axisLabels[i],
//               [displayedUnits]: isNaN(axisObject.plotly_yAxisData[i]) ? '' : axisObject.plotly_yAxisData[i].toFixed(outputPrecision)
//             })
//             end_counter++;
//           }
//         }
//       }
//       // If a chartJS graph was created, use the chartJS created data array
//       else {
//         for (let i = 0; i < x_axisLabels.length; i++) {
//           // Ternary operator determining if the value is NaN. The data table will show nothing if that's the case
//           this.attributeTable[i][displayedUnits] =
//             isNaN(axisObject.chartJS_yAxisData[i]) ? '' : axisObject.chartJS_yAxisData[i].toFixed(outputPrecision);
//         }
//       }
//     }
//     this.isLoading = false;
//   }

//   /**
//   * Takes the results given from Papa Parse and creates a PopulateGraph instance by assigning its members. It then adds the
//   * PopulateGraph instance to an array for each CSV file found in the graph config file
//   * @param results The results array returned asynchronously from Papa Parse. Contains at least one result object
//   */
//   private createCSVConfig(results: any[]): void {

//     var chartConfig: Object = this.graphTemplateObject;
//     var chartConfigData = chartConfig['product']['subProducts'][0]['data'];
//     var chartConfigProp = chartConfig['product']['subProducts'][0]['properties'];
//     var configArray: IM.PopulateGraph[] = [];
//     var templateYAxisTitle: string;
//     var chartJSGraph: boolean;
//     var legendPosition: any;

//     for (let rIndex = 0; rIndex < results.length; rIndex++) {

//       // Set up the parts of the graph that won't need to be set more than once, such as the LeftYAxisTitleString
//       if (rIndex === 0) {
//         templateYAxisTitle = chartConfigProp.LeftYAxisTitleString;
//         legendPosition = this.dialogService.setPlotlyLegendPosition(chartConfigProp.LeftYAxisLegendPosition);
//       }
//       // These two are the string representing the keys in the current result.
//       // They will be used to populate the x- and y-axis arrays.
//       let x_axis = Object.keys(results[rIndex].data[0])[0];
//       let y_axis = Object.keys(results[rIndex].data[0])[1];

//       // Populate the arrays needed for the x- and y-axes.
//       var x_axisLabels: string[] = [];
//       var y_axisData: number[] = [];
//       for (let resultObj of results[rIndex].data) {
//         x_axisLabels.push(resultObj[x_axis]);
//         y_axisData.push(parseFloat(resultObj[y_axis]));
//       }
//       // Populate various other chart properties. They will be checked for validity in createGraph().
//       var graphType: string = chartConfigData[rIndex]['properties'].GraphType.toLowerCase();
//       var backgroundColor: string = chartConfigData[rIndex]['properties'].Color;
//       var TSAlias: string = chartConfigData[rIndex]['properties'].TSAlias;
//       var units: string = chartConfigProp.LeftYAxisUnits;

//       var datePrecision: number = this.dialogService.determineDatePrecision(chartConfigData[rIndex]['properties'].TSID);
//       var legendLabel = this.dialogService.formatLegendLabel(chartConfigData[rIndex]['properties'].TSID);

//       this.addToAttributeTable(x_axisLabels, { csv_y_axisData: y_axisData }, (TSAlias !== '') ? TSAlias : legendLabel, units, rIndex, datePrecision);

//       // Create the PopulateGraph instance that will be passed to create either the Chart.js or Plotly.js graph
//       var config: IM.PopulateGraph = {
//         chartMode: this.dialogService.verifyPlotlyProp(graphType, IM.GraphProp.cm),
//         chartType: this.dialogService.verifyPlotlyProp(graphType, IM.GraphProp.ct),
//         dataLabels: x_axisLabels,
//         datasetData: y_axisData,
//         datasetBackgroundColor: backgroundColor,
//         graphFileType: 'csv',
//         legendLabel: (TSAlias !== '') ? TSAlias : legendLabel,
//         legendPosition: legendPosition,
//         yAxesLabelString: templateYAxisTitle
//       }
//       // Push the config instance into the configArray to be sent to createXXXGraph()
//       configArray.push(config);
//     }

//     // Determine whether a chartJS graph or Plotly graph needs to be made
//     // NOTE: Plotly is the default charting package
//     if (!this.chartPackage) {
//       chartJSGraph = false;
//     } else if (this.chartPackage.toUpperCase() === 'PLOTLY') {
//       chartJSGraph = false;
//     } else {
//       chartJSGraph = true;
//     }

//     if (chartJSGraph) {
//       console.warn('Plotly is the only supported graphing package, \
// using Plotly to display graph.');
//       this.createPlotlyGraph(configArray, true);
//     } else {
//       this.createPlotlyGraph(configArray, true);
//     }
//   }

//   /**
//   * Sets up properties, and creates the configuration object for the Chart.js graph
//   * @param timeSeries The Time Series object retrieved asynchronously from the StateMod file
//   */
//   private createTSConfig(timeSeries: TS[]): void {

//     var chartConfig: Object = this.graphTemplateObject;
//     var chartConfigData: any[] = chartConfig['product']['subProducts'][0]['data'];
//     var chartConfigProp = chartConfig['product']['subProducts'][0]['properties'];
//     var configArray: IM.PopulateGraph[] = [];
//     var chartJSGraph: boolean;
//     var templateYAxisTitle: string = '';
//     var legendPosition: any;

//     // Go through each time series object in the timeSeries array and create a PopulateGraph instance for each
//     // graph that needs to be made
//     for (let i = 0; i < timeSeries.length; i++) {
//       // Set up the parts of the graph that won't need to be set more than once, such as the LeftYAxisTitleString
//       if (i === 0) {
//         templateYAxisTitle = chartConfigProp.LeftYAxisTitleString;
//         legendPosition = this.dialogService.setPlotlyLegendPosition(chartConfigProp.LeftYAxisLegendPosition, chartConfigData.length);
//       }

//       var graph_x_axisLabels: string[];
//       var data_table_x_axisLabels: string[];
//       var x_axisLabels: any;
//       var type = '';

//       if (timeSeries[i] instanceof MonthTS) {
//         type = 'months';
//         x_axisLabels = this.dialogService.getDates(
//           timeSeries[i].getDate1().getYear() + "-" + this.dialogService.zeroPad(timeSeries[i].getDate1().getMonth(), 2),
//           timeSeries[i].getDate2().getYear() + "-" + this.dialogService.zeroPad(timeSeries[i].getDate2().getMonth(), 2),
//           type);
//       } else if (timeSeries[i] instanceof YearTS) {
//         type = 'years';
//         x_axisLabels = this.dialogService.getDates(
//           timeSeries[i].getDate1().getYear(),
//           timeSeries[i].getDate2().getYear(),
//           type);
//       }

//       // If graphDates exists, it's not a placeholder, and can populate the graph_x_axisLabels.
//       if (x_axisLabels.graphDates) {
//         graph_x_axisLabels = x_axisLabels.graphDates;
//       }
//       // Populate the data_table_x_axisLabels.
//       data_table_x_axisLabels = x_axisLabels.dataTableDates

//       var start = timeSeries[i].getDate1().getYear() + "-" + this.dialogService.zeroPad(timeSeries[i].getDate1().getMonth(), 2);
//       var end = timeSeries[i].getDate2().getYear() + "-" + this.dialogService.zeroPad(timeSeries[i].getDate2().getMonth(), 2);

//       var axisObject = this.dialogService.setAxisObject(timeSeries[i], graph_x_axisLabels, type);
//       // Populate the rest of the properties from the graph config file. This uses
//       // the more granular graphType for each time series.
//       var chartType: string = chartConfigData[i]['properties'].GraphType.toLowerCase();
//       var backgroundColor: string = chartConfigData[i]['properties'].Color;
//       var TSAlias: string = chartConfigData[i]['properties'].TSAlias;
//       var units: string = timeSeries[i].getDataUnits();
//       var datePrecision = timeSeries[i].getDataIntervalBase();

//       var legendLabel: string;
//       if (chartConfigData[i].properties.LegendFormat === "Auto") {
//         legendLabel = timeSeries[i].formatLegend('%A');
//       } else {
//         legendLabel = timeSeries[i].formatLegend(chartConfigData[i].properties.LegendFormat);
//       }

//       this.addToAttributeTable(data_table_x_axisLabels, axisObject, (TSAlias !== '') ? TSAlias : legendLabel,
//         units, i, datePrecision);

//       // Create the PopulateGraph object to pass to the createGraph function.
//       var chartConfigObject: IM.PopulateGraph = {
//         chartMode: this.dialogService.verifyPlotlyProp(chartType, IM.GraphProp.cm),
//         chartType: this.dialogService.verifyPlotlyProp(chartType, IM.GraphProp.ct),
//         dateType: type,
//         datasetData: axisObject.chartJS_yAxisData,
//         plotlyDatasetData: axisObject.plotly_yAxisData,
//         plotly_xAxisLabels: graph_x_axisLabels,
//         datasetBackgroundColor: this.dialogService.verifyPlotlyProp(backgroundColor, IM.GraphProp.bc),
//         graphFileType: 'TS',
//         legendLabel: (TSAlias !== '') ? TSAlias : legendLabel,
//         legendPosition: legendPosition,
//         startDate: start,
//         endDate: end,
//         yAxesLabelString: templateYAxisTitle
//       }

//       configArray.push(chartConfigObject);
//     }
//     // Determine whether a chartJS graph or Plotly graph needs to be made.
//     if (!this.chartPackage) {
//       chartJSGraph = false;
//     } else if (this.chartPackage.toUpperCase() === 'PLOTLY') {
//       chartJSGraph = false;
//     } else {
//       chartJSGraph = true;
//     }

//     if (chartJSGraph) {
//       console.warn('Plotly is the only supported graphing package, \
// using Plotly to display graph.');
//       this.createPlotlyGraph(configArray, true);
//     } else {
//       this.createPlotlyGraph(configArray, false);
//     }

//   }

//   /**
//   * Sets up and plots the plotly graph with the given data. Can display multiple
//   * graph objects on one graph.
//   * @param config An array of PopulateGraph typed objects that contain all time
//   * series data planned to be shown on the plotly graph.
//   * @param CSV Boolean representing if a CSV data file was provided.
//   */
//   private createPlotlyGraph(totalGraphConfig: IM.PopulateGraph[], CSV: boolean): void {
//     // The final data array of objects that is given to Plotly.react() to create the graph.
//     var finalData: { x: number[], y: number[], type: string }[] = [];
//     // The data object being pushed onto the finalData array.
//     var data: any;
//     // The array containing the colors of each graph being displayed, in the order
//     // in which they appear.
//     var colorwayArray: string[] = [];

//     // Iterate over the config array and add the necessary configuration data into
//     // the data object that will be added to the finalData array. The finalData array
//     // is what's given as the second argument to Plotly.react();
//     for (let graphConfig of totalGraphConfig) {
//       data = {};

//       data.name = graphConfig.legendLabel;

//       data.mode = graphConfig.chartMode;
//       // data.connectgaps = true;

//       if (data.mode === 'lines+markers') {
//         data.line = {
//           width: 1
//         };
//         data.marker = {
//           size: 4
//         };
//       } else if (data.mode === 'lines') {
//         data.line = {
//           width: 1.5
//         }
//         // Connects between ALL gaps
//         // data.connectgaps = true;
//       }
//       data.type = graphConfig.chartType;
//       data.x = CSV ? graphConfig.dataLabels : graphConfig.plotly_xAxisLabels;
//       data.y = CSV ? graphConfig.datasetData : graphConfig.plotlyDatasetData;

//       colorwayArray.push(graphConfig.datasetBackgroundColor);
//       finalData.push(data);
//     }
//     // Builds the layout object that will be given as the third argument to the Plotly.plot() function. Creates the graph layout
//     // such as graph height and width, legend and axes options, etc.
//     var layout = {
//       // An array of strings describing the color to display the graph as for each time series
//       colorway: colorwayArray,
//       height: 550,
//       // Create the legend inside the graph and display it in the upper right
//       legend: {
//         bordercolor: '#c2c1c1',
//         borderwidth: 1,
//         // Positioning the legend on the x-y axes
//         x: totalGraphConfig[0].legendPosition.x,
//         y: totalGraphConfig[0].legendPosition.y
//       },
//       showlegend: true,
//       // width: 900,
//       xaxis: {
//         // Maximum amount of ticks on the x-axis
//         nticks: 8,
//         tickangle: 0
//       },
//       yaxis: {
//         // 'r' removes the k from the thousands place for numbers larger than 10,000. 
//         // This formatting is taken from d3 formatting:
//         // https://github.com/d3/d3-format/blob/main/README.md#locale_format
//         tickformat: 'r',
//         title: totalGraphConfig[0].yAxesLabelString,
//         // Keeps the y-axis at a fixed range, so when the user zooms, an x-axis zoom takes place
//         fixedrange: true
//       }
//     };

//     // The fourth and last argument in the Plotly.plot() function, this object contains the graph configuration options
//     var plotlyConfig = {
//       responsive: true,
//       scrollZoom: true
//     };
//     // Plots the actual plotly graph with the given <div> id, data array, layout and configuration objects organize and maintain
//     // multiple opened dialogs in the future.  (https://plotly.com/javascript/plotlyjs-function-reference/#plotlyplot)
//     Plotly.react(this.TSID_Location, finalData, layout, plotlyConfig);
//   }

//   /**
//   * Go through each dataUnit in the @var dataUnits array that was created when
//   * it was read in from the app configuration file in the nav-bar component and
//   * set in the app-service.
//   * @return The output precision from the dataUnit.
//   * @param units String representing the units being displayed in the TSGraph.
//   */
//   private determineOutputPrecision(units: string): number {
//     var dataUnits: DataUnits[] = this.owfCommonService.getDataUnitArray();

//     if (dataUnits && dataUnits.length > 0) {
//       for (let dataUnit of dataUnits) {
//         if (dataUnit.getAbbreviation().toUpperCase() === units.toUpperCase() ||
//           dataUnit.getLongName().toUpperCase() === units.toUpperCase()) {
//           return dataUnit.getOutputPrecision();
//         }
//       }
//     }
//     // Return a default precision of 2.
//     return 2;
//   }

//   /**
//   * Initial function call when the Dialog component is created. Determines whether
//   * a CSV or StateMod file is to be read for graph creation.
//   */
//   // TODO: jpkeahey 2020.07.02 - Might need to change how this is implemented, since Steve said both CSV and StateMod (or other)
//   // files could be in the same popup template file. They might not be mutually exclusive in the future.
//   ngOnInit(): void {
//     this.owfCommonService.setMapConfigPath(this.mapConfigPath);
//     this.owfCommonService.setChartTemplateObject(this.graphTemplateObject);
//     this.owfCommonService.setGraphFilePath(this.graphFilePath);
//     this.owfCommonService.setTSIDLocation(this.TSID_Location);
//     // Set the mainTitleString to be used by the map template file to display as
//     // the TSID location (for now).
//     this.mainTitleString = this.graphTemplateObject['product']['properties'].MainTitleString;

//     if (this.graphFilePath.includes('.csv')) {
//       this.parseCSVFile();
//       this.isTSFile = false;
//     }
//     else if (this.graphFilePath.includes('.stm')) {
//       this.parseTSFile(IM.Path.sMP);
//       this.isTSFile = true;
//     }
//     else if (this.graphFilePath.includes('.dv')) {
//       this.parseTSFile(IM.Path.dVP);
//       this.isTSFile = true;
//     }
//     else {
//       this.badFile = true;
//     }
//   }

//   /**
//   * 
//   */
//   public onClose(): void {
//   }

//   /**
//   * Called once, before the instance is destroyed.
//   */
//   public ngOnDestroy(): void {
//   }

//   /**
//   * Creates and opens the DialogTSTableComponent dialog container showing the time
//   * series table for the selected feature on the Leaflet map.
//   */
//   public openTSTableDialog(): void {
//     // Used for testing large data tables
//     // for (let i = 0; i < 7; i++) {
//     //   this.attributeTable = this.attributeTable.concat(this.attributeTable);
//     // }

//     var windowID = this.TSID_Location + '-dialog-tsTable';
//     if (this.windowManager.windowExists(windowID)) {
//       return;
//     }

//     // Create and use a MatDialogConfig object to pass to the DialogTSGraphComponent
//     // for the graph that will be shown.
//     const dialogConfig = new MatDialogConfig();
//     dialogConfig.data = {
//       attributeTable: this.attributeTable,
//       dateTimeColumnName: this.dateTimeColumnName,
//       downloadFileName: this.downloadFileName ? this.downloadFileName : undefined,
//       featureProperties: this.featureProperties,
//       isTSFile: this.isTSFile,
//       TSArrayRef: this.TSArrayOGResultRef,
//       windowID: windowID,
//       valueColumns: this.valueColumns
//     }
//     const dialogRef: MatDialogRef<DialogTSTableComponent, any> = this.dialog.open(DialogTSTableComponent, {
//       data: dialogConfig,
//       hasBackdrop: false,
//       panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
//       height: "700px",
//       width: "650px",
//       minWidth: "450px",
//       minHeight: "300px",
//       maxHeight: "90vh",
//       maxWidth: "90vw"
//     });
//     this.windowManager.addWindow(windowID, WindowType.TABLE);
//   }

//   /**
//   * Calls Papa Parse to asynchronously read in a CSV file.
//   */
//   private parseCSVFile(): void {

//     var templateObject: Object = this.owfCommonService.getChartTemplateObject();
//     // The array of each data object in the graph config file
//     var dataArray: any[] = templateObject['product']['subProducts'][0]['data'];
//     // This array will hold all results returned from Papa Parse, whether one CSV is used, or multiple
//     var allResults: any[] = [];
//     // The file path string to the TS File
//     var filePath: string;

//     // Go through each data object in the templateObject from the graph config file
//     for (let data of dataArray) {

//       // Depending on whether it's a full TSID used in the graph template file, determine what the file path of the StateMod
//       // file is. (TSIDLocation~/path/to/filename.stm OR TSIDLocation~StateMod~/path/to/filename.stm)
//       if (data.properties.TSID.split('~').length === 2) {
//         filePath = data.properties.TSID.split('~')[1];
//       } else if (data.properties.TSID.split('~').length === 3) {
//         filePath = data.properties.TSID.split('~')[2];
//       }

//       Papa.parse(this.owfCommonService.buildPath(IM.Path.csvPath, [filePath]), {
//         delimiter: ",",
//         download: true,
//         comments: "#",
//         skipEmptyLines: true,
//         header: true,
//         complete: (result: any, file: any) => {
//           allResults.push(result);

//           if (allResults.length === dataArray.length) {
//             this.createCSVConfig(allResults);
//           }
//         }
//       });

//     }

//   }

//   /**
//   * A StateMod file is being processed here. Get the template object to determine if there is more than one time series to
//   * display. So either one StateMod file is read, or a forkJoin needs to be used to read multiple StateMod files asynchronously.
//   * @param TSFile A string defining whether the TSFile to be created is StateMod or DateValue
//   */
//   private parseTSFile(TSFile: IM.Path): void {

//     var templateObject = this.owfCommonService.getChartTemplateObject();
//     // Defines a TSObject so it can be instantiated as the desired object later.
//     var TSObject: any;
//     // Create an array to hold the Observables of each file read.
//     var dataArray: Observable<any>[] = [];
//     // The file path string to the TS File.
//     var filePath: string;
//     // The TSID used by the readTimeSeries function in the converted Java code that utilizes it as a TS identifier.
//     var TSIDLocation: string;

//     switch (TSFile) {
//       case IM.Path.sMP: TSObject = new StateMod_TS(this.owfCommonService); break;
//       case IM.Path.dVP: TSObject = new DateValueTS(this.owfCommonService); break;
//     }


//     for (let data of templateObject['product']['subProducts'][0]['data']) {
//       // Obtain the TSID location for the readTimeSeries method.
//       TSIDLocation = data.properties.TSID.split('~')[0];
//       // If a full TSID used in the graph template file, determine the file path of the StateMod
//       // file. (TSIDLocation~/path/to/filename.stm OR TSIDLocation~StateMod~/path/to/filename.stm)
//       if (data.properties.TSID.split('~').length === 2) {
//         filePath = data.properties.TSID.split('~')[1];
//       } else if (data.properties.TSID.split('~').length === 3) {
//         filePath = data.properties.TSID.split('~')[2];
//       }
//       // Don't subscribe yet!  
//       dataArray.push(TSObject.readTimeSeries(TSIDLocation, this.owfCommonService.buildPath(TSFile, [filePath]),
//         null,
//         null,
//         null,
//         true));
//     }

//     // Now that the array has all the Observables needed, forkJoin and subscribe to them all. Their results will now be
//     // returned as an Array with each index corresponding to the order in which they were pushed onto the array.
//     forkJoin(dataArray).subscribe((resultsArray: TS[]) => {
//       this.TSArrayOGResultRef = resultsArray;
//       this.createTSConfig(resultsArray);
//     });

//   }

}