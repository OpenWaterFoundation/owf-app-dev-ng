import { NgModule }          from '@angular/core';
import { CommonModule }      from '@angular/common';

import { BuildPathPipe }     from './build-path.pipe';
import { JustificationPipe } from './justification.pipe';
import { MenuDisablePipe }   from './menu-disable.pipe';
import { SymbolCheckPipe }   from './symbol-check.pipe';
import { ZoomDisablePipe }   from './zoom-disable.pipe';


@NgModule({
  declarations: [
    BuildPathPipe,
    JustificationPipe,
    MenuDisablePipe,
    SymbolCheckPipe,
    ZoomDisablePipe
  ],
  exports: [
    BuildPathPipe,
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
