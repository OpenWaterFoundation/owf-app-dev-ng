import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';

import { ShowdownModule }     from 'ngx-showdown';

import { DragDropModule }     from '@angular/cdk/drag-drop';
import { MatButtonModule }    from '@angular/material/button';
import { MatDialogModule }    from '@angular/material/dialog';

import { FontAwesomeModule }  from '@fortawesome/angular-fontawesome';

import { DialogDocComponent } from './dialog-doc.component';

@NgModule({
  declarations: [
    DialogDocComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    FontAwesomeModule,
    MatButtonModule,
    MatDialogModule,
    ShowdownModule.forRoot({
      emoji: true,
      flavor: 'github',
      noHeaderId: true,
      openLinksInNewWindow: true,
      parseImgDimensions: true,
      simpleLineBreaks: false,
      strikethrough: true,
      tables: true
    })
  ],
  exports: [
    DialogDocComponent
  ]
})
export class DialogDocModule { }
