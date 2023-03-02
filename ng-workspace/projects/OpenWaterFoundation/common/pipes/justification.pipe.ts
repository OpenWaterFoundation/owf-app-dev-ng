import { Pipe,
          PipeTransform }   from '@angular/core';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';


@Pipe({ name: 'justification' })

/**
 * This pure pipe will be called  This pipe determines a table's content justification in a cell,
 * or whether the table's cell is a URL.
 */
export class JustificationPipe implements PipeTransform {


  /**
   * Constructor for the JustificationPipe.
   * @param commonService Reference to the injected Common library service.
   */
  constructor(private commonService: OwfCommonService) {

  }


  /**
   * Determines the justification of a table cell's content, or whether the content
   * is a URL based on if the @param checkUrl is provided.
   */
  transform(cellContent: string, checkUrl?: boolean): any {

    if (checkUrl) {
       return this.commonService.isURL(cellContent);
    }
    else {
      if (this.commonService.isURL(cellContent)) {
        return 'url';
      } else if (isNaN(Number(cellContent))) {
        return 'left';
      } else {
        return 'right';
      }
    }
  }

}
