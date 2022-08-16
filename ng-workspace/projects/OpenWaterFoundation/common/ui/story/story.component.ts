import { Component,
          OnDestroy,
          OnInit }             from '@angular/core';
import { ActivatedRoute,
          ParamMap }           from '@angular/router';
import { Subject,
          takeUntil }          from 'rxjs';

import { options,
          fullpage_api }       from 'fullpage.js/dist/fullpage.extensions.min';

import { CommonLoggerService,
          OwfCommonService }   from '@OpenWaterFoundation/common/services';

@Component({
  selector: 'common-lib-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.css']
})
export class StoryComponent implements OnInit, OnDestroy {

  config: options;
  fullpageAPI: fullpage_api;
  /** Subject that is completed when this component is destroyed. The breakpoint
   * observer will stop listening to screen size at that time. */
  destroyed = new Subject<void>();
  /** Can be set to `true` if the debug query parameter is given for debugging purposes,
   * otherwise will be null. */
  debugFlag: string = null;
  /** Can be set to
    * * `trace` - Will show all logging messages in the application. Meant for
    * in-depth debugging.
    * * `warn` - Will display any warning messages throughout the application. For
    * less in-depth debugging. */
  debugLevelFlag: string = null;


  constructor(private actRoute: ActivatedRoute, private commonService: OwfCommonService,
  private logger: CommonLoggerService) {

    // for more details on config options please visit fullPage.js docs
    this.config = {
      // Navigation.
      anchors: ['firstPage', 'secondPage', 'thirdPage', 'fourthPage'],
      navigation: true,
      navigationPosition: 'right',
      slidesNavigation: true,

      // Scrolling.
      scrollingSpeed: 600,

      // Accessibility.
      recordHistory: false,
      
      // Design.
      conrolArrows: false,
      sectionsColor: ['#B8AE9C', '#348899', '#F2AE72', '#5C832F', '#B8B89F'],

      // Custom selectors.

      // Misc.
      licenseKey: 'OPEN-SOURCE-GPLV3-LICENSE',

      // Events.
      // fullpage callbacks
      // afterResize: () => {
      //   console.log("After resize");
      // },
      // afterLoad: (origin, destination, direction) => {
      //   console.log(origin.index);
      // }
    };
  }

  getRef(fullPageRef: any) {
    this.fullpageAPI = fullPageRef;
  }


  ngOnInit(): void {

    this.actRoute.paramMap.pipe(takeUntil(this.destroyed)).subscribe((paramMap: ParamMap) => {

      this.debugFlag = this.actRoute.snapshot.queryParamMap.get('debug');
      this.debugLevelFlag = this.actRoute.snapshot.queryParamMap.get('debugLevel');
      this.logger.print('info', 'StoryComponent.ngOnInit - Story component created.');
      

    });
  }
  
  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

}
