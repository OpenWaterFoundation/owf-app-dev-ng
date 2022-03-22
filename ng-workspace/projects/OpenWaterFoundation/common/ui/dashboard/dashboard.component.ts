import { Component }        from '@angular/core';
import { ActivatedRoute }   from '@angular/router';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';


@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  dashboardConf: IM.DashboardConf;


  /**
   * 
   * @param owfCommonService The injected Common library service.
   * @param route The injected ActivatedRoute for determining the correct URL and
   * Dashboard to be displayed.
   */
  constructor(private owfCommonService: OwfCommonService,
              private route: ActivatedRoute) {}


  /**
   * Called right after the constructor.
   */
  ngOnInit(): void {
    var id = this.route.snapshot.paramMap.get('id');
    var dashboardConfigPath = this.owfCommonService.getDashboardConfigPathFromId(id);

    this.owfCommonService.getJSONData(this.owfCommonService.getAppPath() + dashboardConfigPath)
    .subscribe((dashboardConfig: IM.DashboardConf) => {
      this.dashboardConf = dashboardConfig;

      console.log(this.dashboardConf);
    });
  }

  setMatGridTileStyle(style: IM.WidgetTileStyle): any {
    return {
      backgroundColor: style.backgroundColor
    }
  }

}
