import { NgModule }                    from '@angular/core';
import { CommonModule }                from '@angular/common';

import { CheckDataTableElementPipe }   from './check-data-table-element.pipe';
import { BuildPathPipe }               from './build-path.pipe';
import { JustificationPipe }           from './justification.pipe';
import { MenuDisablePipe }             from './menu-disable.pipe';
import { SymbolCheckPipe }             from './symbol-check.pipe';


@NgModule({
  declarations: [
    BuildPathPipe,
    CheckDataTableElementPipe,
    JustificationPipe,
    MenuDisablePipe,
    SymbolCheckPipe
  ],
  exports: [
    BuildPathPipe,
    CheckDataTableElementPipe,
    JustificationPipe,
    MenuDisablePipe,
    SymbolCheckPipe
  ],
  imports: [
    CommonModule
  ]
})
export class PipesModule { }
