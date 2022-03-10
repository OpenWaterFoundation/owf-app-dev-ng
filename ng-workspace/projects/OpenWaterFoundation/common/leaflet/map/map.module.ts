import { NgModule }                    from '@angular/core';
import { CommonModule }                from '@angular/common';
import { BrowserAnimationsModule }     from '@angular/platform-browser/animations';
import { BrowserModule }               from '@angular/platform-browser';

import { DragDropModule }              from '@angular/cdk/drag-drop';
import { ScrollingModule }             from '@angular/cdk/scrolling';
import { MatButtonModule }             from '@angular/material/button';
import { MatCheckboxModule }           from '@angular/material/checkbox';
import { MatDialogModule }             from '@angular/material/dialog';
import { MatExpansionModule }          from '@angular/material/expansion';
import { MatIconModule }               from '@angular/material/icon';
import { MatInputModule }              from '@angular/material/input';
import { MatMenuModule }               from '@angular/material/menu';
import { MatProgressBarModule }        from '@angular/material/progress-bar';
import { MatProgressSpinnerModule }    from '@angular/material/progress-spinner';
import { MatSlideToggleModule }        from '@angular/material/slide-toggle';
import { MatTableModule }              from '@angular/material/table';
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
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    BrowserModule,

    DragDropModule,
    ScrollingModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTableModule,
    MatTooltipModule,

    PipesModule,
    
    LegendBackgroundGroupModule,
    LegendLayerGroupModule
  ]
})
export class MapModule { }
