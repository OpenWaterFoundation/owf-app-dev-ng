import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ShowdownModule }            from 'ngx-showdown';

import { DialogTSGraphComponent } from './dialog-TSGraph.component';


@NgModule({
  declarations: [
    DialogTSGraphComponent
  ],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    ShowdownModule
  ],
  exports: [
    DialogTSGraphComponent
  ]
})
export class DialogTSGraphModule { }
