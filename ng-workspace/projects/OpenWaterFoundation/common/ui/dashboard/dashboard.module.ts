import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';

import { MatGridListModule }  from '@angular/material/grid-list';

import { MapModule }          from '@OpenWaterFoundation/common/leaflet';
import { ChartModule,
          ImageModule,
          SelectorModule,
          StatusIndicatorModule,
          TextModule }        from '@OpenWaterFoundation/common/ui/widget';

import { DashboardComponent } from './dashboard.component';


@NgModule({
  declarations: [
    DashboardComponent
  ],
  exports: [
    DashboardComponent
  ],
  imports: [
    CommonModule,

    MatGridListModule,

    MapModule,

    ChartModule,
    ImageModule,
    SelectorModule,
    StatusIndicatorModule,
    TextModule
  ]
})
export class DashboardModule { }
