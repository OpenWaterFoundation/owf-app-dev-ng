import { Component,
          Input, 
          OnDestroy}        from '@angular/core';
import { TitleWidget }      from '@OpenWaterFoundation/common/services';

import { Observable }       from 'rxjs';

import { DashboardService } from '../../dashboard.service';


@Component({
  selector: 'widget-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.css']
})
export class TitleComponent implements OnDestroy{

  /** String array representing the type of error that occurred while building this
   * widget. Used by the error widget. */
  errorTypes: string[] = [];
  /** Observable representing the ChartSelectorError BehaviorSubject from the
   * widgetService. Used by the template to show an error widget. */
  isTitleError$: Observable<boolean>;
  /** The widget object provided as an attribute to this component when created, e.g.
   *   <widget-title [titleWidget]="widget"></widget-title> */
  @Input('titleWidget') titleWidget: TitleWidget;

  /**
   * 
   * @param dashboardService The injected dashboard service.
   */
  constructor(private dashboardService: DashboardService) {}


  /**
   * Checks the Title widget object and either creates and displays an error widget
   * if the object is incorrectly made, or moves on to creating this widget.
   */
  private checkWidgetObject(): void {

    var error: boolean;
    
    if (!this.titleWidget.title) {
      this.errorTypes.push('no title');
      error = true;
    }
    if (!this.titleWidget.name) {
      this.errorTypes.push('no name');
      error = true;
    }

    if (error === true) {
      this.dashboardService.setTitleError = true;
      return;
    }

    this.createTitle();
  }

  /**
   * 
   */
  private createTitle(): void {
    // Do I even need to do anything?
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive. Called after the constructor.
   */
  ngOnInit(): void {
    this.isTitleError$ = this.dashboardService.isTitleError;

    this.checkWidgetObject();
  }

  /**
   * Called once, before the instance is destroyed.
   */
  ngOnDestroy(): void {
    
  }

}
