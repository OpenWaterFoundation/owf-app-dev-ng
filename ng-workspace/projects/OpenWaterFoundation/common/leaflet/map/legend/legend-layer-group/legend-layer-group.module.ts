import { NgModule }                       from '@angular/core';
import { CommonModule }                   from '@angular/common';

import { MatExpansionModule }             from '@angular/material/expansion';

import { LegendLayerGroupComponent }      from './legend-layer-group.component';


@NgModule({
  declarations: [
    LegendLayerGroupComponent
  ],
  exports: [
    LegendLayerGroupComponent
  ],
  imports: [
    CommonModule,
    MatExpansionModule
  ]
})
export class LegendLayerGroupModule { }
