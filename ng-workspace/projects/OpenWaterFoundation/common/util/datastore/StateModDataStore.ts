import { Observable }       from 'rxjs/internal/Observable';
import { TS }               from '@OpenWaterFoundation/common/ts';

import { StateModTS }       from '@OpenWaterFoundation/common/dwr/statemod';
import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';


// @dynamic
export class StateModDataStore {


  constructor() {}


  public static readTimeSeries(service: OwfCommonService, TSID: IM.TSID): Observable<TS> {
    var stateModTS = new StateModTS(service);
    
    

    return stateModTS.readTimeSeries(TSID.location, service.buildPath(IM.Path.sMP, [TSID.path]),
      null,
      null,
      null,
      true);
  }
}