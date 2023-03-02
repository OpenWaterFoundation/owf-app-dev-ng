import { Component,
          OnDestroy,
          OnInit }    from '@angular/core';
import { ActivatedRoute,
          ParamMap, 
          Router}     from '@angular/router';
import { first,
          Subject,
          takeUntil } from 'rxjs';

import { CommonLoggerService,
          OwfCommonService, 
          StoryConf } from '@OpenWaterFoundation/common/services';

@Component({
  selector: 'common-lib-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.css']
})
export class StoryComponent implements OnInit, OnDestroy {

  /** Options for fullpage creation. */
  config: any;
  /** The current URL of this component. Used for displaying each stories URL fragment. */
  currentURL: string;
  /** Reference for the main fullpage object. */
  fullpageAPI: any;
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
  /**
   * 
   */
  storyConf: StoryConf;
  /**
   * 
   */
  validStoryId: boolean;


  /**
   * Constructor for the Story Component.
   * @param actRoute Provides access to information about a route associated with
   * a component that is loaded in an outlet.
   * @param logger Reference to the Common library logger service.
   */
  constructor(
    private actRoute: ActivatedRoute,
    private commonService: OwfCommonService,
    private logger: CommonLoggerService,
    private router: Router
  ) {
    
  }


  /**
   * Creates an array of strings with data to used by Fullpage for Story creation.
   * @param optType String representing the desired option type.
   * @returns An array of strings connected to the given option type.
   */
  private createOptionArray(optType: string): string[] {
    var optionArray: string[] = [];

    for (let chapter of this.storyConf.story.chapters) {
      for (let page of chapter.pages) {
        optionArray.push(page.metadata[optType]);
      }
    }
    return optionArray;
  }

  /**
   * Set the config options that will be given to 
   */
  createFullpageOptions(): void {
    this.config = {
      // Navigation.
      menu: '#story-menu',
      anchors: this.createOptionArray('id'),
      navigation: true,
      navigationPosition: 'right',
      navigationTooltips: this.createOptionArray('title'),
      slidesNavigation: true,
      // Scrolling.
      scrollingSpeed: 600,
      touchSensitivity: 25,
      // Accessibility.
      recordHistory: false,
      // Design.
      conrolArrows: false,
      //   Takes care of the extra 64 pixels added because of the navbar.
      paddingBottom: '64px',
      sectionsColor: ['#B8AE9C', '#348899', '#F2AE72', '#5C832F', '#B8B89F'],
      // Custom selectors.
      // Misc.
      licenseKey: 'OPEN-SOURCE-GPLV3-LICENSE',
      // Events...
    };
  }

  /**
   * 
   * @param fullPageRef 
   */
  getRef(fullPageRef: any) {
    this.fullpageAPI = fullPageRef;
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive. Called after the constructor.
   */
  ngOnInit(): void {

    this.actRoute.paramMap.pipe(takeUntil(this.destroyed)).subscribe((paramMap: ParamMap) => {

      this.debugFlag = this.actRoute.snapshot.queryParamMap.get('debug');
      this.debugLevelFlag = this.actRoute.snapshot.queryParamMap.get('debugLevel');
      this.logger.print('info', 'StoryComponent.ngOnInit - Story initialization.');

      this.currentURL = this.router.url.split('#')[0].substring(1);

      var storyId = paramMap.get('id');
      this.validStoryId = this.commonService.validID(storyId);
      if (this.validStoryId === false) {
        return;
      }
      
      this.readStoryConfig(storyId);
    });
  }
  
  /**
   * 
   */
  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  /**
   * 
   * @param storyId 
   */
   private readStoryConfig(storyId: string): void {
    var storyConfigPath = this.commonService.getStoryConfigPathFromId(storyId);

    this.commonService.getJSONData(this.commonService.getAppPath() + storyConfigPath)
    .pipe(first()).subscribe((storyConfig: StoryConf) => {

      this.storyInit(storyConfig);
    });
  }

  /**
   * 
   * @param storyConfig 
   */
  private storyInit(storyConfig: StoryConf): void {
    this.storyConf = storyConfig;
    this.createFullpageOptions();
  }

}
