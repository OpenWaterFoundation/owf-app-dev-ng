import { NgModule }          from '@angular/core';
import { CommonModule }      from '@angular/common';

import { MatTooltipModule }  from '@angular/material/tooltip';

import { ChartComponent }    from './chart.component';


@NgModule({
  declarations: [
    ChartComponent
  ],
  exports: [
    ChartComponent
  ],
  imports: [
    CommonModule,

    MatTooltipModule
  ]
})
export class ChartModule { }
