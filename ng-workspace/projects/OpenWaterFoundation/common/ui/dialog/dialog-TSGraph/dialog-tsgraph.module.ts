import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';

import { DragDropModule }           from '@angular/cdk/drag-drop';
import { MatButtonModule }          from '@angular/material/button';
import { MatDialogModule }          from '@angular/material/dialog';

import { ShowdownModule }           from 'ngx-showdown';

import { ChartModule }              from '@OpenWaterFoundation/common/ui/core';

import { DialogTSGraphComponent }   from './dialog-TSGraph.component';


@NgModule({
  declarations: [
    DialogTSGraphComponent
  ],
  imports: [
    CommonModule,

    ChartModule,

    DragDropModule,
    MatButtonModule,
    MatDialogModule,
    ShowdownModule
  ],
  exports: [
    DialogTSGraphComponent
  ]
})
export class DialogTSGraphModule { }
