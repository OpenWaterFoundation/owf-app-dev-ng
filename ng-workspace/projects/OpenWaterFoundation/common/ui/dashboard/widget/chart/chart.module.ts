import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule }         from '@angular/material/tooltip';

import { ChartComponent }           from './chart.component';
import { ErrorModule }              from '../error/error.module';


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
    MatTooltipModule,

    ErrorModule
  ]
})
export class ChartModule { }
