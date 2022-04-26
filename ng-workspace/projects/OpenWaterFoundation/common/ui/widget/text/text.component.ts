import { Component,
          Input, 
          OnDestroy}        from '@angular/core';

import { Subscription }     from 'rxjs';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';


@Component({
  selector: 'widget-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.css']
})
export class TextComponent implements OnDestroy{

  /** The attribute provided as an attribute to this component when created, e.g.
   *   <widget-text [dataPath]="path/to/text.md"></widget-text> */
  @Input() textWidget: IM.TextWidget;
  /** The string representing the type of error that occurred while building this
   * widget. Used by the error widget. */
  errorTypes: string[] = [];
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
   * @param commonService The injected Common library service.
   */
  constructor(private commonService: OwfCommonService) {}


  private checkWidgetObject(): void {
    
    if (!this.textWidget.textPath) {
      this.widgetError = true;
      this.errorTypes.push('no textPath');
      return;
    }

    this.fullDataPath = this.commonService.buildPath(IM.Path.dbP, [this.textWidget.textPath]);
  }

  /**
   * Called right after the constructor.
   */
  ngOnInit(): void {

    this.checkWidgetObject();

    // Markdown file.
    if (this.fullDataPath.endsWith('.md')) {
      this.isMarkdown = true;

      this.textSub$ = this.commonService.getPlainText(this.fullDataPath)
      .subscribe((text: string) => {
        this.text = this.commonService.sanitizeDoc(text, IM.Path.dbP);
      });
    }
    // HTML file.
    else if (this.fullDataPath.endsWith('.html')) {
      this.isHTML = true;

      this.textSub$ = this.commonService.getPlainText(this.fullDataPath)
      .subscribe((text: string) => {
        document.getElementById('textHTMLDiv').innerHTML = text;
      });
      
    }
    // Unsupported file.
    else {
      this.widgetError = true;
      this.errorTypes.push('unsupported file');
    }
  }

  /**
   * Called once, before the instance is destroyed.
   */
  ngOnDestroy(): void {
    this.textSub$.unsubscribe();
  }

}
