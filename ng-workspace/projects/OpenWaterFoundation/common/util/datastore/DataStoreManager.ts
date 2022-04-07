import { Observable }         from 'rxjs/internal/Observable';
import { TS }                 from '@OpenWaterFoundation/common/ts';

import { OwfCommonService }   from '@OpenWaterFoundation/common/services';
import * as IM                from '@OpenWaterFoundation/common/services';

import { StateModDataStore }  from './StateModDataStore';
import { DateValueDataStore } from './DateValueDataStore';


/**
 * 
 */
// @dynamic
export class DataStoreManager {

  /** The instance of this MapLayerManager object. */
  private static instance: DataStoreManager;


  private constructor() {}


  /**
   * Only one instance of this MapLayerManager can be used at one time, making it
   * a singleton class.
   */
  public static getInstance(): DataStoreManager {
    if (!DataStoreManager.instance) { DataStoreManager.instance = new DataStoreManager(); }
    return DataStoreManager.instance;
  }

  /**
   * 
   * @param dataStore 
   */
  private getDataStoreType(dataStore: string): IM.DataStore {
    if (dataStore.toUpperCase().includes('STM') || dataStore.toUpperCase().includes('STATEMOD')) {
      return IM.DataStore.stateMod;
    } else if (dataStore.toUpperCase().includes('DV') || dataStore.toUpperCase().includes('DATEVALUE')) {
      return IM.DataStore.dateValue;
    }
  }

  /**
   * 
   * @param service 
   * @param graphData 
   * @returns 
   */
  public readTimeSeries(service: OwfCommonService, graphData: IM.GraphData): Observable<TS> {

    var TSID = service.parseTSID(graphData.properties.TSID);

    var dataStore = this.getDataStoreType(TSID.dataStore);

    switch(dataStore) {
      // case IM.DataStore.dateValue: return DateValueDataStore.readTimeSeries(service, TSID);
      case IM.DataStore.stateMod: return StateModDataStore.readTimeSeries(service, TSID);
      default: console.error('Unknown DataStore.');
    }
  }
}