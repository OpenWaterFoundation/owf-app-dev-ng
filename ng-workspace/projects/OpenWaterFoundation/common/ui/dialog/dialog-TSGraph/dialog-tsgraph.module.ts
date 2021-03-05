import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';

import { DragDropModule }           from '@angular/cdk/drag-drop';
import { MatButtonModule }          from '@angular/material/button';
import { MatDialogModule }          from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ShowdownModule }           from 'ngx-showdown';

import { DialogTSGraphComponent }   from './dialog-TSGraph.component';


@NgModule({
  declarations: [
    DialogTSGraphComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    ShowdownModule
  ],
  exports: [
    DialogTSGraphComponent
  ]
})
export class DialogTSGraphModule { }
