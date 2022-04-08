import { Observable }       from 'rxjs/internal/Observable';
import { TS }               from '@OpenWaterFoundation/common/ts';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';

import * as Papa            from 'papaparse';
import { Subscriber } from 'rxjs';


// @dynamic
export class DelimitedDataStore {


  constructor() {}


  public static readDelimitedData(service: OwfCommonService, fullTSID: IM.TSID): Observable<any> {

    return new Observable((subscriber: Subscriber<any>) => {
      Papa.parse(service.buildPath(IM.Path.csvPath, [fullTSID.path]), {
        delimiter: ",",
        download: true,
        comments: "#",
        skipEmptyLines: true,
        header: true,
        complete: (result: any, file: any) => {
          subscriber.next(result);
          subscriber.complete();
        }
      });
    });
    
  }
}