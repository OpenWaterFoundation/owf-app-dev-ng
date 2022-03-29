import { Injectable } from "@angular/core";

import { DateTime }   from '@OpenWaterFoundation/common/util/time';
import * as IM        from '@OpenWaterFoundation/common/services';

import { add,
          format,
          isEqual,
          parseISO }  from 'date-fns';

/** The DialogService provides helper function to all Dialog Components in the Common
 * library. Any function not directly related to a Dialog Component's core functionality
 * will be present here.
 */
@Injectable({
  providedIn: 'root'
})
export class ChartService {


  constructor() {}

  /************************* D3 DIALOG COMPONENT *************************/


  /************************* DATA TABLE DIALOG COMPONENT *************************/

  /**
   * Determines the smallest zoom bound to create that displays all selected features
   * on the Leaflet map using their provided coordinates.
   * @param lat The latitude to check.
   * @param long The longitude to check.
   * @param bounds The InfoMapper typed Bounds object to be updated if necessary.
   */
  public setZoomBounds(lat: number, long: number, bounds: IM.Bounds): void {

    if (lat > bounds.NEMaxLat) {
      bounds.NEMaxLat = lat;
    }
    if (lat < bounds.SWMinLat) {
      bounds.SWMinLat = lat;
    }
    if (long > bounds.NEMaxLong) {
      bounds.NEMaxLong = long;
    }
    if (long < bounds.SWMinLong) {
      bounds.SWMinLong = long;
    }
  }


  /************************* DATA TABLE LIGHT DIALOG COMPONENT *************************/


  /************************* DOC DIALOG COMPONENT *************************/


  /************************* GALLERY DIALOG COMPONENT *************************/


  /************************* GAPMINDER DIALOG COMPONENT *************************/


  /************************* HEATMAP DIALOG COMPONENT *************************/


  /************************* IMAGE DIALOG COMPONENT *************************/


  /************************* PROPERTIES DIALOG COMPONENT *************************/

  /**
   * @returns A string describing the type of array the Raster is using, to be displayed
   * under band properties.
   * @param arr The Raster array reference to determine what data types it is using.
   */
  public getInstanceOf(arr: any[]): string {
    if (arr instanceof Float32Array) {
      return 'Float32Array';
    } else if (arr instanceof Float64Array) {
      return 'Float64Array';
    } else if (arr instanceof Int8Array) {
      return 'Int8Array';
    } else if (arr instanceof Int16Array) {
      return 'Int16Array';
    } else if (arr instanceof Int32Array) {
      return 'Int32Array';
    } else {
      return 'Unknown';
    }
  }


  /************************* TEXT DIALOG COMPONENT *************************/


  /************************* TSGRAPH DIALOG COMPONENT ************************/

  /**
   * This basic function returns a datePrecision number to be used when creating
   * attribute table cell value precision.
   * @param TSID The entire TSID value from the graph config json file.
   */
  public determineDatePrecision(TSID: string): number {
    if (TSID.toUpperCase().includes('YEAR') || TSID.toUpperCase().includes('MONTH') ||
        TSID.toUpperCase().includes('WEEK') || TSID.toUpperCase().includes('DAY')) {
          return 100;
    } else return 10;
  }

  /**
   * Formats the `TSID` data object property to be displayed as the graph's legend
   * label. This is only shown if the `TSAlias` property is an empty string.
   * @param TSID The TSID string from the graph template object JSON file.
   */
  public formatLegendLabel(TSID: string): string {
    var legendLabel: string;
    // Determine what the legend label will be for both this time series graph and
    // the data table, depending on what the full TSID is.
    if (TSID.split('~').length === 2) {
      legendLabel = TSID.split("~")[1];
    } else if (TSID.split('~').length === 3) {
      legendLabel = TSID.split("~")[2];
    }
    // Format the file name by removing any preceding file paths and extensions.
    return legendLabel.substring(legendLabel.lastIndexOf('/') + 1, legendLabel.lastIndexOf('.'));
  }

