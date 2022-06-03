import { NgModule }          from '@angular/core';
import { CommonModule }      from '@angular/common';

import { ShowdownModule }    from 'ngx-showdown';

import { ErrorModule }       from '@OpenWaterFoundation/common/services';
import { TextComponent }     from './text.component';


@NgModule({
  declarations: [
    TextComponent
  ],
  exports: [
    TextComponent
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

    ErrorModule
  ],
  providers: [
  ]
})
export class TextModule { }
