import { Component,
          Inject,
          Input, 
          OnDestroy}        from '@angular/core';
import { DOCUMENT }         from '@angular/common';

import { Observable,
          Subscription }    from 'rxjs';

import { OwfCommonService, Path, TextWidget } from '@OpenWaterFoundation/common/services';
import { DashboardService } from '../../dashboard.service';


@Component({
  selector: 'widget-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.css']
})
export class TextComponent implements OnDestroy{

  /** String array representing the type of error that occurred while building this
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
  /** Observable representing the ChartSelectorError BehaviorSubject from the
   * widgetService. Used by the template to show an error widget. */
  isTextError$: Observable<boolean>;
  /** The text content to be shown in either HTML or Markdown in the widget. */
  text: string;
  /** The subscription for the text retrieval. To be unsubscribed when this component
   * instance is destroyed. */
  textSub: Subscription;
  /** The attribute provided to this component when created, e.g.
   *   <widget-text [textWidget]="widget"></widget-text> */
  @Input('textWidget') textWidget: TextWidget;
  

  /**
   * 
   * @param commonService Reference to the injected Common library service.
   * @param dashboardService The injected dashboard service.
   * @param document 
   */
  constructor(
    private commonService: OwfCommonService,
    private dashboardService: DashboardService,
    @Inject(DOCUMENT) private document: Document
  ) {
    
  }


  /**
   * Checks the Text widget object and either creates and displays an error widget
   * if the object is incorrectly made, or moves on to creating this widget.
   */
  private checkWidgetObject(): void {

    var error: boolean;
    
    if (!this.textWidget.contentType) {
      this.errorTypes.push('no contentType');
      error = true;
    }
    if (!this.textWidget.textPath) {
      this.errorTypes.push('no textPath');
      error = true;
    }
    if (!this.textWidget.name) {
      this.errorTypes.push('no name');
      error = true;
    }

    if (error === true) {
      this.dashboardService.setTextError = true;
      return;
    }

    // The widget object has passed its inspection and can be created.
    this.fullDataPath = this.commonService.buildPath(Path.dbP, this.textWidget.textPath);
    this.getTextData();
  }

  /**
   * Read in the text data from a file or URL and set the necessary variables so
   * they can be used to display in the widget.
   */
  private getTextData(): void {

    // Markdown file.
    if (this.textWidget.contentType.toLowerCase() === 'markdown') {
      this.isMarkdown = true;

      this.textSub = this.commonService.getPlainText(this.fullDataPath)
      .subscribe((text: string) => {
        this.text = this.commonService.sanitizeDoc(text, Path.dbP);
      });
    }
    // HTML file.
    else if (this.textWidget.contentType.toLowerCase() === 'html') {
      this.isHTML = true;

      this.textSub = this.commonService.getPlainText(this.fullDataPath)
      .subscribe((text: string) => {
        document.getElementById('textHTMLDiv').innerHTML = text;
      });
      
    }
    // Unsupported file.
    else {
      this.errorTypes.push('unsupported file');
      this.dashboardService.setTextError = true;
    }
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive. Called after the constructor.
   */
  ngOnInit(): void {
    this.isTextError$ = this.dashboardService.isTextError;

    this.preventScrollPropagation();
    this.checkWidgetObject();
  }

  /**
   * Called once, before the instance is destroyed.
   */
  ngOnDestroy(): void {
    if (this.textSub) {
      this.textSub.unsubscribe();
    }

    var docMarkdownDiv = this.document.querySelector('#docMarkdownDiv');
    
    if (docMarkdownDiv) {
      docMarkdownDiv.removeEventListener('wheel', this.preventScroll);
    }
  }

  /**
   * 
   * @param $event 
   * @returns 
   */
  private preventScroll($event: Event): boolean {
    $event.stopPropagation();
    return false;
  }

  /**
   * 
   */
  private preventScrollPropagation(): void {
    var docMarkdownDiv = this.document.querySelector('#docMarkdownDiv');
    
    if (docMarkdownDiv) {
      docMarkdownDiv.addEventListener('wheel', this.preventScroll, { passive: false });
    }
  }

}
