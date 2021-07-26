import { NgModule }          from '@angular/core';
import { CommonModule }      from '@angular/common';

import { JustificationPipe } from './justification.pipe';
import { MenuDisablePipe }   from './menu-disable.pipe';
import { ZoomDisablePipe }   from './zoom-disable.pipe';


@NgModule({
  declarations: [
    JustificationPipe,
    MenuDisablePipe,
    ZoomDisablePipe
  ],
  exports: [
    JustificationPipe,
    MenuDisablePipe,
    ZoomDisablePipe
  ],
  imports: [
    CommonModule
  ]
})
export class PipesModule { }
