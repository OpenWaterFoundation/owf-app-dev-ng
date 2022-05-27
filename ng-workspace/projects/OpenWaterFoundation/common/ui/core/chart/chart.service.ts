import { Injectable }  from "@angular/core";

import { DateTime }    from '@OpenWaterFoundation/common/util/time';
import * as IM         from '@OpenWaterFoundation/common/services';

import { add,
          format,
          isEqual,
          parseISO }       from 'date-fns';
import { DayTS,
          MonthTS,
          TS,
          YearTS}          from "@OpenWaterFoundation/common/ts";
import { BehaviorSubject,
          Observable }     from "rxjs";

/** The DialogService provides helper function to all Dialog Components in the Common
 * library. Any function not directly related to a Dialog Component's core functionality
 * will be present here.
 */
@Injectable({
  providedIn: 'root'
})
export class ChartService {

  /** Set to true if any errors occur in the Chart Widget. */
  private chartError: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() {}


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
  public getDates(startDate: any, endDate: any, interval: string): string[] {

    const DAYFORMAT = 'yyyy-MM-dd',
    MONTHFORMAT = 'yyyy-MM',
    YEARFORMAT = 'yyyy';

    var allDates: string[] = [];
    var currentDate: Date;
    var stopDate: Date;

    switch (interval) {
      case 'days':
        currentDate = new Date(parseISO(startDate));
        stopDate = new Date(parseISO(endDate));

        // Iterate over each date from start to end and push them to the dates array
        // that will be returned.
        while (!isEqual(currentDate, stopDate)) {
          // Push an ISO 8601 formatted version of the date into the x axis array
          // that will be used for the data table.
          allDates.push(format(currentDate, DAYFORMAT));
          currentDate = add(currentDate, { days: 1 });
        }
        // Finish adding the last month between the dates.
        if (isEqual(currentDate, stopDate)) {
          allDates.push(format(currentDate, DAYFORMAT));
        }

        return allDates;

      case 'months':
        // Only have to parse the string once here using ISO formatting.
        currentDate = new Date(parseISO(startDate));
        stopDate = new Date(parseISO(endDate));
        // Iterate over each date from start to end and push them to the dates array
        // that will be returned.
        while (!isEqual(currentDate, stopDate)) {
          // Push an ISO 8601 formatted version of the date into the x axis array
          // that will be used for the data table.
          allDates.push(format(currentDate, MONTHFORMAT));
          currentDate = add(currentDate, { months: 1 });
        }
        // Finish adding the last month between the dates.
        if (isEqual(currentDate, stopDate)) {
          allDates.push(format(currentDate, MONTHFORMAT));
        }

        return allDates;

      case 'years':        
        // Only have to parse the string once here using ISO formatting.
        currentDate = new Date(parseISO(startDate.toString()));
        stopDate = new Date(parseISO(endDate.toString()));
        // Iterate over each date from start to end and push them to the dates
        // array that will be returned.
        while (!isEqual(currentDate, stopDate)) {
          // Push an ISO 8601 formatted version of the date into the x axis array
          // that will be used for the data table.
          allDates.push(format(currentDate, YEARFORMAT));
          currentDate = add(currentDate, { years: 1 });
        }
        // Finish adding the last year between the dates.
        if (isEqual(currentDate, stopDate)) {
          allDates.push(format(currentDate, YEARFORMAT));
        }

        return allDates;      
    }
  }

  /**
   * Determines whether a widget's eventHandler object wants to listen to a SelectEvent.
   * @param widget The widget object whose eventHandlers are checked.
   * @returns True if the widget eventHandler object's eventType is SelectEvent,
   * and false otherwise.
   */
  hasSelectEvent(widget: IM.DashboardWidget): boolean {

    if (!widget.eventHandlers) {
      return false;
    }
    
    for (let widgetEvent of widget.eventHandlers) {
      if (widgetEvent.eventType.toLowerCase() === 'selectevent') {
        return true;
      }
    }
    return false;
  }

