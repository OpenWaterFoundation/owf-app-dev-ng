import { AfterViewInit,
          Component }       from '@angular/core';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {

  tiles: IM.Tile[] = [
    { cols: 3, rows: 2, color: 'lightgrey', content: 'stuff' },
    { cols: 1, rows: 3, color: 'lightgrey', content: 'more stuff' },
    { cols: 1, rows: 1, color: 'lightgrey', content: 'stuff' },
    { cols: 2, rows: 1, color: 'lightgrey', content: 'stuff' },
    { cols: 2, rows: 1, color: 'lightgrey', content: 'stuff' },
    { cols: 1, rows: 1, color: 'lightgrey', content: 'stuff' },
    { cols: 1, rows: 1, color: 'lightgrey', content: 'stuff' },
    { cols: 4, rows: 2, color: 'lightgrey', content: 'map' },
  ];


  /**
   * 
   * @param owfCommonService The reference to the injected Common library.
   */
  constructor(private owfCommonService: OwfCommonService) {}

  /**
   * Called right after the constructor.
   */
  ngAfterViewInit(): void {
  }

  

}
