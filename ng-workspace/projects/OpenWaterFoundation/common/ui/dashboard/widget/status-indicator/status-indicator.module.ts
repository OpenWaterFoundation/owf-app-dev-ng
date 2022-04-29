import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';

import { ErrorModule } from '../error/error.module';
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

    ErrorModule
  ]
})
export class StatusIndicatorModule { }
