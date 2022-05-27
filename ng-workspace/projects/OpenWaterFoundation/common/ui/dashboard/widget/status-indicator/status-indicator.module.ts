import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule }         from '@angular/material/tooltip';

import { ErrorWidgetModule }        from '../error/error-widget.module';
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

    ErrorWidgetModule
  ]
})
export class StatusIndicatorModule { }
