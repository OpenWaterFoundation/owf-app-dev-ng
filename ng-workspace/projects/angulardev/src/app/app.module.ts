import { HashLocationStrategy,
          LocationStrategy  }      from '@angular/common';
import { APP_INITIALIZER,
          NgModule }               from '@angular/core';
import { HttpClientModule }        from '@angular/common/http';
import { DragDropModule }          from '@angular/cdk/drag-drop';
import { MatButtonModule }         from '@angular/material/button';
import { MatDialogModule }         from '@angular/material/dialog';
import { MatIconModule }             from '@angular/material/icon';
import { MatMenuModule }           from '@angular/material/menu';
import { MatTooltipModule }        from '@angular/material/tooltip';
import { BrowserModule }           from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ShowdownModule }          from 'ngx-showdown';

import { AppService }              from './app.service';

import { AppComponent }            from './app.component';
import { AppRoutingModule }        from './app-routing.module';
import { HomeComponent }           from './home/home.component';
import { NavBarComponent }         from './nav-bar/nav-bar.component';
import { OwfCommonComponent }      from './owf-common/owf-common.component';

import * as Showdown               from 'showdown';


// Set up for customized Showdown styling.
const classMap = {
  h1: 'showdown_h1',
  h2: 'showdown_h2',
  ul: 'ui list',
  li: 'ui item',
  table: 'showdown_table',
  td: 'showdown_td',
  th: 'showdown_th',
  tr: 'showdown_tr',
  p: 'showdown_p',
  pre: 'showdown_pre'
}

const bindings = Object.keys(classMap)
  .map(key => ({
    type: 'output',
    regex: new RegExp(`(<${key}>|<${key} (.*?)>)`, 'g'),
    replace: `<${key} class="${classMap[key]}">`
  }));

const convert = new Showdown.Converter({
  extensions: [bindings]
});

/**
 * Retrieves the map configuration file JSON before the application loads, so pertinent information can be ready to use before
 * the app has finished initializing.
 * @param appConfig An instance of the top-level AppService to GET the data from the `app-config` file.
 * @returns A promise.
 */
 const appInit = (appService: AppService) => {
  return (): Promise<any> => {
    return appService.loadConfigFiles();
  };
};


@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    OwfCommonComponent,
    HomeComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    DragDropModule,
    HttpClientModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    ShowdownModule.forRoot({
      emoji: true,
      extensions: [bindings],
      flavor: 'github',
      noHeaderId: true,
      openLinksInNewWindow: true,
      parseImgDimensions: true,
      simpleLineBreaks: false,
      strikethrough: true,
      tables: true
    })
  ],
  providers: [
    AppService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInit,
      multi: true,
      deps: [AppService]
    },
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
