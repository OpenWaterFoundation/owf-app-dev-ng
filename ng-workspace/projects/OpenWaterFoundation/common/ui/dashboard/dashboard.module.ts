import { NgModule }              from '@angular/core';
import { CommonModule }          from '@angular/common';

import { MatGridListModule }     from '@angular/material/grid-list';

import { MapModule }             from '@OpenWaterFoundation/common/leaflet';

import { ChartModule }           from './widget/chart/chart.module';
import { DiagnosticsModule }     from './widget/diagnostics/diagnostics.module';
import { ErrorModule }           from './widget/error/error.module';
import { ImageModule }           from './widget/image/image.module';
import { SelectorModule }        from './widget/selector/selector.module';
import { StatusIndicatorModule } from './widget/status-indicator/status-indicator.module';
import { TextModule }            from './widget/text/text.module';

import { DashboardComponent }    from './dashboard.component';


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
    DiagnosticsModule,
    ErrorModule,
    ImageModule,
    SelectorModule,
    StatusIndicatorModule,
    TextModule
  ]
})
export class DashboardModule { }
