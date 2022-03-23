import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule }  from '@angular/material/grid-list';

import { MapModule }          from '@OpenWaterFoundation/common/leaflet';
import { ImageModule }        from '@OpenWaterFoundation/common/ui/widget';

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
    MapModule,
    ImageModule,
    MatExpansionModule,
    MatGridListModule
  ]
})
export class DashboardModule { }
