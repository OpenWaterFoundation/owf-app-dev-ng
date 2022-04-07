import { Observable }       from 'rxjs/internal/Observable';
import { TS }               from '@OpenWaterFoundation/common/ts';

import { StateModTS }       from '@OpenWaterFoundation/common/dwr/statemod';
import { OwfCommonService } from '@OpenWaterFoundation/common/services';


// @dynamic
export class FileDataStore {


  constructor() {}


  // public static readCSV(service: OwfCommonService, path: string): Observable<TS> {
  //   var stateModTS = new StateModTS(service);

  //   return stateModTS.readTimeSeries(TSIDLocation, service.buildPath(TSFile, [path]),
  //     null,
  //     null,
  //     null,
  //     true);
  // }
}