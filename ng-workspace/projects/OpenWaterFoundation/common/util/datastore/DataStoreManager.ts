import { Observable }         from 'rxjs/internal/Observable';
import { of }                 from 'rxjs';

import { OwfCommonService }   from '@OpenWaterFoundation/common/services';
import * as IM                from '@OpenWaterFoundation/common/services';

import { DateValueDatastore } from './DateValueDatastore';
import { DelimitedDatastore } from './DelimitedDatastore';
import { StateModDatastore }  from './StateModDatastore';


/**
 * 
 */
// @dynamic
export class DatastoreManager {

  // The hard coded 'built in' Datastores for the Common library.
  private readonly builtInDatastores: IM.Datastore[] = [
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

  private userDatastores: IM.Datastore[] = [];
  /** The singleton instance of this MapLayerManager class. */
  private static instance: DatastoreManager;


  private constructor() {}


  /**
   * Only one instance of this MapLayerManager can be used at one time, making it
   * a singleton class.
   */
  public static getInstance(): DatastoreManager {
    if (!DatastoreManager.instance) { DatastoreManager.instance = new DatastoreManager(); }
    return DatastoreManager.instance;
  }

  /**
   * @param service The OWF service for fetching data.
   * @param TSID The full TSID string.
   * @returns The data from the requested Datastore as an observable.
   */
  public getDatastoreData(service: OwfCommonService, TSID: string): Observable<any> {
    // Parse the TSID string into the TSID object.
    var fullTSID = service.parseTSID(TSID);
    var datastore = this.getDatastore(fullTSID.datastore);

    switch(datastore.type) {
      case IM.DatastoreType.delimited:
        return DelimitedDatastore.readDelimitedData(service, datastore, fullTSID);
      case IM.DatastoreType.dateValue:
        return DateValueDatastore.readTimeSeries(service, datastore, fullTSID);
      case IM.DatastoreType.stateMod:
        return StateModDatastore.readTimeSeries(service, datastore, fullTSID);
      case 'unknown':
      default: console.error('Unsupported Datastore.'); return of(null);
    }
  }

  /**
   * Looks through the list of built in Datastore names & aliases, then user Datastore
   * names & aliases in that order, and checks if the provided string matches them.
   * @param datastoreStr The datastore string from the full TSID.
   * @returns A string of the DatastoreType.
   */
  public getDatastore(datastoreStr: string): IM.Datastore {

    // First try checking each datastore's name property.
    for (let datastore of this.builtInDatastores) {
      if (datastore.name.toUpperCase() === datastoreStr.toUpperCase()) {
        return datastore;
      } 
      // If the exact name not found, try each alias if provided.
      if (datastore.aliases) {
        for (let alias of datastore.aliases) {
          if (alias.toUpperCase() === datastoreStr.toUpperCase()) {
            return datastore;
          }
        }
      }
    }

    // Iterate over user added datastores.
    for (let userDatastore of this.userDatastores) {
      if (userDatastore.name.toUpperCase() === datastoreStr.toUpperCase()) {
        return userDatastore;
      } 
      if (userDatastore.aliases) {
        for (let alias of userDatastore.aliases) {
          if (alias.toUpperCase() === datastoreStr.toUpperCase()) {
            return userDatastore;
          }
        }
      }
    }

    return {
      name: 'unknown',
      type: 'unknown',
      rootUrl: 'unknown'
    };
  }

  /**
   * Sets the DatastoreManager's userDatastores array with all user added Datastore
   * objects from the `app-config.json` file.
   * @param allUserDatastores The array of all user provided datastores from the
   * application configuration file.
   */
  public setUserDatastores(allUserDatastores: IM.Datastore[]): void {
    for (let datastore of allUserDatastores) {
      this.userDatastores.push(datastore);
    }
  }

}