import { Pipe,
          PipeTransform } from '@angular/core';
import { GeoLayerSymbol } from '@OpenWaterFoundation/common/services';


@Pipe({
  name: 'symbolCheck'
})
export class SymbolCheckPipe implements PipeTransform {

  /**
   * @param checkType The type of symbol to check.
   * @param geoLayerSymbol The GeoLayerSymbol object from a GeoLayerView.
   * @param classificationInfo The object with data from a classification file.
   * @returns A boolean of whether the provided symbol `checkType` will be rendered
   * on screen.
   */
  transform(checkType: string, geoLayerSymbol?: GeoLayerSymbol, classificationInfo?: any): boolean {

    switch(checkType) {
      case 'noSymbol':
        return (geoLayerSymbol && classificationInfo) ? false : true;
      case 'SINGLESYMBOL':
      case 'CATEGORIZED':
      case 'GRADUATED':
        return geoLayerSymbol.classificationType.toUpperCase() === checkType;
      case 'SQUARE':
        if (classificationInfo.symbolShape && classificationInfo.symbolShape.toUpperCase() === checkType) {
          return true;
        }
        else if (!classificationInfo.symbolShape && geoLayerSymbol.properties.symbolShape &&
        geoLayerSymbol.properties.symbolShape.toUpperCase() === checkType) {
          return true;
        }
        else if (!classificationInfo.symbolShape && !geoLayerSymbol.properties.symbolShape) {
          return true;
        }
        return false;
      case 'TRIANGLE':
      case 'CIRCLE':
        if (classificationInfo.symbolShape && classificationInfo.symbolShape.toUpperCase() === checkType) {
          return true;
        }
        else if (!classificationInfo.symbolShape && geoLayerSymbol.properties.symbolShape &&
        geoLayerSymbol.properties.symbolShape.toUpperCase() === checkType) {
          return true;
        }
        return false;
    }

    return null;
  }

}
