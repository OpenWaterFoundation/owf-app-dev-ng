import { NgModule }              from '@angular/core';
import { CommonModule }          from '@angular/common';

import { MatGridListModule }     from '@angular/material/grid-list';

import { MapModule }             from '@OpenWaterFoundation/common/leaflet';

import { ChartWidgetModule }     from './widget/chart/chart-widget.module';
import { DiagnosticsModule }     from './widget/diagnostics/diagnostics.module';
import { ImageModule }           from './widget/image/image.module';
import { SelectorModule }        from './widget/selector/selector.module';
import { StatusIndicatorModule } from './widget/status-indicator/status-indicator.module';
import { TextModule }            from './widget/text/text.module';
import { TitleModule }           from './widget/title/title.module';

import { DashboardComponent }    from './dashboard.component';
import { ErrorModule }           from '@OpenWaterFoundation/common/services';


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

    ErrorModule,

    ChartWidgetModule,
    DiagnosticsModule,
    ImageModule,
    SelectorModule,
    StatusIndicatorModule,
    TextModule,
    TitleModule
  ]
})
export class DashboardModule { }
