import { of }                             from 'rxjs';

import { Datastore, DatastoreType, OwfCommonService }               from '@OpenWaterFoundation/common/services';

import { DateValueDatastore }             from './DateValueDatastore';
import { DelimitedDatastore }             from './DelimitedDatastore';
import { StateModDatastore }              from './StateModDatastore';
import { ColoradoHydroBaseRestDatastore } from './ColoradoHydroBaseRestDatastore';


/**
 * 
 */
// @dynamic
export class DatastoreManager {

  // The hard coded 'built in' Datastores for the Common library.
  private readonly builtInDatastores: Datastore[] = [
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
  /**
   * 
   */
  createdDatastores = {};
  /** An array of user-provided datastores from the `app-config.json` file. */
  private userDatastores: Datastore[] = [];
  /** The singleton instance of this MapLayerManager class. */
  private static instance: DatastoreManager;


  private constructor() {}


  /**
   * Only one instance of this MapLayerManager can be used at one time, making it
   * a singleton class.
   */
  static getInstance(): DatastoreManager {
    if (!DatastoreManager.instance) { DatastoreManager.instance = new DatastoreManager(); }
    return DatastoreManager.instance;
  }

  /**
   * Determines what datastore is being used, and calls 
   * @param service The OWF service for fetching data using async HTTP calls.
   * @param TSID The full TSID string.
   * @returns The data from the requested Datastore as an observable.
   */
  getDatastoreData(service: OwfCommonService, TSID: string): any {
    // Parse the TSID string into the TSID object.
    var fullTSID = service.parseTSID(TSID);
    var datastore = this.getDatastore(fullTSID.datastore);

    switch(datastore.type) {
      case DatastoreType.delimited:
        return DelimitedDatastore.readDelimitedData(service, datastore, fullTSID);
      case DatastoreType.dateValue:
        return DateValueDatastore.readTimeSeries(service, datastore, fullTSID);
      case DatastoreType.stateMod:
        return StateModDatastore.readTimeSeries(service, datastore, fullTSID);
      case DatastoreType.ColoradoHydroBaseRest:
        return new ColoradoHydroBaseRestDatastore(service, datastore).getAsyncData(fullTSID);
      case 'unknown':
      default:
        console.error("Unsupported datastore '" + fullTSID.datastore + "'.");
        return of({ error: "An error has occurred." });
    }
  }

  /**
   * Looks through the list of built-in Datastore names & aliases, then user Datastore
   * names & aliases in that order, and checks if the provided string matches them.
   * @param datastoreStr The datastore string from the full TSID.
   * @returns A string of the DatastoreType.
   */
  getDatastore(datastoreStr: string): Datastore {

    // First try checking each built-in datastore's name property.
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

    // If not found yet, iterate over user added datastore names and aliases.
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
    // Return unknown if not found.
    return {
      name: 'unknown',
      type: 'unknown',
      rootUrl: 'unknown'
    };
  }

  initializeDatastores(): void {

    // Create and initialize the ColoradoHydroBaseRestDatastore instance.
    // this.createdDatastores['ColoradoHydroBaseRestDatastore'] =
    // new ColoradoHydroBaseRestDatastore()
  }

  /**
   * Sets the DatastoreManager's userDatastores array with all user added Datastore
   * objects from the `app-config.json` file.
   * @param userDatastores The array of all user provided datastores from the
   * application configuration file.
   */
  setUserDatastores(userDatastores: Datastore[]): void {

    // If no userDatastores are given, don't do anything.
    if (!userDatastores || userDatastores.length === 0) {
      return;
    }

    for (let datastore of userDatastores) {
      this.userDatastores.push(datastore);
    }
  }

}