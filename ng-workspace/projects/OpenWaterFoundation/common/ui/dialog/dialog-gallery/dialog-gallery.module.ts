import { NgModule }               from '@angular/core';
import { CommonModule }           from '@angular/common';

import { DragDropModule }         from '@angular/cdk/drag-drop';
import { MatButtonModule }        from '@angular/material/button';
import { MatDialogModule }        from '@angular/material/dialog';
import { NgxGalleryModule }       from 'ngx-gallery-9';

import { FontAwesomeModule }      from '@fortawesome/angular-fontawesome';

import { DialogGalleryComponent } from './dialog-gallery.component';

@NgModule({
  declarations: [
    DialogGalleryComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    FontAwesomeModule,
    MatButtonModule,
    MatDialogModule,
    NgxGalleryModule
  ],
  exports: [
    DialogGalleryComponent
  ]
})
export class DialogGalleryModule { }
