import {
  Pipe,
  PipeTransform
} from '@angular/core';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';

@Pipe({ name: 'buildPath' })
export class BuildPathPipe implements PipeTransform {

  constructor(private commonService: OwfCommonService) { }

  transform(pathType: string, path: string): string {
    return this.commonService.buildPath(pathType, [path]);
  }

}
