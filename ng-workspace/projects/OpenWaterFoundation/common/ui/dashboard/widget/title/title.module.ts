import { NgModule }          from '@angular/core';
import { CommonModule }      from '@angular/common';

import { ShowdownModule }    from 'ngx-showdown';

import { ErrorWidgetModule } from '../error/error-widget.module';
import { TitleComponent }    from './title.component';


@NgModule({
  declarations: [
    TitleComponent
  ],
  exports: [
    TitleComponent
  ],
  imports: [
    CommonModule,

    ShowdownModule.forRoot({
      emoji: true,
      flavor: 'github',
      noHeaderId: true,
      openLinksInNewWindow: true,
      parseImgDimensions: true,
      simpleLineBreaks: false,
      strikethrough: true,
      tables: true
    }),

    ErrorWidgetModule
  ],
  providers: [
  ]
})
export class TitleModule { }
