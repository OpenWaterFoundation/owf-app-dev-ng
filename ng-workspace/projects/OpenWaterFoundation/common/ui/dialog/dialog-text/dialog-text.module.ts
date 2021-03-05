import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';

import { DragDropModule }      from '@angular/cdk/drag-drop';
import { MatButtonModule }     from '@angular/material/button';
import { MatDialogModule }     from '@angular/material/dialog';
import { MatFormFieldModule }  from '@angular/material/form-field';
import { MatTooltipModule }    from '@angular/material/tooltip';

import { DialogTextComponent } from './dialog-text.component';



@NgModule({
  declarations: [
    DialogTextComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatTooltipModule
  ],
  exports: [
    DialogTextComponent
  ]
})
export class DialogTextModule { }
