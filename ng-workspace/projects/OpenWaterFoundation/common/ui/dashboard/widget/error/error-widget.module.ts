import { NgModule }             from '@angular/core';
import { CommonModule }         from '@angular/common';

import { MatTooltipModule }     from '@angular/material/tooltip';

import { ErrorWidgetComponent } from './error-widget.component';


@NgModule({
  declarations: [
    ErrorWidgetComponent
  ],
  exports: [
    ErrorWidgetComponent
  ],
  imports: [
    CommonModule,

    MatTooltipModule
  ]
})
export class ErrorWidgetModule { }
