import { Component,
          Input,
          OnDestroy, 
          OnInit}           from '@angular/core';

import { BehaviorSubject,
          forkJoin,
          Observable, 
          Subscription }    from 'rxjs';

import structuredClone      from '@ungap/structured-clone';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';
import { MonthTS,
          TS,
          YearTS }          from '@OpenWaterFoundation/common/ts';
import { MapUtil }          from '@OpenWaterFoundation/common/leaflet';
import { DatastoreManager } from '@OpenWaterFoundation/common/util/datastore';
import { ChartService }     from './chart.service';
import { DashboardService } from '../../dashboard.service';
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
  attributeTable: any[] = [];
  /** The object with the necessary chart data for displaying a Plotly chart. */
  @Input() chartWidget: IM.ChartWidget;
  /**
   * 
   */
  private dataLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);
   /**
    * 
    */
  dataLoading$ = this.dataLoadingSubject.asObservable();
  /** A string containing the name to be passed to the TSTableComponent's first
  * column name: DATE or DATE / TIME. */
  dateTimeColumnName: string;
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
  /** A string representing the documentation retrieved from the txt, md, or html
  * file to be displayed for a layer. */
  mainTitleString: string;
  /** The array of TS objects that was originally read in using the StateMod or DateValue
  * Java converted code. Used as a reference in the dialog-tstable component for
  * downloading to the user's local machine. */
  TSArrayOGResultRef: TS[];
  /** The string representing the TSID before the first tilde (~) in the graph template
  * object. Used to help create a unique graph ID. */
  TSIDLocation: string;
  /**
   * 
   */
  private updateResultsSub$: Subscription;
  /** An array containing the value header names after the initial DATE / TIME
  * header. To be passed to dialog-tstable for downloading files. */
  valueColumns: string[] = [];


  /**
  * @constructor for the DialogTSGraph Component.
  * @param commonService A reference to the top level service OwfCommonService.
  */
  constructor(private commonService: OwfCommonService,
    private chartService: ChartService,
    private dashboardService: DashboardService) { }


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
      this.dashboardService.setChartError = true;
      return;
    }

    // Determine if the Chart widget has a SelectEvent. If not, the initialization
    // of the Chart widget can be performed.
    if (this.chartService.hasSelectEvent(this.chartWidget) === false) {
      this.initChartVariables();
    }
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

    var start = timeSeries.getDate1().getYear() + "-" +
    this.chartService.zeroPad(timeSeries.getDate1().getMonth(), 2);

    var end = timeSeries.getDate2().getYear() + "-" +
    this.chartService.zeroPad(timeSeries.getDate2().getMonth(), 2);

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
   * Initializes this components class variables and performs other necessary actions
   * to set up and display a chart.
   */
  private initChartVariables(): void {

    this.initialResultsSub$ = this.commonService.getJSONData(
      this.commonService.buildPath(IM.Path.dbP, [this.chartWidget.graphTemplatePath])
    ).subscribe({

      next: (graphTemplate: IM.GraphTemplate) => {

        this.graphTemplatePrime = graphTemplate;
        // Create a clone of the original graph template file.
        this.graphTemplate = structuredClone(this.graphTemplatePrime);
        
        // Set the class variable TSIDLocation to the first dataGraph object from the
        // graphTemplate object. This is used as a unique identifier for the Plotly
        // graph <div> id attribute.
        this.TSIDLocation = this.commonService.parseTSID(
          this.graphTemplate.product.subProducts[0].data[0].properties.TSID).location;
  
        // Set the mainTitleString to be used by the map template file to display as
        // the TSID location (for now).
        this.mainTitleString = this.graphTemplate.product.properties.MainTitleString;

        this.toggleDataLoading = false;
  
        this.obtainAndCreateAllGraphs();
      }
    });
  }

  /**
  * Initial function call when the Dialog component is created. Determines whether
  * a CSV or StateMod file is to be read for graph creation.
  */
  ngOnInit(): void {

    this.isChartError$ = this.dashboardService.isChartError;

    this.checkWidgetObject();

    // TODO jpkeahey 2022-04-27: This might need to be in a for loop for multiple
    // Event objects in the eventHandlers.
    this.dashboardService.getWidgetEvent(this.chartWidget).subscribe((selectEvent: IM.SelectEvent) => {

      // Check if the initial selectEvent was passed.
      if (selectEvent === null) {
        return;
      }

      // If graphTemplatePrime hasn't been set yet, read it in and set it here.
      if (!this.graphTemplatePrime) {
        this.updateResultsSub$ = this.commonService.getJSONData(
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
  * Called once, before the instance is destroyed. Unsubscribes from all defined
  * subscriptions to prevent memory leaks.
  */
  ngOnDestroy(): void {
    this.allResultsSub$.unsubscribe();
    
    if (this.initialResultsSub$) {
      this.initialResultsSub$.unsubscribe()
    }
    if (this.updateResultsSub$) {
      this.updateResultsSub$.unsubscribe();
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

      if (chartError === true) {
        this.dashboardService.setChartError = true;
        return;
      } else {
        this.dashboardService.setChartError = false;
      }

      this.createPlotlyGraph(allGraphObjects);
    });
  }

  /**
   * 
   */
   private set toggleDataLoading(loaded: boolean) {
    this.dataLoadingSubject.next(loaded);
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
    MapUtil.replaceProperties(this.graphTemplate, this.featureProperties);

    // Set the class variable TSIDLocation to the first dataGraph object from the
    // graphTemplate object. This is used as a unique identifier for the Plotly
    // graph <div> id attribute.
    this.TSIDLocation = this.commonService.parseTSID(
      this.graphTemplate.product.subProducts[0].data[0].properties.TSID
    ).location;

    // Set the mainTitleString to be used by the map template file to display as
    // the TSID location (for now).
    this.mainTitleString = this.graphTemplate.product.properties.MainTitleString;

    this.toggleDataLoading = false;

    this.obtainAndCreateAllGraphs();
  }

}
