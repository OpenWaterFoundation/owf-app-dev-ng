import { NgModule }              from '@angular/core';
import { CommonModule }          from '@angular/common';

import { MatGridListModule }     from '@angular/material/grid-list';

import { MapModule }             from '@OpenWaterFoundation/common/leaflet';

import { ChartWidgetModule }     from './widget/chart/chart-widget.module';
import { DiagnosticsModule }     from './widget/diagnostics/diagnostics.module';
import { ErrorWidgetModule }     from './widget/error/error-widget.module';
import { ImageModule }           from './widget/image/image.module';
import { SelectorModule }        from './widget/selector/selector.module';
import { StatusIndicatorModule } from './widget/status-indicator/status-indicator.module';
import { TextModule }            from './widget/text/text.module';
import { TitleModule }           from './widget/title/title.module';

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

    ChartWidgetModule,
    DiagnosticsModule,
    ErrorWidgetModule,
    ImageModule,
    SelectorModule,
    StatusIndicatorModule,
    TextModule,
    TitleModule
  ]
})
export class DashboardModule { }
