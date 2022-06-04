import { Component,
          OnDestroy }       from '@angular/core';
import { ActivatedRoute }   from '@angular/router';

import { Subscription }     from 'rxjs';

import { EventService,
          OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';

import { DashboardService } from './dashboard.service';


@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnDestroy {

  /** The dashboard configuration object read in from the JSON file. */
  dashboardConf: IM.DashboardConf;
  /** Subscription used when reading in the dashboard configuration file. */
  dashboardConfigPathSub$: Subscription;

  routeSub$: Subscription;


  /**
   * 
   * @param commonService The injected Common library service.
   * @param route The injected ActivatedRoute for determining the correct URL and
   * Dashboard to be displayed.
   */
  constructor(private commonService: OwfCommonService,
    private dashboardService: DashboardService,
    private eventService: EventService,
    private route: ActivatedRoute) {}


  /**
   * Checks if the dashboard configuration was correctly made by confirming the
   * following:
   *   1. All widget name properties are unique.
   *   2. All widgets contain a type property.
   *   3. All widget types are currently supported.
   */
  private checkDashboardConfig(dashboardConfig: IM.DashboardConf): void {

    var uniqueKeys = {};

    dashboardConfig.widgets.forEach((widget: IM.DashboardWidget) => {

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
   * Called right after the constructor.
   */
  ngOnInit(): void {

    this.routeSub$ = this.route.paramMap.subscribe((paramMap) => {
      var id = paramMap.get('id');
      var dashboardConfigPath = this.commonService.getDashboardConfigPathFromId(id);
  
      this.dashboardConfigPathSub$ = this.commonService
      .getJSONData(this.commonService.getAppPath() + dashboardConfigPath)
      .subscribe((dashboardConfig: IM.DashboardConf) => {
  
        this.checkDashboardConfig(dashboardConfig);
        this.dashboardConf = dashboardConfig;
        this.eventService.createListenedToWidgets(dashboardConfig);
      });
    });
  }

  /**
   * Called once, before the instance is destroyed.
   */
  ngOnDestroy(): void {
    if (this.dashboardConfigPathSub$) {
      this.dashboardConfigPathSub$.unsubscribe();
    }
  }

  /**
   * Manipulates the style object given in the dashboard configuration file,
   * and adds in any default settings including the entire object if necessary.
   * @param style The style object to check.
   * @returns A style object that has had its properties verified.
   */
  setMatGridTileStyle(style: IM.WidgetTileStyle): any {
    // If no style object is provided, return the default object.
    if (!style) {
      return {
        backgroundColor: 'gray'
      }
    }

    return {
      backgroundColor: this.verify(style.backgroundColor, IM.Style.backgroundColor),
      color: this.verify(style.textColor, IM.Style.color)
    }
  }

  /**
   * Sets a style object's property to a default if it isn't provided in the dashboard
   * configuration file.
   * @param styleProp The style property to examine.
   * @param style The InfoMapper style type to differentiate types.
   */
  verify(styleProp: any, style: IM.Style): any {
    if (styleProp) {
      return styleProp;
    }
    // The property does not exist, so return a default value.
    else {
      switch (style) {
        case IM.Style.backgroundColor: return 'gray';
        case IM.Style.color: return 'black';
      }
    }
  }

}
