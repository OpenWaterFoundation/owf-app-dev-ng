import { Component,
          Input, 
          OnDestroy}           from '@angular/core';

import { Observable, Subscription }       from 'rxjs';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';
import { WidgetService }    from '../widget.service';


@Component({
  selector: 'widget-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.css']
})
export class TextComponent implements OnDestroy{

  /** For BehaviorSubject testing. It works! */
  // testData: Observable<string>;
  /** The attribute provided as an attribute to this component when created, e.g.
   *   <widget-text [dataPath]="path/to/text.md"></widget-text> */
  @Input() dataPath: string;

  errorType: string;
  /** The path to the text file after it has been built with the OWF service to
   * deal with either an absolute or relative path provided. */
  fullDataPath: string;
  /** Set to true if the provided dataPath is to a HTML file so it can be displayed
   * in the widget. */
  isHTML: boolean;
  /** Set to true if the provided dataPath is to a Markdown file so it can be displayed
   * in the widget. */
  isMarkdown: boolean;
  /** The text content to be shown in either HTML or Markdown in the widget. */
  text: string;
  /** The subscription for the text retrieval. To be unsubscribed when this component
   * instance is destroyed. */
  textSub$: Subscription;
  /** Set to true if no path is given or a bad path is provided in the dashboard
   * configuration file. */
  widgetError: boolean;

  /**
   * 
   * @param owfCommonService The injected Common library service.
   */
  constructor(private owfCommonService: OwfCommonService,
              private widgetService: WidgetService) {}


  /**
   * Called right after the constructor.
   */
  ngOnInit(): void {
    // BehaviorSubject testing. It works!
    // this.testData = this.widgetService.getTestObs();

    if (!this.dataPath) {
      this.widgetError = true;
      this.errorType = 'no dataPath';
      return;
    }
    this.fullDataPath = this.owfCommonService.buildPath(IM.Path.dbP, [this.dataPath]);

    // Markdown file.
    if (this.fullDataPath.endsWith('.md')) {
      this.isMarkdown = true;

      this.textSub$ = this.owfCommonService.getPlainText(this.fullDataPath)
      .subscribe((text: string) => {
        this.text = this.owfCommonService.sanitizeDoc(text, IM.Path.dbP);
      });
    }
    // HTML file.
    else if (this.fullDataPath.endsWith('.html')) {
      this.isHTML = true;

      this.textSub$ = this.owfCommonService.getPlainText(this.fullDataPath)
      .subscribe((text: string) => {
        document.getElementById('textHTMLDiv').innerHTML = text;
      });
      
    }
    // Unsupported file.
    else {
      this.widgetError = true;
      this.errorType = 'unsupported file';
    }
  }

  /**
   * Called once, before the instance is destroyed.
   */
  ngOnDestroy(): void {
    this.textSub$.unsubscribe();
  }

}
