import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTooltipModule }         from '@angular/material/tooltip';

import { ShowdownModule }            from 'ngx-showdown';

import { DialogPropertiesComponent } from './dialog-properties.component';


@NgModule({
  declarations: [
    DialogPropertiesComponent
  ],
  imports: [
    CommonModule,
    MatTooltipModule,
    ShowdownModule
  ],
  exports: [
    DialogPropertiesComponent
  ]
})
export class DialogPropertiesModule { }
