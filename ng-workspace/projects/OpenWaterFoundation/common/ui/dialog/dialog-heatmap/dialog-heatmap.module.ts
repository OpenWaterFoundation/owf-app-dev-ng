import { NgModule }               from '@angular/core';
import { CommonModule }           from '@angular/common';
import { DragDropModule }         from '@angular/cdk/drag-drop';
import { MatButtonModule }        from '@angular/material/button';

import { FontAwesomeModule }      from '@fortawesome/angular-fontawesome';

import { DialogHeatmapComponent } from './dialog-heatmap.component';



@NgModule({
  declarations: [
    DialogHeatmapComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    FontAwesomeModule,
    MatButtonModule
  ]
})
export class DialogHeatmapModule { }
