import { CommonModule }             from '@angular/common';
import { NgModule }                 from '@angular/core';

import { DragDropModule }           from '@angular/cdk/drag-drop';
import { MatButtonModule }          from '@angular/material/button';
import { MatDialogModule }          from '@angular/material/dialog';
import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatIconModule }            from '@angular/material/icon';
import { MatInputModule }           from '@angular/material/input';
import { MatMenuModule }            from '@angular/material/menu';
import { MatTableModule }           from '@angular/material/table';
import { MatTooltipModule }         from '@angular/material/tooltip';
import { TableVirtualScrollModule } from 'ng-table-virtual-scroll';
import { ScrollingModule }          from '@angular/cdk/scrolling';
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
    DragDropModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatTableModule,
    MatTooltipModule,
    ScrollingModule,
    ShowdownModule,
    TableVirtualScrollModule,
  ],
  exports: [
    DialogDataTableComponent
  ]
})
export class DialogDataTableModule { }
