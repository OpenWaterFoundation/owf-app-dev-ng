import { NgModule }                       from '@angular/core';
import { CommonModule }                   from '@angular/common';

import { MatButtonModule }             from '@angular/material/button';
import { MatExpansionModule }             from '@angular/material/expansion';
import { MatIconModule }                  from '@angular/material/icon';
import { MatMenuModule }                  from '@angular/material/menu';
import { MatTooltipModule }               from '@angular/material/tooltip';

import { PipesModule }                    from '@OpenWaterFoundation/common/pipes';

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
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,

    PipesModule
  ]
})
export class LegendLayerGroupModule { }
