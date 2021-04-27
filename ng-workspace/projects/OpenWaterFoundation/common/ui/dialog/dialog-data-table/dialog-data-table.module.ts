import { CommonModule }             from '@angular/common';
import { NgModule }                 from '@angular/core';

import { DragDropModule }           from '@angular/cdk/drag-drop';
import { FormsModule }              from '@angular/forms';
import { MatButtonModule }          from '@angular/material/button';
import { MatButtonToggleModule }    from '@angular/material/button-toggle';
import { MatDialogModule }          from '@angular/material/dialog';
import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatIconModule }            from '@angular/material/icon';
import { MatInputModule }           from '@angular/material/input';
import { MatMenuModule }            from '@angular/material/menu';
import { MatRadioModule }           from '@angular/material/radio';
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
    FormsModule,
    DialogModule,
    DragDropModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatRadioModule,
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