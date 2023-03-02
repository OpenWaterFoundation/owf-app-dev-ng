import { Observable }       from 'rxjs/internal/Observable';
import { TS }               from '@OpenWaterFoundation/common/ts';

import { DateValueTS }      from '@OpenWaterFoundation/common/ts';
import { Datastore, OwfCommonService, Path, TSID } from '@OpenWaterFoundation/common/services';


// @dynamic
export class DateValueDatastore {


  constructor() {}


  /**
   * @param rootUrl The rootURL from the datastore object.
   * @param path The path from the TSID string.
   * @returns The converted path with the rootURL and TSID path property correctly
   * combined.
   */
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

  /**
   * Sets up and calls the DateValueTS class's readTimeSeries() method to read in
   * and create a TS object.
   * @param commonService Reference to the injected Common library service.
   * @param datastore The Datastore object from the Datastore manager.
   * @param fullTSID TSID object that has been parsed from a full TSID string.
   * @returns The DateValue data as an observable of type TS.
   */
  static readTimeSeries(commonService: OwfCommonService, datastore: Datastore, fullTSID: TSID): Observable<TS> {

    var convertedPath: string;

    if (datastore.rootUrl !== null && !commonService.isURL(fullTSID.path)) {
      convertedPath = DateValueDatastore.convertPath(datastore.rootUrl, fullTSID.path);
    } else {
      convertedPath = fullTSID.path
    }

    return new DateValueTS(commonService).readTimeSeries(
      fullTSID.location,
      commonService.buildPath(Path.sMP, convertedPath),
      null,
      null,
      null,
      true
    );
  }
}