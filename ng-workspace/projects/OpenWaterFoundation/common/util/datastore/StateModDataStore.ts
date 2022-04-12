import { Observable }       from 'rxjs/internal/Observable';
import { TS }               from '@OpenWaterFoundation/common/ts';

import { StateModTS }       from '@OpenWaterFoundation/common/dwr/statemod';
import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';


// @dynamic
export class StateModDatastore {


  constructor() {}

  private convertPath(): string {
    return;
  }


  public static readTimeSeries(service: OwfCommonService, datastore: IM.Datastore, fullTSID: IM.TSID): Observable<TS> {

    var convertedPath: string;

    if (datastore.rootUrl !== null) {
      convertedPath = datastore.rootUrl + fullTSID.path
    } else {
      convertedPath = fullTSID.path
    }

    console.log('convertedPath:', convertedPath);

    return new StateModTS(service).readTimeSeries(
      fullTSID.location,
      service.buildPath(IM.Path.sMP, [convertedPath]),
      null,
      null,
      null,
      true
    );
  }
}