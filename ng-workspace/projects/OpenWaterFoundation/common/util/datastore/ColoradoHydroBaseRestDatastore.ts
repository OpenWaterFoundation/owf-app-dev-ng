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
   * 
   * @param service 
   * @param datastore 
   * @param fullTSID 
   * @returns 
   */
  public static getData(service: OwfCommonService, datastore: IM.Datastore, fullTSID: IM.TSID): Observable<TS> {

    console.log(datastore);
    console.log(fullTSID);


    return;
  }
}