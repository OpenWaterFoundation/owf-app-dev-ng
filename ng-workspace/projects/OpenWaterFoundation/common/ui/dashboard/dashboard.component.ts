import { Component,
          Input }           from '@angular/core';
import { ActivatedRoute }   from '@angular/router';

import { Subscription }     from 'rxjs';
import { first }            from 'rxjs/operators';

import { DashboardConf,
          DashboardWidget,
          EventService,
          OwfCommonService, 
          Style,
          WidgetTileStyle } from '@OpenWaterFoundation/common/services';

import { DashboardService } from './dashboard.service';


@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  /** The dashboard configuration object read in from the JSON file. */
  dashboardConf: DashboardConf;
  /**
   * 
   */
  displayedInStory = false;
  /** Subscription for updating the route for this component. Unsubscribed to in
   * ngDestroy. */
  routeSub: Subscription;
  /**
   * A dashboard config object passed in from a parent component
   */
  @Input('dashboardConfig') embeddedDashboardConf: DashboardConf;
  /** `true` if the id in the URL matches an id from the `app-config.json` file.
   * `false` if not, and the 404 page will show. */
  validDashboardId: boolean;

  /**
   * 
   * @param route The injected ActivatedRoute for determining the correct URL and
   * Dashboard to be displayed.
   */
  /**
   * 
   * @param commonService Reference to the injected Common library service.
   * @param dashboardService The injected dashboard service.
   * @param eventService 
   * @param route 
   */
  constructor(
    private commonService: OwfCommonService,
    private dashboardService: DashboardService,
    private eventService: EventService,
    private route: ActivatedRoute
  ) {
    
  }


  /**
   * Checks if the dashboard configuration was correctly made by confirming the
   * following:
   *   1. All widget name properties are unique.
   *   2. All widgets contain a `type` property.
   *   3. All widget types are currently supported.
   */
  private checkDashboardConfig(dashboardConfig: DashboardConf): void {

    var uniqueKeys = {};

    dashboardConfig.widgets.forEach((widget: DashboardWidget) => {

      widget.errorTypes = [];

      if (!widget.type) {
        widget.errorTypes.push('no type');
      } else if (this.dashboardService.isSupportedWidgetType(widget) === false) {
        widget.errorTypes.push('unsupported type');
      }

      uniqueKeys[widget.name] = 'name';
    });

    if (dashboardConfig.widgets.length !== Object.keys(uniqueKeys).length) {
      console.warn("Multiple widget objects from the Dashboard configuration file " +
      "contain the same name, and can cause undesired behavior for event handling.");
    }

  }

  /**
   * 
   */
  private dashboardInit(dashboardConfig: DashboardConf): void {
    this.checkDashboardConfig(dashboardConfig);
    this.dashboardConf = dashboardConfig;

    if (!this.dashboardConf) {
      return;
    }
    this.eventService.createListenedToWidgets(dashboardConfig);
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive. Called after the constructor.
   */
  ngOnInit(): void {

    this.routeSub = this.route.paramMap.subscribe((paramMap) => {

      var dashboardId = paramMap.get('id');
      this.validDashboardId = this.commonService.validID(dashboardId);
      if (this.validDashboardId === false) {
        return;
      }

      // The dashboard config object has been provided in the another config file
      // and has already been read in by that component.
      if (this.embeddedDashboardConf) {
        this.displayedInStory = true;
        this.dashboardInit(this.embeddedDashboardConf);
      }
      // The dashboard is being created as a 'standalone' component.
      if (!this.embeddedDashboardConf) {
        this.readDashboardConfig(dashboardId);
      }
    });
  }

  /**
   * Asynchronously reads in the dashboard configuration file
   * @param dashboardId 
   */
  private readDashboardConfig(dashboardId: string): void {
    var dashboardConfigPath = this.commonService.getDashboardConfigPathFromId(dashboardId);

    this.commonService.getJSONData(this.commonService.getAppPath() + dashboardConfigPath)
    .pipe(first()).subscribe((dashboardConfig: DashboardConf) => {

      this.dashboardInit(dashboardConfig);
    });
  }

  /**
   * Manipulates the style object given in the dashboard configuration file,
   * and adds in any default settings including the entire object if necessary.
   * @param style The style object to check.
   * @returns A style object that has had its properties verified.
   */
  setMatGridTileStyle(style: WidgetTileStyle): any {
    // If no style object is provided, return the default object.
    if (!style) {
      return {
        backgroundColor: 'lightgrey'
      }
    }

    return {
      backgroundColor: this.verify(style.backgroundColor, Style.backgroundColor),
      color: this.verify(style.textColor, Style.color)
    }
  }

  /**
   * Sets a style object's property to a default if it isn't provided in the dashboard
   * configuration file.
   * @param styleProp The style property to examine.
   * @param style The InfoMapper style type to differentiate types.
   */
  verify(styleProp: any, style: Style): any {
    if (styleProp) {
      return styleProp;
    }
    // The property does not exist, so return a default value.
    else {
      switch (style) {
        case Style.backgroundColor: return 'lightgrey';
        case Style.color: return 'black';
      }
    }
  }

}
