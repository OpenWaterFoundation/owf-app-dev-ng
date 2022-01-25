import { Component,
          Inject,
          OnInit }          from '@angular/core';
import { MatDialogRef,
          MAT_DIALOG_DATA } from '@angular/material/dialog';

import { forkJoin }         from 'rxjs';

import { WindowManager }    from '@OpenWaterFoundation/common/ui/window-manager';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';
import { StateMod_TS }      from '@OpenWaterFoundation/common/dwr/statemod';
import { DateValueTS,
          DayTS,
          MonthTS,
          TS,
          YearTS }          from '@OpenWaterFoundation/common/ts';
import { DateTime }         from '@OpenWaterFoundation/common/util/time';

// This is the work-around for a conflicting issue with typing when trying to import
// this package through normal means. This older way does not have its own @types
// file, so it won't conflict with TypeScript 4.3.5's now implemented typings.
// More information can be found at
// https://stackoverflow.com/questions/33704714/cant-require-default-export-value-in-babel-6-x?answertab=active#tab-top
// This did not work, as require is a NodeJS function, and the Angular controller
// will be executed in the browser, which doesn't have that built-in function.
// Keeping Heatmap Dialogs statically sized for now.
// const ResizeObserverPolyfill = require('resize-observer-polyfill').default;
// import ResizeObserver       from 'resize-observer-polyfill';

declare const Plotly: any;


@Component({
  selector: 'lib-dialog-heatmap',
  templateUrl: './dialog-heatmap.component.html',
  styleUrls: ['./dialog-heatmap.component.css', '../main-dialog-style.css']
})
export class DialogHeatmapComponent implements OnInit {
  /** Path to the data being displayed in the heatmap. */
  public graphFilePath: string;
  /** The geoLayer object from the map configuration file. */
  public geoLayer: any;
  /** The object read from the JSON file from TSTool. Gives properties and metadata
   * for the graph. */
  public graphTemplateObject: any;
  /** A string representing the button ID of the button clicked to open this dialog. */
  public windowID: string;
  /** The windowManager instance, which creates, maintains, and removes multiple open dialogs in an application. */
  public windowManager: WindowManager = WindowManager.getInstance();

  constructor(public dialogRef: MatDialogRef<DialogHeatmapComponent>,
              @Inject(MAT_DIALOG_DATA) public dataObject: any,
              private owfCommonService: OwfCommonService) {

    this.geoLayer = dataObject.data.geoLayer;
    this.graphTemplateObject = dataObject.data.graphTemplateObject;
    this.graphFilePath = dataObject.data.graphFilePath;
    this.windowID = dataObject.data.windowID;
  }

