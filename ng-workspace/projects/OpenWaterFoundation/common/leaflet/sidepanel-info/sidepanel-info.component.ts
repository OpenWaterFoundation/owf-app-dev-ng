import { Component,
          Input,
          OnInit }           from '@angular/core';

import { OwfCommonService,
          Path }             from '@OpenWaterFoundation/common/services';
import { Observable } from 'rxjs';

@Component({
  selector: 'lib-sidepanel-info',
  templateUrl: './sidepanel-info.component.html',
  styleUrls: ['./sidepanel-info.component.css']
})
/**
 * NOTE: This component is not currently being used, because the sidebar package
 * might need the HTML to be a certain way in the Map component to work. As of now,
 * the code for this component resides in the Map component.
 */
export class SidepanelInfoComponent implements OnInit {

  /**
   * 
   */
  @Input('properties') properties: any;
  /**
   * 
   */
  @Input('appVersion') appVersion: any;
  /** String to be asynchronously retrieved from the `assets/version.json` file and
   * shown as the version of the InfoMapper. */
  @Input('projectVersion') projectVersion: Observable<string>;


  /**
   * 
   * @param commonService Reference to the injected Common library service.
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
