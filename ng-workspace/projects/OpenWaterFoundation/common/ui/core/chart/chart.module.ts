import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule }         from '@angular/material/tooltip';

import { ChartComponent }           from './chart.component';


@NgModule({
  declarations: [
    ChartComponent
  ],
  exports: [
    ChartComponent
  ],
  imports: [
    CommonModule,

    MatProgressSpinnerModule,
    MatTooltipModule
  ]
})
export class ChartModule { }
