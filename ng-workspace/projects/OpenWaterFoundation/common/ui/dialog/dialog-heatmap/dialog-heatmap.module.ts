import { NgModule }               from '@angular/core';
import { CommonModule }           from '@angular/common';
import { DragDropModule }         from '@angular/cdk/drag-drop';
import { MatButtonModule }        from '@angular/material/button';

import { DialogHeatmapComponent } from './dialog-heatmap.component';



@NgModule({
  declarations: [
    DialogHeatmapComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    MatButtonModule
  ]
})
export class DialogHeatmapModule { }
