import { NgModule }                       from '@angular/core';
import { CommonModule }                   from '@angular/common';

import { MatExpansionModule }             from '@angular/material/expansion';

import { LegendBackgroundGroupComponent } from './legend-background-group.component';


@NgModule({
  declarations: [
    LegendBackgroundGroupComponent
  ],
  exports: [
    LegendBackgroundGroupComponent
  ],
  imports: [
    CommonModule,
    MatExpansionModule
  ]
})
export class LegendBackgroundGroupModule { }
