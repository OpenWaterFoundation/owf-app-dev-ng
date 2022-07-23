import { NgModule }             from '@angular/core';
import { CommonModule }         from '@angular/common';

import { DialogImageComponent } from './dialog-image.component';
import { DragDropModule }       from '@angular/cdk/drag-drop';
import { MatButtonModule }      from '@angular/material/button';
import { MatDialogModule }      from '@angular/material/dialog';

import { FontAwesomeModule }    from '@fortawesome/angular-fontawesome';


@NgModule({
  declarations: [
    DialogImageComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    FontAwesomeModule,
    MatButtonModule,
    MatDialogModule
  ],
  exports: [
    DialogImageComponent
  ]
})
export class DialogImageModule { }
