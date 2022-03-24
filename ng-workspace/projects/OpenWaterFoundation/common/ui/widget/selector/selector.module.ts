import { NgModule }       from '@angular/core';
import { CommonModule }      from '@angular/common';

import { MatButtonModule }   from '@angular/material/button';
import { MatMenuModule }     from '@angular/material/menu';
import { MatTooltipModule }  from '@angular/material/tooltip';

import { SelectorComponent } from './selector.component';


@NgModule({
  declarations: [
    SelectorComponent
  ],
  exports: [
    SelectorComponent
  ],
  imports: [
    CommonModule,

    MatButtonModule,
    MatMenuModule,
    MatTooltipModule
  ]
})
export class SelectorModule { }
