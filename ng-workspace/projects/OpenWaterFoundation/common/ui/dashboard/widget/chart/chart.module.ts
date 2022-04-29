import { NgModule }          from '@angular/core';
import { CommonModule }      from '@angular/common';

import { MatTooltipModule }  from '@angular/material/tooltip';

import { ChartComponent }    from './chart.component';
import { ErrorModule }       from '../error/error.module';


@NgModule({
  declarations: [
    ChartComponent
  ],
  exports: [
    ChartComponent
  ],
  imports: [
    CommonModule,

    MatTooltipModule,

    ErrorModule
  ]
})
export class ChartModule { }
