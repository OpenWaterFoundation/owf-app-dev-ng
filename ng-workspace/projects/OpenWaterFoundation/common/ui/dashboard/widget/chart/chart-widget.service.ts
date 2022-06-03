import { Injectable }  from "@angular/core";

import { DateTime }    from '@OpenWaterFoundation/common/util/time';
import * as IM         from '@OpenWaterFoundation/common/services';

import { add,
          format,
          isEqual,
          parseISO }   from 'date-fns';
import { DayTS,
          MonthTS,
          TS, 
          YearTS}      from "@OpenWaterFoundation/common/ts";

/** The DialogService provides helper function to all Dialog Components in the Common
 * library. Any function not directly related to a Dialog Component's core functionality
 * will be present here.
 */
@Injectable({
  providedIn: 'root'
})
export class ChartWidgetService {


  constructor() {}


  /************************* CHART WIDGET COMPONENT *************************/

  /*************************** D3 DIALOG COMPONENT ***************************/


  /*********************** DATA TABLE DIALOG COMPONENT ***********************/

  /**
   * Determines the smallest zoom bound to create that displays all selected features
   * on the Leaflet map using their provided coordinates.
   * @param lat The latitude to check.
   * @param long The longitude to check.
   * @param bounds The InfoMapper typed Bounds object to be updated if necessary.
   */
  public setZoomBounds(lat: number, long: number, bounds: IM.Bounds): void {

    if (lat > bounds.NEMaxLat) {
      bounds.NEMaxLat = lat;
    }
    if (lat < bounds.SWMinLat) {
      bounds.SWMinLat = lat;
    }
    if (long > bounds.NEMaxLong) {
      bounds.NEMaxLong = long;
    }
    if (long < bounds.SWMinLong) {
      bounds.SWMinLong = long;
    }
  }


  /************************* DATA TABLE LIGHT DIALOG COMPONENT *************************/


  /************************* DOC DIALOG COMPONENT *************************/


  /************************* GALLERY DIALOG COMPONENT *************************/


  /************************* GAPMINDER DIALOG COMPONENT *************************/


  /************************* HEATMAP DIALOG COMPONENT *************************/


  /************************* IMAGE DIALOG COMPONENT *************************/


  /************************* PROPERTIES DIALOG COMPONENT *************************/

  /**
   * @returns A string describing the type of array the Raster is using, to be displayed
   * under band properties.
   * @param arr The Raster array reference to determine what data types it is using.
   */
  public getInstanceOf(arr: any[]): string {
    if (arr instanceof Float32Array) {
      return 'Float32Array';
    } else if (arr instanceof Float64Array) {
      return 'Float64Array';
    } else if (arr instanceof Int8Array) {
      return 'Int8Array';
    } else if (arr instanceof Int16Array) {
      return 'Int16Array';
    } else if (arr instanceof Int32Array) {
      return 'Int32Array';
    } else {
      return 'Unknown';
    }
  }


  /************************* TEXT DIALOG COMPONENT *************************/


  /************************* TSGRAPH DIALOG COMPONENT ************************/

  
  /************************* TSTABLE DIALOG COMPONENT *************************/


  
}