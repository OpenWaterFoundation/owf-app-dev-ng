import { Pipe, PipeTransform } from '@angular/core';

/**
 * Use the `leafletData` from the DialogDataTableComponent and the layer's @var geoLayerId to determine whether the layer has
 * a selected (or highlighted) layer. If it doesn't, return true to tell the button to become disabled, and false otherwise.
 */
/**
 * A pure pipe that returns the following determined by the `checkType`:
 * * A boolean of whether the address radio button is displayed.
 * * A boolean of whether the address zoom button is enabled.
 * * A boolean of whether the zoom to selected features button is enabled.
 */
@Pipe({ name: 'checkDataTableElement' })
export class CheckDataTableElementPipe implements PipeTransform {

  transform(checkType: string, checkValue: any, addressMarkerDisplayed?: boolean): boolean {

    switch(checkType) {
      case 'address-radio': {
        if (typeof checkValue !== 'undefined' && checkValue.toUpperCase().includes('POLYGON')) {
          return false;
        } else {
          return true;
        }
      }
      case 'address-zoom': {
        if (checkValue === 'address' && addressMarkerDisplayed === true) {
          return false;
        } else {
          return true;
        }
      }
      case 'selected-layers': {
        if (checkValue) {
          // If the selected layer exists, then we don't want the button to be disabled, so return false
          return false;
        } else {
          // If no selected layer exists, then we DO want the button disabled, so return true
          return true;
        }
      } 
    }
  }
}
