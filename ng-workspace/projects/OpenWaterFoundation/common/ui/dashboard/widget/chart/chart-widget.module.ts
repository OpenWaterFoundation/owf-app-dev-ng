import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';

import { ChartModule }              from '@OpenWaterFoundation/common/ui/core';
import { ChartWidgetComponent }     from './chart-widget.component';


@NgModule({
  declarations: [
    ChartWidgetComponent
  ],
  exports: [
    ChartWidgetComponent
  ],
  imports: [
    CommonModule,
    ChartModule
  ]
})
export class ChartWidgetModule { }
