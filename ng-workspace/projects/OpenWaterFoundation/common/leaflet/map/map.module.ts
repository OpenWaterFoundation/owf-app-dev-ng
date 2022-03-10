import { NgModule }                    from '@angular/core';
import { CommonModule }                from '@angular/common';
import { BrowserAnimationsModule }     from '@angular/platform-browser/animations';
import { BrowserModule }               from '@angular/platform-browser';
import { DragDropModule }              from '@angular/cdk/drag-drop';
import { MatTooltipModule }            from '@angular/material/tooltip';
import { MatCheckboxModule }           from '@angular/material/checkbox';
import { MatButtonModule }             from '@angular/material/button';
import { MatDialogModule }             from '@angular/material/dialog';
import { MatExpansionModule }          from '@angular/material/expansion';
import { MatInputModule }              from '@angular/material/input';
import { MatProgressBarModule }        from '@angular/material/progress-bar';
import { MatIconModule }               from '@angular/material/icon';
import { MatMenuModule }               from '@angular/material/menu';
import { MatTableModule }              from '@angular/material/table';
import { MatProgressSpinnerModule }    from '@angular/material/progress-spinner';
import { MatSlideToggleModule }        from '@angular/material/slide-toggle';
import { ScrollingModule }             from '@angular/cdk/scrolling';
// The shared pipes secondary entry point for the common library.
import { PipesModule }                 from '@OpenWaterFoundation/common/pipes';

import { MapComponent }                from './map.component';
import { LegendBackgroundGroupModule } from './legend/legend-background-group/legend-background-group.module';


@NgModule({
  declarations: [
    MapComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    BrowserModule,
    DragDropModule,
    LegendBackgroundGroupModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTableModule,
    PipesModule,
    ScrollingModule,
  ]
})
export class MapModule { }
