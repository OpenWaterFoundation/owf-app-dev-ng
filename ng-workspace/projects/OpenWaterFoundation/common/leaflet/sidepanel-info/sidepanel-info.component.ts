import { Component,
          Input,
          OnInit }           from '@angular/core';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';

@Component({
  selector: 'lib-sidepanel-info',
  templateUrl: './sidepanel-info.component.html',
  styleUrls: ['./sidepanel-info.component.css']
})
export class SidepanelInfoComponent implements OnInit {

  @Input('properties') properties: any;
  @Input('appVersion') appVersion: any;
  @Input('projectVersion') projectVersion: any;

  constructor(private commonService: OwfCommonService) { }

  ngOnInit(): void {
    // Set the projectVersion class variable to an Observable that contains what was received
    // from the version.json file. The template will then use the async pipe to subscribe to it
    // and display the version.
    this.projectVersion = this.commonService.getJSONData('assets/version.json', IM.Path.vP);
  }

}
