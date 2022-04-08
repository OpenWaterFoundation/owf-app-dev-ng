import { Observable }         from 'rxjs/internal/Observable';
import { of }                 from 'rxjs';

import { TS }                 from '@OpenWaterFoundation/common/ts';
import { OwfCommonService }   from '@OpenWaterFoundation/common/services';
import * as IM                from '@OpenWaterFoundation/common/services';

import { DateValueDataStore } from './DateValueDataStore';
import { DelimitedDataStore } from './DelimitedDataStore';
import { StateModDataStore }  from './StateModDataStore';


/**
 * 
 */
// @dynamic
export class DataStoreManager {

  // The hard coded 'built in' DataStores for the Common library.
  readonly builtInDataStores: IM.DataStore[] = [
    {
      name: "Delimited",
      type: "owf.datastore.delimited",
      rootUrl: null,
      aliases: [ 'csv' ]
    },
    {
      name: "DateValue",
      type: "owf.datastore.datevalue",
      rootUrl: null,
      aliases: [ 'dv' ]
    },
    {
      name: "StateMod",
      type: "owf.datastore.statemod",
      rootUrl: null,
      aliases: [ 'stm' ]
    }
  ];

  private userDataStores: IM.DataStore[] = [];
  /** The singleton instance of this MapLayerManager class. */
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
   * @param service 
   * @param TSID 
   * @returns 
   */
  public getDataStoreData(service: OwfCommonService, TSID: string): Observable<any> {
    // Parse the TSID string into the TSID object.
    var fullTSID = service.parseTSID(TSID);
    var dataStore = this.getDataStoreType(fullTSID.dataStore);

    switch(dataStore) {
      case IM.DataStoreType.delimited:
        return DelimitedDataStore.readDelimitedData(service, fullTSID);
      case IM.DataStoreType.dateValue:
        return DateValueDataStore.readTimeSeries(service, fullTSID);
      case IM.DataStoreType.stateMod:
        return StateModDataStore.readTimeSeries(service, fullTSID);
      case 'unknown':
      default: console.error('Unsupported DataStore.'); return of(null);
    }
  }

  /**
   * Looks through the list of built in DataStore names & aliases, then user DataStore
   * names & aliases in that order, and checks if the provided string matches them.
   * @param dataStoreStr The dataStore string from the full TSID.
   * @returns A string of the DataStoreType.
   */
  private getDataStoreType(dataStoreStr: string): string {

    // First try checking each dataStore's name property.
    for (let dataStore of this.builtInDataStores) {
      if (dataStore.name.toUpperCase() === dataStoreStr.toUpperCase()) {
        return dataStore.type;
      } 
      // If the exact name not found, try each alias.
      if (dataStore.aliases) {
        for (let alias of dataStore.aliases) {
          if (alias.toUpperCase() === dataStoreStr.toUpperCase()) {
            return dataStore.type;
          }
        }
      }
    }

    return 'unknown';
  }

  /**
   * 
   * @param service 
   * @param TSID 
   */
  public initReadDelimitedData(service: OwfCommonService, TSID: string) {
    // Parse the TSID string into the TSID object.
    var fullTSID = service.parseTSID(TSID);
    var dataStore = this.getDataStoreType(fullTSID.dataStore);

    switch(dataStore) {
      // case IM.DataStoreType.delimited: return DelimitedDataStore.readDelimitedData(service, fullTSID);
      case 'unknown':
      default: console.error('Unsupported DataStore.');
    }
  }

  /**
   * Performs the actions necessary to set up a Time Series DataStore so it can
   * call its readTimeSeries function.
   * @param service The OwfCommonService to be used in the DataStore.
   * @param TSID The full TSID string to be used in the time series creation.
   * @returns A TS object as an observable.
   */
  public getTimeSeries(service: OwfCommonService, TSID: string): Observable<TS> {
    // Parse the TSID string into the TSID object.
    var fullTSID = service.parseTSID(TSID);

    var dataStore = this.getDataStoreType(fullTSID.dataStore);

    switch(dataStore) {
      // case IM.DataStoreType.dateValue: return DateValueDataStore.readTimeSeries(service, TSID);
      case IM.DataStoreType.stateMod: return StateModDataStore.readTimeSeries(service, fullTSID);
      case 'unknown':
      default: console.error('Unsupported DataStore.'); return of(null);
    }
  }
}