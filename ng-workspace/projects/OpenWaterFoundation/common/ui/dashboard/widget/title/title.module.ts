import { NgModule }          from '@angular/core';
import { CommonModule }      from '@angular/common';

import { ShowdownModule }    from 'ngx-showdown';

import { ErrorModule }       from '@OpenWaterFoundation/common/services';
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

    ErrorModule
  ],
  providers: [
  ]
})
export class TitleModule { }
