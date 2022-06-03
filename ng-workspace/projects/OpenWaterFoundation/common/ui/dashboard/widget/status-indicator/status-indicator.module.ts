import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule }         from '@angular/material/tooltip';

import { ErrorModule }              from '@OpenWaterFoundation/common/services';
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
    MatTooltipModule,

    ErrorModule
  ]
})
export class StatusIndicatorModule { }
