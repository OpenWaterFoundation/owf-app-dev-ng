import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';

import { BackgroundLayerComponent } from '../background-layer/background-layer.component';
import { BackgroundLayerDirective } from '../background-layer/background-layer.directive';


@NgModule({
  declarations: [
    BackgroundLayerDirective,
    BackgroundLayerComponent
  ],
  exports: [
    BackgroundLayerDirective,
    BackgroundLayerComponent
  ],
  imports: [
    CommonModule
  ]
})
export class BackgroundLayerModule { }
