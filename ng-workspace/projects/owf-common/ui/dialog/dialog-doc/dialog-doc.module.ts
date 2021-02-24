import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShowdownModule }            from 'ngx-showdown';

import { DialogDocComponent } from './dialog-doc.component';

@NgModule({
  declarations: [
    DialogDocComponent
  ],
  imports: [
    CommonModule,
    ShowdownModule
  ],
  exports: [
    DialogDocComponent
  ]
})
export class DialogDocModule { }
