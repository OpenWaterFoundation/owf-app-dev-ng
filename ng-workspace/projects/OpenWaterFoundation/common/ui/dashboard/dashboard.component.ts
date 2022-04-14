import { Component,
          OnDestroy }       from '@angular/core';
import { ActivatedRoute }   from '@angular/router';

import { Subscription }     from 'rxjs';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';



@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnDestroy {

  /**
   * 
   */
  dashboardConf: IM.DashboardConf;
  /**
   * 
   */
  dashboardConfigPathSub$: Subscription;


  /**
   * 
   * @param commonService The injected Common library service.
   * @param route The injected ActivatedRoute for determining the correct URL and
   * Dashboard to be displayed.
   */
  constructor(private commonService: OwfCommonService,
              private route: ActivatedRoute) {}


  /**
   * Called right after the constructor.
   */
  ngOnInit(): void {
    var id = this.route.snapshot.paramMap.get('id');
    var dashboardConfigPath = this.commonService.getDashboardConfigPathFromId(id);

    this.dashboardConfigPathSub$ = this.commonService
    .getJSONData(this.commonService.getAppPath() + dashboardConfigPath)
    .subscribe((dashboardConfig: IM.DashboardConf) => {
      this.dashboardConf = dashboardConfig;
    });
  }

  /**
   * Called once, before the instance is destroyed.
   */
  ngOnDestroy(): void {
    this.dashboardConfigPathSub$.unsubscribe();
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
