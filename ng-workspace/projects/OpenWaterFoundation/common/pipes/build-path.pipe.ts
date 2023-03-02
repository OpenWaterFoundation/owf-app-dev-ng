import {
  Pipe,
  PipeTransform
} from '@angular/core';

import {
  OwfCommonService,
  Path
} from '@OpenWaterFoundation/common/services';

@Pipe({ name: 'buildPath' })
export class BuildPathPipe implements PipeTransform {


  /**
   * Constructor for the BuildPathPipe.
   * @param commonService Reference to the injected Common library service.
   */
  constructor(private commonService: OwfCommonService) {
    
  }


  /**
   * Builds the correct path to a file for the InfoMapper based on the path type.
   * @param pathType The type of path to build.
   * @param path The path to use for building.
   * @returns The full built path to the InfoMapper file.
   */
  transform(pathType: Path, path: string): string {
    return this.commonService.buildPath(pathType, path);
  }

}
