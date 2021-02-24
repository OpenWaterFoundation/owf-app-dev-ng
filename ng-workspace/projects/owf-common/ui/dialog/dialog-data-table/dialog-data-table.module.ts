import { CommonModule }             from '@angular/common';
import { NgModule }                 from '@angular/core';

import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatIconModule }            from '@angular/material/icon';
import { MatMenuModule }            from '@angular/material/menu';
import { MatTableModule }           from '@angular/material/table';
import { MatTooltipModule }         from '@angular/material/tooltip';

import { TableVirtualScrollModule } from 'ng-table-virtual-scroll';
import { ShowdownModule }           from 'ngx-showdown';

import { DialogDataTableComponent } from './dialog-data-table.component';
import { DialogModule }             from '../dialog.module';
import { ZoomDisablePipe }          from './zoom-disable.pipe';


@NgModule({
  declarations: [
    DialogDataTableComponent,
    ZoomDisablePipe
  ],
  imports: [
    CommonModule,
    DialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatTooltipModule,
    ShowdownModule,
    TableVirtualScrollModule,
  ],
  exports: [
    DialogDataTableComponent
  ]
})
export class DialogDataTableModule { }
