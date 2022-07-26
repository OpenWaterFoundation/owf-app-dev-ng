import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';
import { DragDropModule }           from '@angular/cdk/drag-drop';
import { MatButtonModule }          from '@angular/material/button';
import { MatDialogModule }          from '@angular/material/dialog';
import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatIconModule }            from '@angular/material/icon';
import { MatInputModule }           from '@angular/material/input';
import { MatMenuModule }            from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule }           from '@angular/material/table';
import { MatTooltipModule }         from '@angular/material/tooltip';
import { PipesModule }              from '@OpenWaterFoundation/common/pipes';
import { TableVirtualScrollModule } from 'ng-table-virtual-scroll';
import { ScrollingModule }          from '@angular/cdk/scrolling';

import { FontAwesomeModule }        from '@fortawesome/angular-fontawesome';

import { DialogTSTableComponent }   from './dialog-tstable.component';

@NgModule({
  declarations: [
    DialogTSTableComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    FontAwesomeModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
    PipesModule,
    ScrollingModule,
    TableVirtualScrollModule
  ],
  exports: [
    DialogTSTableComponent
  ]
})
export class DialogTstableModule { }
