import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JustificationPipe } from './justification.pipe';


@NgModule({
  declarations: [
    JustificationPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    JustificationPipe
  ]
})
export class DialogModule { }
