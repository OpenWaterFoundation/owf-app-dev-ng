import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';

import { ShowdownModule }     from 'ngx-showdown';

import { DragDropModule }     from '@angular/cdk/drag-drop';
import { MatButtonModule }    from '@angular/material/button';
import { MatDialogModule }    from '@angular/material/dialog';

import { DialogDocComponent } from './dialog-doc.component';

@NgModule({
  declarations: [
    DialogDocComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    MatButtonModule,
    MatDialogModule,
    ShowdownModule
  ],
  exports: [
    DialogDocComponent
  ]
})
export class DialogDocModule { }
