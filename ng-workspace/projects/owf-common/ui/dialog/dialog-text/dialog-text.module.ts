import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatTooltipModule }         from '@angular/material/tooltip';

import { DialogTextComponent } from './dialog-text.component';



@NgModule({
  declarations: [
    DialogTextComponent
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatTooltipModule
  ],
  exports: [
    DialogTextComponent
  ]
})
export class DialogTextModule { }
