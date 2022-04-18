import { Observable }       from 'rxjs/internal/Observable';
import { TS }               from '@OpenWaterFoundation/common/ts';

import { StateModTS }       from '@OpenWaterFoundation/common/dwr/statemod';
import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';


// @dynamic
export class StateModDatastore {


  constructor() {}


  private static convertPath(rootUrl: string, path: string): string {

    if (rootUrl.endsWith('/') && path.startsWith('/')) {
      return rootUrl + path.substring(1);
    } else if (!rootUrl.endsWith('/') && path.startsWith('/') ||
    rootUrl.endsWith('/') && !path.startsWith('/')) {
      return rootUrl + path;
    } else if (!rootUrl.endsWith('/') && !path.startsWith('/')) {
      return rootUrl + '/' + path;
    }
    return;
  }

  public static readTimeSeries(service: OwfCommonService, datastore: IM.Datastore, fullTSID: IM.TSID): Observable<TS> {

    var convertedPath: string;

    if (datastore.rootUrl !== null) {
      convertedPath = StateModDatastore.convertPath(datastore.rootUrl, fullTSID.path);
    } else {
      convertedPath = fullTSID.path
    }

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