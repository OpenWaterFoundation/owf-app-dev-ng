import { Component,
          Input,
          OnDestroy, 
          OnInit}             from '@angular/core';

import { BehaviorSubject,
          Observable }        from 'rxjs';


import { OwfCommonService }   from '@OpenWaterFoundation/common/services';
import * as IM                from '@OpenWaterFoundation/common/services';


@Component({
  selector: 'chart-widget',
  templateUrl: './chart-widget.component.html',
  styleUrls: ['./chart-widget.component.css']
})
export class ChartWidgetComponent implements OnInit, OnDestroy {

  /** Set to true if any errors occur in the Chart Widget. */
  private chartError: BehaviorSubject<boolean> = new BehaviorSubject(false);
  /** The attribute provided as an attribute to this component when created, e.g.
   *   <chart-widget [chartWidget]="widget"></chart-widget> */
  @Input() chartWidget: IM.ChartWidget;
  /** String array representing the type of error that occurred while building this
   * widget. Used by the error widget. */
  errorTypes: string[] = [];


  /**
  * @constructor for the DialogTSGraph Component.
  * @param commonService A reference to the top level service OwfCommonService.
  */
  constructor(private commonService: OwfCommonService) { }


  /**
   * Observable used in the Chart Widget that's used with an async pipe in the template
   * file to show the widget or error content.
   */
  get isChartError$(): Observable<boolean> { return this.chartError.asObservable(); }

  /**
   * Toggles the chartError BehaviorSubject between true and false.
   */
  set setChartError(error: boolean) { this.chartError.next(error); }


  /**
  * Initial function call when the Dialog component is created. Determines whether
  * a CSV or StateMod file is to be read for graph creation.
  */
  ngOnInit(): void {

  }

  /**
  * Called once, before the instance is destroyed. Unsubscribes from all defined
  * subscriptions to prevent memory leaks.
  */
  ngOnDestroy(): void {
    
  }

}
