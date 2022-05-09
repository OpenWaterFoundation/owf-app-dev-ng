import { Component,
          Input }           from '@angular/core';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';
import { DashboardService } from '../../dashboard.service';
import { Observable }       from 'rxjs';


@Component({
  selector: 'widget-status-indicator',
  templateUrl: './status-indicator.component.html',
  styleUrls: ['./status-indicator.component.css']
})
export class StatusIndicatorComponent {
  
  average: string;
  
  allFeatures: any[] = [];
  /** Displays a red down caret icon in the widget if set to true. */
  changeDecBad: boolean;
  /** Displays a green down caret icon in the widget if set to true. */
  changeDecGood: boolean;
  /** Displays a red up caret icon in the widget if set to true. */
  changeIncBad: boolean;
  /** Displays a green up caret icon in the widget if set to true. */
  changeIncGood: boolean;

  difference: string;
  /** String array representing the type of error that occurred while building this
   * widget. Used by the error widget. */
  errorTypes: string[] = [];
  /** Displays a red X icon in the widget if set to true. */
  failureIndicator: boolean;

  isIndicatorError$: Observable<boolean>;
  /** Displays a green check icon in the widget if set to true. */
  passingIndicator: boolean;
  /** The title of this widget from the widget's `title` property in the dashboard
   * configuration file. */
  @Input('statusIndicatorWidget') statusIndicatorWidget: IM.StatusIndicatorWidget;
  /** Displays a yellow exclamation icon in the widget if set to true. */
  warningIndicator: boolean;
  /**
   * 
   */
  widgetError: boolean;


  /**
   * 
   * @param commonService The injected Common library service.
   */
  constructor(private commonService: OwfCommonService,
    private dashboardService: DashboardService) {}


  private checkWidgetObject(): void {

    var error = false;

    if (!this.statusIndicatorWidget.title) {
      this.errorTypes.push('no title');
      error = true;
    }

    if (error === true) {
      this.dashboardService.setIndicatorError = true;
      return;
    }

    // Determine if the Chart widget has a SelectEvent. If not, the initialization
    // of the Chart widget can be performed.
    if (this.hasSelectEvent(this.statusIndicatorWidget) === false) {
      this.initStatusIndicator();
    }
  }

  /**
   * 
   * @param widget 
   * @returns 
   */
  private hasSelectEvent(widget: IM.DashboardWidget): boolean {

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
   * 
   */
  private initStatusIndicator(): void {

    // HARD CODE the displaying 'main' and 'change' indicator icons for now.
    this.passingIndicator = true; this.changeDecBad = true;

    this.commonService.getJSONData(
      this.commonService.buildPath(IM.Path.dbP, [this.statusIndicatorWidget.dataPath])
    ).subscribe((data: any) => {
      
      this.allFeatures = data.ResultList;

      var measValueAverage = 0;

      for (let feature of this.allFeatures) {
        measValueAverage += feature.measValue;
      }

      this.average = (measValueAverage / this.allFeatures.length).toFixed(2);

      this.difference = (Math.abs(Number(this.average) - this.statusIndicatorWidget.referenceValue)).toFixed(2);

    });
  }

  /**
   * Called right after the constructor.
   */
  ngOnInit(): void {

    this.isIndicatorError$ = this.dashboardService.isIndicatorError;

    this.checkWidgetObject();

    this.dashboardService.getWidgetEvent(this.statusIndicatorWidget).subscribe((selectEvent: IM.SelectEvent) => {

      console.log(selectEvent);
    });
  }

}
