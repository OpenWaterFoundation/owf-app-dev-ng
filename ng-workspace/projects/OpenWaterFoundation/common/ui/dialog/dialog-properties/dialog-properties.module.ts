import { NgModule }                  from '@angular/core';
import { CommonModule }              from '@angular/common';

import { MatTooltipModule }          from '@angular/material/tooltip';

import { ShowdownModule }            from 'ngx-showdown';

import { FontAwesomeModule }         from '@fortawesome/angular-fontawesome';

import { DialogPropertiesComponent } from './dialog-properties.component';
import { DragDropModule }            from '@angular/cdk/drag-drop';
import { MatButtonModule }           from '@angular/material/button';
import { MatDialogModule }           from '@angular/material/dialog';


@NgModule({
  declarations: [
    DialogPropertiesComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    FontAwesomeModule,
    MatButtonModule,
    MatDialogModule, 
    MatTooltipModule,
    ShowdownModule
  ],
  exports: [
    DialogPropertiesComponent
  ]
})
export class DialogPropertiesModule { }
