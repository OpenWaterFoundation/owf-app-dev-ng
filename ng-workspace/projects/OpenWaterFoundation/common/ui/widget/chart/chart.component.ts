import { Component,
          Input,
          OnDestroy, 
          OnInit}                 from '@angular/core';
import { MatDialog,
          MatDialogConfig,
          MatDialogRef }          from '@angular/material/dialog';

import { catchError,
          forkJoin,
          Observable, 
          of, 
          Subscription }          from 'rxjs';

import { OwfCommonService }       from '@OpenWaterFoundation/common/services';
import * as IM                    from '@OpenWaterFoundation/common/services';

import { DialogTSTableComponent } from '@OpenWaterFoundation/common/ui/dialog';

import { MonthTS,
          TS,
          YearTS }                from '@OpenWaterFoundation/common/ts';
import { DataUnits }              from '@OpenWaterFoundation/common/util/io';
import { WindowManager,
          WindowType }            from '@OpenWaterFoundation/common/ui/window-manager';
import { MapUtil }                from '@OpenWaterFoundation/common/leaflet';
import { DatastoreManager }       from '@OpenWaterFoundation/common/util/datastore';
import { ChartService }           from './chart.service';
// I believe that if this type of 'import' is used, the package needs to be added
// to the angular.json scripts array.
declare var Plotly: any;

