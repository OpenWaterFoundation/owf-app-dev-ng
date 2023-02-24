import { Component,
          Input,
          OnDestroy, 
          OnInit}      from '@angular/core';
import { ChartWidget } from '@OpenWaterFoundation/common/services';



@Component({
  selector: 'chart-widget',
  templateUrl: './chart-widget.component.html',
  styleUrls: ['./chart-widget.component.css']
})
export class ChartWidgetComponent implements OnInit, OnDestroy {

  /** The attribute provided to this component when created, e.g.
   *   <chart-widget [chartWidget]="widget"></chart-widget> */
  @Input('chartWidget') chartWidget: ChartWidget;


  /**
  * @constructor for the DialogTSGraph Component.
  */
  constructor() { }


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
