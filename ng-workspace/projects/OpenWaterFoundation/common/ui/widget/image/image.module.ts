import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';

import { ErrorModule } from '../error/error.module';
import { ImageComponent } from './image.component';


@NgModule({
  declarations: [
    ImageComponent
  ],
  exports: [
    ImageComponent
  ],
  imports: [
    CommonModule,

    ErrorModule
  ]
})
export class ImageModule { }
