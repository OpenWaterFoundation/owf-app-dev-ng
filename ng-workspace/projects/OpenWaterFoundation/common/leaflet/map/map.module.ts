import { NgModule }                    from '@angular/core';
import { CommonModule }                from '@angular/common';
import { BrowserAnimationsModule }     from '@angular/platform-browser/animations';
import { BrowserModule }               from '@angular/platform-browser';
import { RouterModule }                from '@angular/router';

import { MatButtonModule }             from '@angular/material/button';
import { MatIconModule }               from '@angular/material/icon';
import { MatSlideToggleModule }        from '@angular/material/slide-toggle';
import { MatTooltipModule }            from '@angular/material/tooltip';
// The shared pipes secondary entry point for the common library.
import { PipesModule }                 from '@OpenWaterFoundation/common/pipes';

import { FontAwesomeModule }           from '@fortawesome/angular-fontawesome';

import { NotFoundModule }              from '@OpenWaterFoundation/common/services';

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
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    RouterModule,

    FontAwesomeModule,

    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTooltipModule,

    NotFoundModule,

    PipesModule,
    
    LegendBackgroundGroupModule,
    LegendLayerGroupModule
  ]
})
export class MapModule { }