  /**
   * Returns an array of dates between the start and end dates, either per day or
   * month. Skeleton code obtained from https://gist.github.com/miguelmota/7905510
   * @param startDate Date to be the first index in the returned array of dates.
   * @param endDate Date to be the last index in the returned array of dates.
   * @param interval String describing the interval of how far apart each date should be.
   */
  public getDates(startDate: any, endDate: any, interval: string): any {

    var graphDates: any[] = [];
    var dataTableDates: any[] = [];
    var currentDate: any;

    switch (interval) {
      case 'days':
        currentDate = startDate;

        let addDays = function(days: any) {
          let date = new Date(this.valueOf());
          date.setDate(date.getDate() + days);
          return date;
        };
        // Iterate over each date from start to end and push them to the dates array
        // that will be returned.
        while (currentDate <= endDate) {
          // Push an ISO 8601 formatted version of the date into the x axis array
          // that will be used for the data table.
          dataTableDates.push(currentDate.format('YYYY-MM-DD'));
          graphDates.push(currentDate);
          currentDate = addDays.call(currentDate, 1);
        }

        return { graphDates: graphDates, dataTableDates: dataTableDates };

      case 'months':
        // Only have to parse the string once here using ISO formatting.
        currentDate = new Date(parseISO(startDate));
        var stopDate = new Date(parseISO(endDate));
        // Iterate over each date from start to end and push them to the dates array
        // that will be returned.
        while (!isEqual(currentDate, stopDate)) {
          // Push an ISO 8601 formatted version of the date into the x axis array
          // that will be used for the data table.
          dataTableDates.push(format(currentDate, 'yyyy-MM'));
          graphDates.push(format(currentDate, 'MMM yyyy'));
          currentDate = add(currentDate, { months: 1 });
        }
        // Finish adding the last month between the dates.
        if (isEqual(currentDate, stopDate)) {
          dataTableDates.push(format(currentDate, 'yyyy-MM'));
          graphDates.push(format(currentDate, 'MMM yyyy'));
        }

        return { graphDates: graphDates, dataTableDates: dataTableDates };

      case 'years':        
        // Only have to parse the string once here using ISO formatting.
        currentDate = new Date(parseISO(startDate.toString()));
        var stopDate = new Date(parseISO(endDate.toString()));
        // Iterate over each date from start to end and push them to the dates
        // array that will be returned.
        while (!isEqual(currentDate, stopDate)) {
          // Push an ISO 8601 formatted version of the date into the x axis array
          // that will be used for the data table.
          dataTableDates.push(format(currentDate, 'yyyy'));
          graphDates.push(format(currentDate, 'yyyy'));
          currentDate = add(currentDate, { years: 1 });
        }
        // Finish adding the last year between the dates.
        if (isEqual(currentDate, stopDate)) {
          dataTableDates.push(format(currentDate, 'yyyy'));
          graphDates.push(format(currentDate, 'yyyy'));
        }

        return { graphDates: graphDates, dataTableDates: dataTableDates };      
    } 
  }

  /**
   * @returns An array of the data values to display on the y Axis of the time series
   * graph being created.
   * @param timeSeries The current time series to use to extract the y axis data
   * for the graph.
   * @param x_axisLabels The x Axis labels created for the graph.
   * @param type The interval type of the time series ('years', 'months', etc.).
   */
  public setAxisObject(timeSeries: any, x_axisLabels: string[], type: string): any {

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
   * @returns An object with the X and Y offsets for positioning the legend in a
   * Plotly graph.
   * @param legendPosition A string representing the LeftYAxisLegendPosition property
   * from the TSTool graph template file.
   * @param graphCount An optional number of the amount of 'traces' or graphs on
   * showing on the graph itself.
   */
  public setPlotlyLegendPosition(legendPosition: string, graphCount?: number): any {

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
     * For each graph in the table, offset the Y axis of the legend by 0.05, so
     * that whether there's 1 or 6 graphs, the legend won't cover the graph or X axis.
     */
    function offsetY(): void {
      for (let i = 0; i < graphCount; i++) {
        position.y -= 0.05;
      }
    }
  }

  /**
   * Verifies that a potential property string provided to a graph config object
   * will work correctly with the JavaScript Plotly API.
   * @param property The variable obtained from the graph config file trying to
   * be implemented as a Plotly property.
   * @param type The type of property being scrutinized.
   */
  public verifyPlotlyProp(property: string, type: IM.GraphProp): string {

    switch(type) {
      // CHART MODE.
      case IM.GraphProp.cm:
        if (property.toUpperCase() === 'LINE') { return 'lines'; }
        else if (property.toUpperCase() === 'POINT') { return 'markers' }
        else {
          console.warn('Unknown property "' + property.toUpperCase() +
          '" - Not Line or Point. Using default Graph Type Line');
          return 'lines';
        }
      // CHART TYPE.
      case IM.GraphProp.ct:
        if (property.toUpperCase() === 'LINE' || property.toUpperCase() === 'POINT')
          return 'scatter';
        else return 'scatter';
      // BACKGROUND COLOR.
      case IM.GraphProp.bc:
        // Convert C / Java '0x' notation into hex hash '#' notation.
        if (property.startsWith('0x')) {
          return property.replace('0x', '#');
        } else if (property !== '') {
          return property;
        } else {
          console.warn('No graph property "Color" detected. Using the default graph color black');
          return 'black';
        }
    }
  }

  /**
   * Left pads a number by a given amount of places, starting at the perceived decimal
   * point e.g. num = 1, places = 1, returns '1' & num = 1, places = 2, returns '01'.
   * @param num The number that needs padding.
   * @param places The amount the padding will go out to the left.
   */
  public zeroPad(num: number, places: number) {    
    return String(num).padStart(places, '0');
  }

  /************************* TSTABLE DIALOG COMPONENT *************************/


  
}