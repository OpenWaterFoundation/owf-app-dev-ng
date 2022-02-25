import { MapLayerItem } from "@OpenWaterFoundation/common/ui/layer-manager/map-layer-item";


export class MockOwfCommonService {
  isURL(property: any) {}
  buildPath(pathType: string, arg?: any[]) {}
  condensePath(path: string, formatType?: string) {}
  setMapConfigPath(path: string) {}
}

export class DialogRefMock {
  close() {}
}

export const VECTOR_LAYER_ITEM: any = {
  // addressMarker: null,
  // addedToMainMap: false,
  // displayed: false,
  // isRaster: true,
  // isVector: false,
  // layerItemGeoLayerId: 'unique-geoLayerId',
  // layerItemViewGroupId: 'unique-geoLayerViewGroupId',
  // leafletLayer: null,
  // selectBehavior: 'Any',
  // selectInitial: true,
  // selectedLayer: null,
  // addAddressMarker() {},
  // addItemLeafletLayerToMainMap() {},
  // addLeafletLayer() {},
  // addSelectedLayerToMainMap() {},
  // getItemGeoLayerViewGroupId(): string {return},
  // getItemLeafletLayer() {},
  // getItemSelectBehavior(): string {return},
  // getSelectedLayer() {},
  // hasAnySelectedLayers(): boolean {return},
  // hasSelectedLayer(): boolean {return},
  // init() {},
  // initItemLeafletLayerToMainMap() {},
  // isAddedToMainMap(): boolean {return},
  // isDisplayedOnMainMap(): boolean {return},
  // isRasterLayer(): boolean {return},
  isVectorLayer(): boolean { return true },
  // isSelectInitial(): boolean {return},
  // removeAllSelectedLayers() {},
  // removeItemLeafletLayerFromMainMap() {}
};

export const RASTER_LAYER_ITEM: any = {
  isVectorLayer(): boolean { return false },
  isRasterLayer(): boolean { return true },
  getItemLeafletLayer() {}
};

export const RASTER_LEAFLET_LAYER: any = {
  height: 47,
  width: 83,
  rasters: 1,
  maxLat: 41.00252000000,
  maxLng: -102.06009000000,
  minLat: 38.65252000000,
  minLng: -106.21009000000,
  pixelHeight: 0.05000000000,
  pixelWidth: 0.05000000000,
  projection: 4326,
  tileHeight: 256,
  tileWidth: 256,
  xmax: -102.06009000000,
  xmin: -106.21009000000,
  ymax: 41.00252000000,
  ymin: 38.65252000000
};

export const DATA_OBJECT: any = {
  data: {
    geoLayer: {
        geoLayerId: "CountiesLayer",
        name: "Colorado Counties",
        description: "All counties in the State of Colorado.",
        crs: "EPSG:4326",
        geometryType: "WKT:Polygon",
        layerType: "Vector",
        sourcePath: "../map-layers/new_colorado_counties.geojson",
        properties: {},
        history: [
          "Read GeoLayer from GeoJSON file:  'C:\\Users\\sam\\owf-dev\\App-Poudre-Portal\\git-repos\\owf-app-poudre-dashboard-workflow\\workflow\\BasinEntities\\Administrative-WaterDistricts\\layers\\co-dwr-water-districts-division1.geojson'"
        ]
    },
    geoLayerId: "CountiesLayer",
    geoLayerViewName: "Colorado Counties",
    layerProperties: [
      "shape_st_2",
      "shape_stle",
      "pop_2010",
      "co_fips",
      "county",
      "shape_st_1",
      "shape_star",
      "househo_20"
    ],
    mapConfigPath: "data-maps/map-configuration-files/"
  }
};