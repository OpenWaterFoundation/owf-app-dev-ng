import { Observable }       from 'rxjs/internal/Observable';
import { TS }               from '@OpenWaterFoundation/common/ts';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';


// @dynamic
export class ColoradoHydroBaseRestDatastore {


  constructor() {}


  /**
   * 
   * @param rootUrl 
   * @param path 
   * @returns 
   */
  private static convertPath(service: OwfCommonService, rootUrl: string, path: string): string {

    // service.obtainPropertiesFromLine(path, something);

    if (path.startsWith('/')) {
      return rootUrl + path.substring(1);
    } else {
      return rootUrl + path;
    }
  }

  /**
   * 
   * @param service 
   * @param datastore 
   * @param fullTSID 
   * @returns 
   */
  public static getData(service: OwfCommonService, datastore: IM.Datastore, fullTSID: IM.TSID): Observable<TS> {

    var fullURL = ColoradoHydroBaseRestDatastore.convertPath(service, datastore.rootUrl, fullTSID.path);

    console.log('datastore:', datastore);
    console.log('fullTSID:', fullTSID);
    console.log('fullURL:', fullURL);

    throw new Error('Not really an error.');
    return;
  }
}