import { NgModule }                       from '@angular/core';
import { CommonModule }                   from '@angular/common';

import { FormsModule }                    from '@angular/forms';

import { MatButtonModule }                from '@angular/material/button';
import { MatExpansionModule }             from '@angular/material/expansion';
import { MatIconModule }                  from '@angular/material/icon';
import { MatMenuModule }                  from '@angular/material/menu';
import { MatProgressBarModule }           from '@angular/material/progress-bar';
import { MatSlideToggleModule }           from '@angular/material/slide-toggle';
import { MatTooltipModule }               from '@angular/material/tooltip';

import { FontAwesomeModule }              from '@fortawesome/angular-fontawesome';

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
    FontAwesomeModule,
    
    FormsModule,
    
    CommonModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatTooltipModule,

    PipesModule
  ]
})
export class LegendLayerGroupModule { }
