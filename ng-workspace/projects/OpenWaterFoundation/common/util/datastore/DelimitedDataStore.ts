import { Observable }       from 'rxjs/internal/Observable';
import { Subscriber }       from 'rxjs';

import { Datastore, OwfCommonService, Path, TSID } from '@OpenWaterFoundation/common/services';

import * as Papa            from 'papaparse';


// @dynamic
export class DelimitedDatastore {


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
   * Uses Papaparse to read in delimited data into an object.
   * @param commonService The top level Common library service for utility methods. 
   * @param datastore The Datastore object from the Datastore manager.
   * @param fullTSID TSID object that has been parsed from a full TSID string.
   * @returns The delimited data from the datastore as an observable.
   */
  static readDelimitedData(commonService: OwfCommonService, datastore: Datastore, fullTSID: TSID): Observable<any> {

    var convertedPath: string;

    if (datastore.rootUrl !== null && !commonService.isURL(fullTSID.path)) {
      convertedPath = DelimitedDatastore.convertPath(datastore.rootUrl, fullTSID.path);
    } else {
      convertedPath = fullTSID.path
    }

    return new Observable((subscriber: Subscriber<any>) => {
      Papa.parse(commonService.buildPath(Path.csvPath, [convertedPath]), {
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