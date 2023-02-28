import { Component,
          Inject,
          OnDestroy,
          OnInit }          from '@angular/core';
import { MatDialogRef,
          MAT_DIALOG_DATA } from '@angular/material/dialog';

import { forkJoin,
          Observable, 
          Subscription }    from 'rxjs';

import { WindowManager }    from '@OpenWaterFoundation/common/ui/window-manager';

import { faXmark }          from '@fortawesome/free-solid-svg-icons';

import { GraphTemplate, OwfCommonService, Path } from '@OpenWaterFoundation/common/services';
import { StateModTS }       from '@OpenWaterFoundation/common/dwr/statemod';
import { DateValueTS,
          DayTS,
          MonthTS,
          TS }              from '@OpenWaterFoundation/common/ts';
import { DateTime }         from '@OpenWaterFoundation/common/util/time';

declare const Plotly: any;


@Component({
  selector: 'lib-dialog-heatmap',
  templateUrl: './dialog-heatmap.component.html',
  styleUrls: ['./dialog-heatmap.component.css', '../main-dialog-style.css']
})
export class DialogHeatmapComponent implements OnInit, OnDestroy {

  /** Subscription to be unsubscribed to at component destruction to prevent memory
   * leaks.*/
  private forkJoinSub: Subscription;
  /** Path to the data being displayed in the heatmap. */
  graphFilePath: string;
  /** The geoLayer object from the map configuration file. */
  geoLayer: any;
  /** The object read from the JSON file from TSTool. Gives properties and metadata
   * for the graph. */
  graphTemplate: GraphTemplate;
  /** A string representing the button ID of the button clicked to open this dialog. */
  windowId: string;
  /** The windowManager instance, which creates, maintains, and removes multiple
   * open dialogs in an application. */
  windowManager: WindowManager = WindowManager.getInstance();
  /** All used icons in the DialogHeatmapComponent. */
  faXmark = faXmark;

  /**
   * 
   * @param commonService Reference to the injected Common library service.
   * @param dialogRef 
   * @param matDialogData 
   */
  constructor(
    private commonService: OwfCommonService,
    private dialogRef: MatDialogRef<DialogHeatmapComponent>,
    @Inject(MAT_DIALOG_DATA) private matDialogData: any
  ) {

    this.geoLayer = this.matDialogData.data.geoLayer;
    this.graphTemplate = this.matDialogData.data.graphTemplate;
    this.graphFilePath = this.matDialogData.data.graphFilePath;
    this.windowId = this.matDialogData.data.windowId;
  }

  /**
   * 
   */
  // TODO: jpkeahey 2021-08-02 - Ths is dealing with only one TS-based class in
  // the TS array. 
  createHeatmap(resultsArray: TS[]): void {

    var dataPoints: any[] = [];
    var heatmapDataObj = {};
    var yAxisLabels: string[] = [];
    var xAxisLabels: string[] = [];
    var monthData: any[] = [];
    var startDate: DateTime = resultsArray[0].getDate1();
    var endDate: DateTime = resultsArray[0].getDate2();
    // The DateTime iterator for the while loop.
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
  
        // Update the interval and labelIndex now that the this.matDialogData has been pushed onto the chartJS_yAxisData array.
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
      responsive: true
    };

    const config = {
      scrollZoom: true
    }

    Plotly.react('heatmap-div', data, layout, config).then((gd: any) => {
      resizeObserver.observe(gd);
    });
    // https://github.com/plotly/plotly.js/issues/3984
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        // Check if the observer's size is still around, and only resize if it
        // is. Otherwise an error will be thrown for resizing an empty element.
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          Plotly.Plots.resize(entry.target);
        }
      }
    });
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive. Called after the constructor.
   */
  ngOnInit(): void {
    if (this.graphFilePath.toUpperCase().includes('.STM')) {
      this.parseTSFile(Path.sMP);
    } else if (this.graphFilePath.toUpperCase().includes('.DV')) {
      this.parseTSFile(Path.dVP);
    }
  }

  /**
   * Called once, before the instance is destroyed.
   */
  ngOnDestroy(): void {
    if (this.forkJoinSub) {
      this.forkJoinSub.unsubscribe();
    } 
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked, and removes this
   * dialog's window ID from the windowManager.
   */
  onClose(): void {
    this.dialogRef.close();
    this.windowManager.removeWindow(this.windowId);
  }

  /**
   * Use the cdss-lib-common-java converted code to read through StateMod and DateValue
   * files, create a TS object, and add it to an array.
   * @param dataPath The path type describing what kind of file is being processed.
   */
  parseTSFile(dataPath: Path): void {
    // Defines a TSObject so it can be instantiated as the desired object later.
    var TSObject: any;
    // Create an array to hold the Observables of each file read.
    var dataArray: Observable<any>[] = [];
    // The file path string to the TS File.
    var filePath: string;
    // The TSID used by the readTimeSeries function in the converted Java code that utilizes it as a TS identifier.
    var TSIDLocation: string;

    switch (dataPath) {
      case Path.sMP: TSObject = new StateModTS(this.commonService); break;
      case Path.dVP: TSObject = new DateValueTS(this.commonService); break;
    }

    for (let data of this.graphTemplate.product.subProducts[0].data) {

      var fullTSID = data.properties.TSID;
      // Obtain the TSID location for the readTimeSeries method.
      TSIDLocation = fullTSID.split('~')[0];
      // If a full TSID used in the graph template file, determine the file path of the StateMod
      // file. (TSIDLocation~/path/to/filename.stm OR TSIDLocation~StateMod~/path/to/filename.stm)
      if (fullTSID.split('~').length === 2) {
        filePath = fullTSID.split('~')[1];
      } else if (fullTSID.split('~').length === 3) {
        filePath = fullTSID.split('~')[2];
      }
      // Don't subscribe yet!  
      dataArray.push(TSObject.readTimeSeries(TSIDLocation, this.commonService.buildPath(dataPath, [filePath]),
      null,
      null,
      null,
      true));
    }

    // Now that the array has all the Observables needed, forkJoin and subscribe to them all. Their results will now be
    // returned as an Array with each index corresponding to the order in which they were pushed onto the array.
    this.forkJoinSub = forkJoin(dataArray).subscribe((resultsArray: TS[]) => {
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