  /**
   * @returns An array of the data values to display on the y Axis of the time series
   * graph being created.
   * @param timeSeries The current time series to use to extract the y axis data
   * for the graph.
   */
  public setYAxisData(timeSeries: TS): any {

    var yAxisData: number[] = [];

    let startDate: DateTime = timeSeries.getDate1();
    let endDate: DateTime = timeSeries.getDate2();
    // The DateTime iterator for the the while loop.
    let iter: DateTime = startDate;
    // The index of the x_axisLabel array to push into the chartJS_yAxisData as the x property.
    var labelIndex = 0;      
    
    do {
      // Grab the value from the current Time Series that's being looked at.
      let value = timeSeries.getDataValue(iter);

      // If it's missing, replace value with NaN and push onto the array. If not just push the value onto the array.
      if (timeSeries.isDataMissing(value)) {
        yAxisData.push(NaN);
      } else {
        yAxisData.push(value);
      }
      // Update the interval and labelIndex now that the dataObject has been pushed onto the chartJS_yAxisData array.
      iter.addInterval(timeSeries.getDataIntervalBase(), timeSeries.getDataIntervalMult());
      labelIndex++;

      // 
      if (timeSeries instanceof DayTS) {
        if (iter.getDay() === endDate.getDay() && iter.getMonth() === endDate.getMonth() &&
        iter.getYear() === endDate.getYear()) {

          var lastValue = timeSeries.getDataValue(iter);
  
          if (timeSeries.isDataMissing(lastValue)) {
            yAxisData.push(NaN);
          } else {
            yAxisData.push(lastValue);
          }
        }
      }
      // If the month and year are equal, the end has been reached. This will only happen once.
      else if (timeSeries instanceof MonthTS) {
        if (iter.getMonth() === endDate.getMonth() && iter.getYear() === endDate.getYear()) {
          var lastValue = timeSeries.getDataValue(iter);
  
          if (timeSeries.isDataMissing(lastValue)) {
            yAxisData.push(NaN);
          } else {
            yAxisData.push(lastValue);
          }
        }
      }
      else if (timeSeries instanceof YearTS) {
        if (iter.getYear() === endDate.getYear()) {
          var lastValue = timeSeries.getDataValue(iter);
  
          if (timeSeries.isDataMissing(lastValue)) {
            yAxisData.push(NaN);
          } else {
            yAxisData.push(lastValue);
          }
        }
      }

    } while (
      iter.getDay() !== endDate.getDay() ||
      iter.getMonth() !== endDate.getMonth() ||
      iter.getYear() !== endDate.getYear()
      )

    return yAxisData;
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
   * be implemented as a Plotly property. Will be passed in as all lower case.
   * @param type The type of property being scrutinized.
   */
  public verifyPlotlyProp(property: string, type: IM.GraphProp): string {

    switch(type) {
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
      // CHART MODE.
      case IM.GraphProp.cm:

        var isScatterGraphType = (
          property === 'line' ||
          property === 'area' ||
          property === 'areastacked'
        );

        if (isScatterGraphType) {
          return 'lines';
        }
        else if (property.toUpperCase() === 'POINT') {
          return 'markers'
        }
        else {
          console.warn('Unknown property "' + property.toUpperCase() +
          '" - Not Line or Point. Using default Graph Type Line');
          return 'lines';
        }
      // CHART TYPE.
      case IM.GraphProp.ct:

        var isScatterGraphType = (
          property === 'line' ||
          property === 'point' ||
          property === 'area'
        );

        if (isScatterGraphType) {
          return 'scatter';
        } else {
          return 'scatter';
        }
      case IM.GraphProp.lw:
        return property ? property : '1.5';
      // FILL TYPE.
      case IM.GraphProp.fl:
        return (property === 'area') ? 'tozeroy' : undefined;
      case IM.GraphProp.sk:
        return (property === 'areastacked') ? 'one' : undefined;
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