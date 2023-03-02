import { Component,
          Input }      from '@angular/core';
import { ChartWidget } from '@OpenWaterFoundation/common/services';



@Component({
  selector: 'chart-widget',
  templateUrl: './chart-widget.component.html',
  styleUrls: ['./chart-widget.component.css']
})
export class ChartWidgetComponent {

  /** The attribute provided to this component when created, e.g.
   *   <chart-widget [chartWidget]="widget"></chart-widget> */
  @Input('chartWidget') chartWidget: ChartWidget;


  /**
  * @constructor for the DialogTSGraph Component.
  */
  constructor() { }



}
