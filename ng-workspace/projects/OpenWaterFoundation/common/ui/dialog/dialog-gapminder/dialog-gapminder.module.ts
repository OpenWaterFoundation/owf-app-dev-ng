import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';

import { DragDropModule }           from '@angular/cdk/drag-drop';
import { MatButtonModule }          from '@angular/material/button';
import { MatDialogModule }          from '@angular/material/dialog';

import { DialogGapminderComponent } from './dialog-gapminder.component';


@NgModule({
  declarations: [
    DialogGapminderComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    MatButtonModule,
    MatDialogModule
  ],
  exports: [
    DialogGapminderComponent
  ]
})
export class DialogGapminderModule { }
