import { NgModule }          from '@angular/core';
import { CommonModule }      from '@angular/common';

import { JustificationPipe } from './justification.pipe';
import { MenuDisablePipe }   from './menu-disable.pipe';
import { ZoomDisablePipe }   from './zoom-disable.pipe';
import { SymbolCheckPipe } from './symbol-check.pipe';


@NgModule({
  declarations: [
    JustificationPipe,
    MenuDisablePipe,
    ZoomDisablePipe,
    SymbolCheckPipe
  ],
  exports: [
    JustificationPipe,
    MenuDisablePipe,
    SymbolCheckPipe,
    ZoomDisablePipe
  ],
  imports: [
    CommonModule
  ]
})
export class PipesModule { }
