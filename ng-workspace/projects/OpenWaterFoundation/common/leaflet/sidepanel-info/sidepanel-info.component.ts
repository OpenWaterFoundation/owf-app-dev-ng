import { Component,
          Input,
          OnInit }           from '@angular/core';

import { OwfCommonService,
          Path }             from '@OpenWaterFoundation/common/services';

@Component({
  selector: 'lib-sidepanel-info',
  templateUrl: './sidepanel-info.component.html',
  styleUrls: ['./sidepanel-info.component.css']
})
export class SidepanelInfoComponent implements OnInit {

  /**
   * 
   */
  @Input('properties') properties: any;
  /**
   * 
   */
  @Input('appVersion') appVersion: any;
  /**
   * 
   */
  @Input('projectVersion') projectVersion: any;


  /**
   * 
   * @param commonService 
   */
  constructor(private commonService: OwfCommonService) { }


  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive. Called after the constructor.
   */
  ngOnInit(): void {
    // Set the projectVersion class variable to an Observable that contains what was received
    // from the version.json file. The template will then use the async pipe to subscribe to it
    // and display the version.
    this.projectVersion = this.commonService.getJSONData('assets/version.json', Path.vP);
  }

}
