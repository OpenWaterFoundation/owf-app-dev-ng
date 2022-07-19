import { Pipe,
          PipeTransform } from '@angular/core';

import * as IM            from '@OpenWaterFoundation/common/services';

@Pipe({
  name: 'symbolCheck'
})
export class SymbolCheckPipe implements PipeTransform {

  transform(checkType: string, geoLayerSymbol?: IM.GeoLayerSymbol, classificationInfo?: any): any {

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
        } else if (!classificationInfo.symbolShape && geoLayerSymbol.properties.symbolShape &&
        geoLayerSymbol.properties.symbolShape.toUpperCase() === checkType) {
          return true;
        } else if (!classificationInfo.symbolShape && !geoLayerSymbol.properties.symbolShape) {
          return true;
        }
        return false;
      case 'TRIANGLE':
      case 'CIRCLE':
        if (classificationInfo.symbolShape && classificationInfo.symbolShape.toUpperCase() === checkType) {
          return true;
        } else if (!classificationInfo.symbolShape && geoLayerSymbol.properties.symbolShape &&
        geoLayerSymbol.properties.symbolShape.toUpperCase() === checkType) {
          return true;
        }
        return false;
    }

    return null;
  }

}
