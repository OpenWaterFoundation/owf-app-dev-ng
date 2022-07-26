import { NgModule }          from '@angular/core';
import { CommonModule }      from '@angular/common';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
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

    FontAwesomeModule,

    MatTooltipModule
  ]
})
export class ErrorModule { }
