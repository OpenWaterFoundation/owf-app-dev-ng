import { Observable }       from 'rxjs/internal/Observable';
import { TS }               from '@OpenWaterFoundation/common/ts';

import { DateValueTS }      from '@OpenWaterFoundation/common/ts';
import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';


// @dynamic
export class DateValueDataStore {


  constructor() {}


  public static readTimeSeries(service: OwfCommonService, fullTSID: IM.TSID): Observable<TS> {

    return new DateValueTS(service).readTimeSeries(
      fullTSID.location,
      service.buildPath(IM.Path.sMP, [fullTSID.path]),
      null,
      null,
      null,
      true
    );
  }
}