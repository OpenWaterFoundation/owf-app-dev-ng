import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';

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
import { PipesModule }              from '@OpenWaterFoundation/common/pipes';
import { TableVirtualScrollModule } from 'ng-table-virtual-scroll';
import { ScrollingModule }          from '@angular/cdk/scrolling';
import { ShowdownModule }           from 'ngx-showdown';

import { DialogDataTableLightComponent } from './dialog-data-table-light.component';


@NgModule({
  declarations: [
    DialogDataTableLightComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    FormsModule,
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
    PipesModule,
    ScrollingModule,
    ShowdownModule,
    TableVirtualScrollModule
  ],
  exports: [
    DialogDataTableLightComponent
  ]
})
export class DialogDataTableLightModule { }
