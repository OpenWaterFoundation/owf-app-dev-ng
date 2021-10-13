import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';

import { DragDropModule }           from '@angular/cdk/drag-drop';
// Needed for ngModel
import { FormsModule }              from '@angular/forms';
import { MatButtonModule }          from '@angular/material/button';
import { MatDialogModule }          from '@angular/material/dialog';

import { NgSelect2Module }          from 'ng-select2';
import { DialogGapminderComponent } from './dialog-gapminder.component';


@NgModule({
  declarations: [
    DialogGapminderComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    NgSelect2Module
  ],
  exports: [
    DialogGapminderComponent
  ]
})
export class DialogGapminderModule { }
