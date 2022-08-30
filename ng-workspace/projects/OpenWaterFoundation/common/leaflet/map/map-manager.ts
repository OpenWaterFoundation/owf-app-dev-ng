/**
 * A helper singleton class for creating, managing and maintaining Leaflet maps in
 * the Infomapper.
 */
// @dynamic
 export class MapManager {
  /** The instance of this WindowManager object. */
  private static instance: MapManager;
  /** Object to hold each Leaflet map reference as the value, with the map
   * configuration's geoMapId property as the key. */
  maps: {} = {};


  /**
   * A private constructor is declared so any instance of the class cannot be created
   * elsewhere, getInstance must be called.
   */
  private constructor() { }


  /**
   * 
   */
  static getInstance(): MapManager {
    if (!MapManager.instance) { MapManager.instance = new MapManager(); }
    return MapManager.instance;
  }

  /**
   * Adds a Leaflet map reference to the @var maps object with the unique mapID as the key.
   * @param mapID A string representing the geoMapId from the map configuration file.
   * @param map The reference to the Map Component's @var mainMap Leaflet map.
   */
  addMap(mapID: string, map: any): void {
    this.maps[mapID] = map;
  }

  /**
   * @returns A boolean on whether this map has already been created.
   * @param geoMapId The map's geoMapId property from it's configuration file.
   */
  doesMapExist(geoMapId: string): boolean {
    return geoMapId in this.maps;
  }

  /**
   * 
   * @param mapID 
   */
  getMap(mapID: string): any {

    if (this.maps[mapID]) {
      return this.maps[mapID];
    } else {
      for (const key in this.maps) {
        if (key.includes(mapID)) {
          return this.maps[key];
        }
      }
    }
    return null;
  }

  /**
   * Removes the Leaflet map reference whose mapID is equal to the @var maps key.
   * @param mapID A string representing the geoMapId from the map configuration file.
   */
  removeMap(mapID: string): void {
    delete this.maps[mapID];
  }

}
