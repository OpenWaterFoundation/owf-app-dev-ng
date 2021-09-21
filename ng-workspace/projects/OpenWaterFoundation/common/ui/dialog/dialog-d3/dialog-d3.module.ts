import { NgModule }          from '@angular/core';
import { CommonModule }      from '@angular/common';

import { DragDropModule }    from '@angular/cdk/drag-drop';
import { MatButtonModule }   from '@angular/material/button';
import { MatDialogModule }   from '@angular/material/dialog';

import { DialogD3Component } from '../dialog-d3/dialog-d3.component';


@NgModule({
  declarations: [
    DialogD3Component
  ],
  imports: [
    CommonModule,
    DragDropModule,
    MatButtonModule,
    MatDialogModule
  ]
})
export class DialogD3Module { }
