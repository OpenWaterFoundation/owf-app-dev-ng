import { Component,
          OnInit }      from '@angular/core';

import { first }        from 'rxjs/operators';

import { AppService }   from '../app.service';

import { ElementCache } from '../ElementCache';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  /**
   * The ElementCache Instance, that caches network retrieved elements so that a network request is unneeded if a user clicks
   * between multiple pages repeatedly.
   */
  cache: ElementCache = ElementCache.getInstance();
  /**
   * The string to be converted into HTML and shown as markdown using Showdown in this component's template.
   */
  showdownHTML: string;
  /** The Showdown config option object. Overrides the `app.module.ts` config option object. */
  showdownOptions = {
    emoji: true,
    flavor: 'github',
    noHeaderId: true,
    openLinksInNewWindow: true,
    parseImgDimensions: true,
    // This must exist in the config object and be set to false to work.
    simpleLineBreaks: false,
    strikethrough: true,
    tables: true
  }
  


  /**
   * The HomeComponent constructor, which is the first to run, before ngOnInit.
   * @param appService angulardev global service instance for top-level and broad network requests.
   */
  constructor(private appService: AppService) { }


  /**
   * Performs a GET request using the hard-coded path to the project's README file to be displayed as the home page
   * contents.
   */
  private convertMarkdownToHTML(): void {
    this.appService.getPlainText('assets/README.md').pipe(first()).subscribe((markdownFile: string) => {
      this.cache.setNewElement('home-element', markdownFile);
      this.showdownHTML = markdownFile;
    });
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive. Called after the constructor.
   */
  ngOnInit(): void {
    if (this.cache.elementExists('home-element') === true) {
      this.showdownHTML = this.cache.getElement('home-element');
    } else {
      this.convertMarkdownToHTML();
    }
  }

}
