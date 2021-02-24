import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';

import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule }           from '@angular/material/table';
import { MatTooltipModule }         from '@angular/material/tooltip';

import { TableVirtualScrollModule } from 'ng-table-virtual-scroll';

import { DialogTSTableComponent }   from './dialog-tstable.component';
import { DialogModule }             from '../dialog.module';

@NgModule({
  declarations: [
    DialogTSTableComponent
  ],
  imports: [
    CommonModule,
    DialogModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
    TableVirtualScrollModule
  ],
  exports: [
    DialogTSTableComponent
  ]
})
export class DialogTstableModule { }
