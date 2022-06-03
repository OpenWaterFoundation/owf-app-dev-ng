import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ChartComponent }           from './chart.component';
import { ErrorModule }              from '@OpenWaterFoundation/common/services';


@NgModule({
  declarations: [
    ChartComponent
  ],
  exports: [
    ChartComponent
  ],
  imports: [
    CommonModule,

    ErrorModule,

    MatProgressSpinnerModule
  ]
})
export class ChartModule { }
