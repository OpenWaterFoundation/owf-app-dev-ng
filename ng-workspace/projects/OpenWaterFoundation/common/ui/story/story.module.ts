import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AngularFullpageModule } from '@fullpage/angular-fullpage';

import { StoryComponent } from './story.component';



@NgModule({
  declarations: [
    StoryComponent
  ],
  imports: [
    CommonModule,
    AngularFullpageModule
  ]
})
export class StoryModule { }