  /**
   * 
   */
  // TODO: jpkeahey 2021-08-02 - Ths is dealing with only one TS-based class in
  // the TS array. 
  public createHeatmap(resultsArray: TS[]): void {

    var dataPoints: any[] = [];
    var heatmapDataObj = {};
    var yAxisLabels: string[] = [];
    var xAxisLabels: string[] = [];
    var monthData: any[] = [];
    var startDate: DateTime = resultsArray[0].getDate1();
    var endDate: DateTime = resultsArray[0].getDate2();
    // The DateTime iterator for the the while loop.
    var currentDateIter: DateTime = startDate;

    if (resultsArray[0] instanceof MonthTS) {
      var monthIndex = 1;
      xAxisLabels = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
  
      // Heatmap array creation algorithm in a do-while loop. Populates monthData (x),
      // yAxisLabels (y), and dataPoints (z).
      do {
        // Grab the value from the current Time Series that's being looked at.
        var tsData = resultsArray[0].getDataPoint(currentDateIter, null);
        // If the current data point's year hasn't been added to the yAxisLabels yet, do so.
        if (!yAxisLabels.includes(tsData.getDate().getYear().toString())) {
          yAxisLabels.push(tsData.getDate().getYear().toString())
        }
        // Add the single data value to the month array.
        monthData.push(tsData.getDataValue());
        // Once 12 months have been added, push the monthData into the dataPoints
        // array, and reset the monthIndex & monthData.
        if (monthIndex === 12) {
          dataPoints.push(monthData);
          monthIndex = 0;
          monthData = [];
        }
        ++monthIndex;
  
        // Update the interval and labelIndex now that the dataObject has been pushed onto the chartJS_yAxisData array.
        currentDateIter.addInterval(resultsArray[0].getDataIntervalBase(), resultsArray[0].getDataIntervalMult());
  
        // Check if the very last data value in the last year has been reached, add
        // it to the monthData, then add the monthData to the dataPoints.
        if (currentDateIter.getMonth() === endDate.getMonth() && currentDateIter.getYear() === endDate.getYear()) {
          var tsData = resultsArray[0].getDataPoint(currentDateIter, null);
          monthData.push(tsData.getDataValue());
          dataPoints.push(monthData);
        }
      } while (currentDateIter.getMonth() !== endDate.getMonth() || currentDateIter.getYear() !== endDate.getYear())

      heatmapDataObj = {
        x: xAxisLabels,
        y: yAxisLabels,
        z: dataPoints,
        type: 'heatmap',
        hoverongaps: false
      }
    } else if (resultsArray[0] instanceof DayTS) {
      
    }
    // console.log(yAxisLabels);
    // console.log(dataPoints);
    var data = [heatmapDataObj];
    // This code pen uses observers and the Plotly resize function to determine
    // how to resize the graph on parent resize: https://codepen.io/antoinerg/pen/KjXbEo
    const layout = {
      // margin: {
      //   l: 10,
      //   r: 10,
      //   b: 10,
      //   t: 90
      // },
      // This doesn't work.
      // zaxis: {
      //   tickformat: 'r'
      // },
      responsive: false
    };

    const config = {
      scrollZoom: true
    }

    // // const resizeObserver = new ResizeObserver((entries: any) => {
    // const resizeObserver = new ResizeObserverPolyfill((entries: any) => {
    //   for (let entry of entries) {
    //     // Check if the dialog has been closed and the graph div is not currently
    //     // being displayed on the DOM. Return if it has, and don't resize. Resize
    //     // will throw an error if it tries to resize something that doesn't exist.
    //     if (entry.contentRect.height === 0) {
    //       return;
    //     }
    //     Plotly.Plots.resize(entry.target);
    //   }
    // });
    
    Plotly.newPlot('heatmap-div', data, layout, config);//.then(function(gd: any) {
    //   resizeObserver.observe(gd);
    // });
  }

  /**
   * Entry point of the component.
   */
  ngOnInit(): void {
    if (this.graphFilePath.toUpperCase().includes('.STM')) {
      this.parseTSFile(IM.Path.sMP);
    } else if (this.graphFilePath.toUpperCase().includes('.DV')) {
      this.parseTSFile(IM.Path.dVP);
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
   * Use the cdss-lib-common-java converted code to read through StateMod and DateValue
   * files, create a TS object, and add it to an array.
   * @param dataPath The path type describing what kind of file is being processed.
   */
  public parseTSFile(dataPath: IM.Path): void {
    // Defines a TSObject so it can be instantiated as the desired object later.
    var TSObject: any;
    // Create an array to hold the Observables of each file read.
    var dataArray: any[] = [];
    // The file path string to the TS File.
    var filePath: string;
    // The TSID used by the readTimeSeries function in the converted Java code that utilizes it as a TS identifier.
    var TSIDLocation: string;

    switch (dataPath) {
      case IM.Path.sMP: TSObject = new StateMod_TS(this.owfCommonService); break;
      case IM.Path.dVP: TSObject = new DateValueTS(this.owfCommonService); break;
    }

    for (let data of this.graphTemplateObject['product']['subProducts'][0]['data']) {
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
      dataArray.push(TSObject.readTimeSeries(TSIDLocation, this.owfCommonService.buildPath(dataPath, [filePath]),
      null,
      null,
      null,
      true));
    }

    // Now that the array has all the Observables needed, forkJoin and subscribe to them all. Their results will now be
    // returned as an Array with each index corresponding to the order in which they were pushed onto the array.
    forkJoin(dataArray).subscribe((resultsArray: TS[]) => {
      this.createHeatmap(resultsArray);
    });

  }

}
  
// function removeExplicitSize(figure: any) {
//   delete figure.layout.width;
//   delete figure.layout.height;
//   figure.layout.autosize = true;
//   // Turn off responsive (ie. responsive to window resize)
//   figure.config = { responsive: false };
//   return figure;
// }