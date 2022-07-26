import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';

import { DragDropModule }           from '@angular/cdk/drag-drop';
// Needed for ngModel
import { FormsModule }              from '@angular/forms';
import { MatButtonModule }          from '@angular/material/button';
import { MatDialogModule }          from '@angular/material/dialog';

import { FontAwesomeModule }      from '@fortawesome/angular-fontawesome';

import { PipesModule }              from '@OpenWaterFoundation/common/pipes';

import { NgSelect2Module }          from 'ng-select2';
import { DialogGapminderComponent } from './dialog-gapminder.component';


@NgModule({
  declarations: [
    DialogGapminderComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    FontAwesomeModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    NgSelect2Module,
    PipesModule
  ],
  exports: [
    DialogGapminderComponent
  ]
})
export class DialogGapminderModule { }
