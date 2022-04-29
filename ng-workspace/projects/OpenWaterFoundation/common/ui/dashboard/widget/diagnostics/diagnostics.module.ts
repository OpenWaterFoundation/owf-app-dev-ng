import { NgModule }             from '@angular/core';
import { CommonModule }         from '@angular/common';

import { DiagnosticsComponent } from './diagnostics.component';


@NgModule({
  declarations: [
    DiagnosticsComponent
  ],
  exports: [
    DiagnosticsComponent
  ],
  imports: [
    CommonModule
  ]
})
export class DiagnosticsModule { }
