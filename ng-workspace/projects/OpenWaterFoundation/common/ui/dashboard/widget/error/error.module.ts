import { NgModule }          from '@angular/core';
import { CommonModule }      from '@angular/common';

import { MatTooltipModule }  from '@angular/material/tooltip';

import { ErrorComponent }    from './error.component';


@NgModule({
  declarations: [
    ErrorComponent
  ],
  exports: [
    ErrorComponent
  ],
  imports: [
    CommonModule,

    MatTooltipModule
  ]
})
export class ErrorModule { }
