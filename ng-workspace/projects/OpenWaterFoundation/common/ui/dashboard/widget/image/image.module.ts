import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';

import { ErrorModule }    from '@OpenWaterFoundation/common/services';
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
