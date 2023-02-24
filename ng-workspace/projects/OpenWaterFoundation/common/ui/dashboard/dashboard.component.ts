import { Component,
          Input,
          OnDestroy }        from '@angular/core';
import { ActivatedRoute }    from '@angular/router';

import { Subscription }      from 'rxjs';
import { first }             from 'rxjs/operators';

import { EventService,
          OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM               from '@OpenWaterFoundation/common/services';

import { DashboardService }  from './dashboard.service';


@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnDestroy {

  /** The dashboard configuration object read in from the JSON file. */
  dashboardConf: IM.DashboardConf;
  /**
   * 
   */
  displayedInStory = false;
  /** Subscription for updating the route for this component. Unsubscribed to in
   * ngDestroy. */
  routeSub: Subscription;
  /**
   * A dashboard config object passed in from a 
   */
  @Input('dashboardConfig') standaloneDashboardConf: IM.DashboardConf;
  /** `true` if the id in the URL matches an id from the `app-config.json` file.
   * `false` if not, and the 404 page will show. */
  validDashboardId: boolean;

  /**
   * 
   * @param commonService The injected Common library service.
   * @param route The injected ActivatedRoute for determining the correct URL and
   * Dashboard to be displayed.
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
   * 
   */
  private dashboardInit(dashboardConfig: IM.DashboardConf): void {
    this.checkDashboardConfig(dashboardConfig);
    this.dashboardConf = dashboardConfig;

    if (!this.dashboardConf) {
      return;
    }
    this.eventService.createListenedToWidgets(dashboardConfig);
  }

  /**
   * Called right after the constructor.
   */
  ngOnInit(): void {

    this.routeSub = this.route.paramMap.subscribe((paramMap) => {

      var dashboardId = paramMap.get('id');
      this.validDashboardId = this.commonService.validID(dashboardId);
      if (this.validDashboardId === false) {
        return;
      }
      
      // The dashboard component is being created and used in another component's
      // template and has provided the dashboardConfig property.
      if (!this.standaloneDashboardConf) {
        this.readDashboardConfig(dashboardId);
      } else {
        this.displayedInStory = true;
        this.dashboardInit(this.standaloneDashboardConf);
      }
      
  
      
    });
  }

  /**
   * Called once, before the instance is destroyed.
   */
  ngOnDestroy(): void { }

  /**
   * 
   * @param dashboardId 
   */
  private readDashboardConfig(dashboardId: string): void {
    var dashboardConfigPath = this.commonService.getDashboardConfigPathFromId(dashboardId);

    this.commonService.getJSONData(this.commonService.getAppPath() + dashboardConfigPath)
    .pipe(first()).subscribe((dashboardConfig: IM.DashboardConf) => {

      this.dashboardInit(dashboardConfig);
    });
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
        backgroundColor: 'lightgrey'
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
        case IM.Style.backgroundColor: return 'lightgrey';
        case IM.Style.color: return 'black';
      }
    }
  }

}
