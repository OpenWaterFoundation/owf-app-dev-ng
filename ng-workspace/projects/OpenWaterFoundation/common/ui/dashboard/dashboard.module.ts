import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';

import { MatGridListModule }  from '@angular/material/grid-list';

import { MapModule }          from '@OpenWaterFoundation/common/leaflet';
import { ImageModule,
          SelectorModule,
          TextModule }    from '@OpenWaterFoundation/common/ui/widget';

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
    ImageModule,
    SelectorModule,
    TextModule
  ]
})
export class DashboardModule { }
