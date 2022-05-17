import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ErrorModule }              from '../error/error.module';
import { StatusIndicatorComponent } from './status-indicator.component';


@NgModule({
  declarations: [
    StatusIndicatorComponent
  ],
  exports: [
    StatusIndicatorComponent
  ],
  imports: [
    CommonModule,

    MatProgressSpinnerModule,

    ErrorModule
  ]
})
export class StatusIndicatorModule { }
