import { NgModule }                    from '@angular/core';
import { CommonModule }                from '@angular/common';
import { BrowserAnimationsModule }     from '@angular/platform-browser/animations';
import { BrowserModule }               from '@angular/platform-browser';

import { MatTooltipModule }            from '@angular/material/tooltip';
// The shared pipes secondary entry point for the common library.
import { PipesModule }                 from '@OpenWaterFoundation/common/pipes';

import { MapComponent }                from './map.component';
import { LegendBackgroundGroupModule } from './legend/legend-background-group/legend-background-group.module';
import { LegendLayerGroupModule }      from './legend/legend-layer-group/legend-layer-group.module';


@NgModule({
  declarations: [
    MapComponent
  ],
  exports: [
    MapComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    BrowserModule,

    MatTooltipModule,

    PipesModule,
    
    LegendBackgroundGroupModule,
    LegendLayerGroupModule
  ]
})
export class MapModule { }
