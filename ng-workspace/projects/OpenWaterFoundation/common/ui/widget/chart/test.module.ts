import { NgModule }          from '@angular/core';
import { CommonModule }      from '@angular/common';

import { MatTooltipModule }  from '@angular/material/tooltip';

import { TestComponent }    from './test.component';


@NgModule({
  declarations: [
    TestComponent
  ],
  exports: [
    TestComponent
  ],
  imports: [
    CommonModule,

    MatTooltipModule
  ]
})
export class TestModule { }
