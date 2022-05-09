import { Observable }       from 'rxjs/internal/Observable';
import { Subscriber }       from 'rxjs';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';

import * as Papa            from 'papaparse';


// @dynamic
export class DelimitedDatastore {


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
  static readDelimitedData(service: OwfCommonService, datastore: IM.Datastore, fullTSID: IM.TSID): Observable<any> {

    var convertedPath: string;

    if (datastore.rootUrl !== null) {
      convertedPath = DelimitedDatastore.convertPath(datastore.rootUrl, fullTSID.path);
    } else {
      convertedPath = fullTSID.path
    }

    return new Observable((subscriber: Subscriber<any>) => {
      Papa.parse(service.buildPath(IM.Path.csvPath, [convertedPath]), {
        delimiter: ",",
        download: true,
        comments: "#",
        skipEmptyLines: true,
        header: true,
        complete: (result: Papa.ParseResult<any>) => {
          subscriber.next(result);
          subscriber.complete();
        },
        error: (error: Papa.ParseError) => {
          subscriber.next({ error: "An error has occurred." });
          subscriber.complete();
        }
      });
    });
  }
}