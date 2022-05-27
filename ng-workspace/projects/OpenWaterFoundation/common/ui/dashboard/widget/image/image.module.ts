import { NgModule }          from '@angular/core';
import { CommonModule }      from '@angular/common';

import { ErrorWidgetModule } from '../error/error-widget.module';
import { ImageComponent }    from './image.component';


@NgModule({
  declarations: [
    ImageComponent
  ],
  exports: [
    ImageComponent
  ],
  imports: [
    CommonModule,

    ErrorWidgetModule
  ]
})
export class ImageModule { }
