import { NgModule }              from '@angular/core';
import { CommonModule }          from '@angular/common';

import { MatButtonModule }       from '@angular/material/button';
import { AngularFullpageModule } from '@fullpage/angular-fullpage';

import { MapModule }             from '@OpenWaterFoundation/common/leaflet';
import { DashboardModule }       from '@OpenWaterFoundation/common/ui/dashboard';
import { StoryComponent }        from './story.component';


@NgModule({
  declarations: [
    StoryComponent
  ],
  imports: [
    CommonModule,

    AngularFullpageModule,
    DashboardModule,
    MapModule,
    MatButtonModule
  ]
})
export class StoryModule { }