@Component({
  selector: 'widget-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit, OnDestroy {

  /** Subscription to be unsubscribed to at component destruction to prevent memory
   * leaks.*/
  private allResultsSub$: Subscription;
  /** The array of objects to pass to the tstable component for data table creation. */
  public attributeTable: any[] = [];
  /** This variable lets the template file know if neither a CSV, DateValue, or
  * StateMod file is given. */
  public badFile = false;
  /** The object with the necessary chart data for displaying a Plotly chart. */
  @Input() chartData: any;
  /** A string containing the name to be passed to the TSTableComponent's first
  * column name: DATE or DATE / TIME. */
  public dateTimeColumnName: string;
  /**
   * 
   */
  private dsManager: DatastoreManager = DatastoreManager.getInstance();
  /** The graph template object retrieved from the popup configuration file property
  * resourcePath. */
  public graphTemplate: IM.GraphTemplate;
  /** The name of the download file for the dialog-tstable component. */
  private downloadFileName: string;
  /** The object containing all of the layer's feature properties. */
  public featureProperties: any;
  /** Set to false so the Material progress bar never shows up.*/
  public isLoading = false;
  /** Boolean for helping dialog-tstable component determine what kind of file needs
  * downloading. */
  public isTSFile: boolean;
  /** A string representing the documentation retrieved from the txt, md, or html
  * file to be displayed for a layer. */
  public mainTitleString: string;

  public totalGraphsToMake: number;
  /** The array of TS objects that was originally read in using the StateMod or DateValue
  * Java converted code. Used as a reference in the dialog-tstable component for
  * downloading to the user's local machine. */
  public TSArrayOGResultRef: TS[];
  /** The string representing the TSID before the first tilde (~) in the graph template
  * object. Used to help create a unique graph ID. */
  public TSIDLocation: string;

  public TSOrder: number[] = [];
  /** An array containing the value header names after the initial DATE / TIME
  * header. To be passed to dialog-tstable for downloading files. */
  public valueColumns: string[] = [];
  /** The windowManager instance, which creates, maintains, and removes multiple
  * open dialogs in an application. */
  public windowManager: WindowManager = WindowManager.getInstance();


  /**
  * @constructor for the DialogTSGraph Component.
  * @param owfCommonService A reference to the top level service OwfCommonService.
  * @param dialog 
  */
  constructor(private owfCommonService: OwfCommonService,
    private chartService: ChartService,
    private dialog: MatDialog) { }


  /**
  * Creates the attributeTable array of objects to be passed to the dialog-tstable
  * component for displaying a data table.
  * @param x_axisLabels The array of x-axis labels from the graph being created
  * to show in the data table.
  * @param axisObject The axisObject contains either the chartJS or plotly created
  * data array.
  * @param units The units being used on the graph to be shown as a column.
  */
  private addToAttributeTable(x_axisLabels: string[], axisObject: any, TSAlias: string,
    units: string, TSIndex: number, datePrecision?: number): void {
    // Retrieve the output precision from the DataUnits array if it exists, and if not default to 2
    var outputPrecision = this.determineOutputPrecision(units);
    // For the first column header name, have it be DATE if the datePrecision is week, month or year,
    // or DATE / TIME if day, hour, minute, etc..
    var column1Name = (datePrecision > 30) ? 'DATE' : 'DATE / TIME';
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
  * Takes a Papa Parse result object and creates a PopulateGraph instance
  * for the Plotly graphing package API.
  * @param delimitedData The results object returned asynchronously from Papa Parse.
  * Contains at least one result array with its index in the graphTemplate data
  * array.
  */
   private makeDelimitedPlotlyObject(delimitedData: any, graphData: IM.GraphData): IM.PopulateGraph {

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
    let x_axis = Object.keys(delimitedData.data[0])[0];
    let y_axis = Object.keys(delimitedData.data[0])[1];

    // Populate the arrays needed for the X & Y axes.
    var x_axisLabels: string[] = [];
    var y_axisData: number[] = [];
    for (let resultObj of delimitedData.data) {
      x_axisLabels.push(resultObj[x_axis]);
      y_axisData.push(parseFloat(resultObj[y_axis]));
    }
    // Populate various other chart properties. They will be checked for validity
    // in createPlotlyGraph().
    var graphType: string = graphData.properties.GraphType.toLowerCase();
    var backgroundColor: string = graphData.properties.Color;
    var TSAlias: string = graphData.properties.TSAlias;
    var units: string = chartConfigProp.LeftYAxisUnits;

    var datePrecision: number = this.chartService.determineDatePrecision(graphData.properties.TSID);
    var legendLabel = this.chartService.formatLegendLabel(graphData.properties.TSID);

    // this.addToAttributeTable(x_axisLabels, { csv_y_axisData: y_axisData },
    //   (TSAlias !== '') ? TSAlias : legendLabel, units, i, datePrecision);

    // Return the PopulateGraph instance that will be passed to create the Chart.js graph.
    return {
      chartMode: this.chartService.verifyPlotlyProp(graphType, IM.GraphProp.cm),
      chartType: this.chartService.verifyPlotlyProp(graphType, IM.GraphProp.ct),
      dataLabels: x_axisLabels,
      datasetData: y_axisData,
      datasetBackgroundColor: backgroundColor,
      graphFileType: 'csv',
      isCSV: true,
      legendLabel: (TSAlias !== '') ? TSAlias : legendLabel,
      legendPosition: legendPosition,
      yAxesLabelString: templateYAxisTitle
    }
  }

  /**
  * Sets up properties and creates the configuration object to be used by the Chart.js
  * API.
  * @param timeSeries The array of all Time Series objects retrieved asynchronously
  * from the StateMod file.
  */
   private makeTSPlotlyObject(timeSeries: TS, graphData: IM.GraphData): IM.PopulateGraph {

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

    var XAxisLabels: string[];
    var type = '';

    if (timeSeries instanceof MonthTS) {
      type = 'months';
      XAxisLabels = this.chartService.getDates(
        timeSeries.getDate1().getYear() + "-" + this.chartService.zeroPad(timeSeries.getDate1().getMonth(), 2),
        timeSeries.getDate2().getYear() + "-" + this.chartService.zeroPad(timeSeries.getDate2().getMonth(), 2),
        type);
    } else if (timeSeries instanceof YearTS) {
      type = 'years';
      XAxisLabels = this.chartService.getDates(
        timeSeries.getDate1().getYear(),
        timeSeries.getDate2().getYear(),
        type);
    }

    var start = timeSeries.getDate1().getYear() + "-" + this.chartService.zeroPad(timeSeries.getDate1().getMonth(), 2);
    var end = timeSeries.getDate2().getYear() + "-" + this.chartService.zeroPad(timeSeries.getDate2().getMonth(), 2);

    var axisObject = this.chartService.setAxisObject(timeSeries, XAxisLabels, type);
    // Populate the rest of the properties from the graph config file. This uses
    // the more granular graphType for each time series.
    var chartType: string = graphData.properties.GraphType.toLowerCase();
    var backgroundColor: string = graphData.properties.Color;
    var TSAlias: string = graphData.properties.TSAlias;
    var units: string = timeSeries.getDataUnits();
    var datePrecision = timeSeries.getDataIntervalBase();

    var legendLabel: string;
    if (graphData.properties.LegendFormat === "Auto") {
      legendLabel = timeSeries.formatLegend('%A');
    } else {
      legendLabel = timeSeries.formatLegend(graphData.properties.LegendFormat);
    }

    // this.addToAttributeTable(XAxisLabels, axisObject, (TSAlias !== '') ? TSAlias : legendLabel,
    //   units, i, datePrecision);

    // Return the PopulateGraph instance that will be passed to create the Chart.js graph.
    return {
      chartMode: this.chartService.verifyPlotlyProp(chartType, IM.GraphProp.cm),
      chartType: this.chartService.verifyPlotlyProp(chartType, IM.GraphProp.ct),
      dateType: type,
      datasetData: axisObject.chartJS_yAxisData,
      plotlyDatasetData: axisObject.plotly_yAxisData,
      plotly_xAxisLabels: XAxisLabels,
      datasetBackgroundColor: this.chartService.verifyPlotlyProp(backgroundColor, IM.GraphProp.bc),
      graphFileType: 'TS',
      legendLabel: (TSAlias !== '') ? TSAlias : legendLabel,
      legendPosition: legendPosition,
      startDate: start,
      endDate: end,
      yAxesLabelString: templateYAxisTitle
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
          width: 1.5
        }
        // Connects between ALL gaps
        // data.connectgaps = true;
      }
      data.type = graphConfig.chartType;
      data.x = graphConfig.isCSV ? graphConfig.dataLabels : graphConfig.plotly_xAxisLabels;
      data.y = graphConfig.isCSV ? graphConfig.datasetData : graphConfig.plotlyDatasetData;

      colorwayArray.push(graphConfig.datasetBackgroundColor);
      finalData.push(data);
    }
    // Builds the layout object that will be given as the third argument to the
    // Plotly.plot() function. Creates the graph layout such as graph height and
    // width, legend and axes options, etc.
    var layout = {
      title: {
        text: this.mainTitleString
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
    var dataUnits: DataUnits[] = this.owfCommonService.getDataUnitArray();

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

  private handleError<T> (path: string, type?: string, id?: string, result?: T) {
    return (error: any): Observable<T> => {
      return of(result as T);
    }}

  /**
   * Initializes this components class variables and performs other necessary actions
   * to set up and display a chart.
   */
  private initChartVariables(): void {

    this.featureProperties = this.chartData.featureProperties;
    this.downloadFileName = this.chartData.downloadFileName ? this.chartData.downloadFileName : undefined;
    this.graphTemplate = this.chartData.graphTemplate;
    // Replace the ${properties} in the graphTemplate object from the graph
    // template file.
    MapUtil.replaceProperties(this.graphTemplate, this.featureProperties);
    // Set the class variable TSIDLocation to the first dataGraph object from the
    // graphTemplate object. This is used as a unique identifier for the Plotly
    // graph <div> id attribute.
    this.TSIDLocation = this.owfCommonService.parseTSID(
      this.graphTemplate.product.subProducts[0].data[0].properties.TSID).location;

    // Set the mainTitleString to be used by the map template file to display as
    // the TSID location (for now).
    this.mainTitleString = this.graphTemplate.product.properties.MainTitleString;

    // Reset the BehaviorSubject array with PopulateGraph objects. Very important.
    this.chartService.resetPopulateGraph();
  }

  /**
  * Initial function call when the Dialog component is created. Determines whether
  * a CSV or StateMod file is to be read for graph creation.
  */
  ngOnInit(): void {

    this.initChartVariables();
    this.obtainAndCreateAllGraphs();
  }

  /**
  * Called once, before the instance is destroyed. Unsubscribes from all subscriptions
  * to prevent memory leaks.
  */
  public ngOnDestroy(): void {
    this.allResultsSub$.unsubscribe();
  }

  /**
   * Use the DatastoreManager to obtain all data necessary to display on a Plotly
   * chart.
   */
  private obtainAndCreateAllGraphs(): void {

    var allDataObservables: Observable<any>[] = [];
    var allGraphObjects: IM.PopulateGraph[] = [];
    // The array of all graphData objects in the graph template file.
    const graphData = this.graphTemplate.product.subProducts[0].data;

    // Iterate over all graphData objects in the graph template file.
    graphData.forEach((graphData) => {
      var dataObservable = this.dsManager.getDatastoreData(this.owfCommonService, graphData.properties.TSID);
      allDataObservables.push(dataObservable);
    });

    this.allResultsSub$ = forkJoin(allDataObservables).subscribe((allResults: any[]) => {

      allResults.forEach((result: any, i: number) => {

        // Check for any errors.
        if (result.error) {
          console.error('This graph object has errored and will not be shown on the Chart.');
          return;
        }

        var TSID = this.owfCommonService.parseTSID(graphData[i].properties.TSID);
        var datastore = this.dsManager.getDatastore(TSID.datastore);

        switch(datastore.type) {
          case IM.DatastoreType.delimited:
            allGraphObjects.push(this.makeDelimitedPlotlyObject(result, graphData[i]));
            break;
          case IM.DatastoreType.dateValue:
          case IM.DatastoreType.stateMod:
            allGraphObjects.push(this.makeTSPlotlyObject(result, graphData[i]));
            break;
        }
      });

      this.createPlotlyGraph(allGraphObjects);
    });
  }

  /**
  * Creates and opens the DialogTSTableComponent dialog container showing the time
  * series table for the selected feature on the Leaflet map.
  */
  public openTSTableDialog(): void {
    // Used for testing large data tables
    // for (let i = 0; i < 7; i++) {
    //   this.attributeTable = this.attributeTable.concat(this.attributeTable);
    // }

    var windowID = '-dialog-tsTable';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    // Create and use a MatDialogConfig object to pass to the DialogTSGraphComponent
    // for the graph that will be shown.
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

}
