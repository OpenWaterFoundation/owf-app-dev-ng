// The interfaces below are typed for use throughout the common library, as well as the ability to be utilized by
// outside consuming applications. It helps define different objects mainly related to the InfoMapper at the moment.

/** Interface for Typing the main AppConfig JSON object created by the user. */
export interface AppConfig {
  title?: string;
  homePage?: string;
  favicon?: string;
  dataUnitsPath?: string;
  googleAnalyticsTrackingId?: string;
  version?: string;
  mainMenu?: MainMenu[];
}

/** Interface for Typing the GeoMapProject JSON object created by the GeoProcessor. */
export interface GeoMapProject {
  geoMapProjectId?: string;
  name?: string;
  description?: string;
  projectType?: string;
  properties?: {
    author?: string;
    specificationFlavor?: string;
    specificationVersion?: string;
  };
  geoMaps?: GeoMap[]
}
/** Interface for Typing the GeoMap JSON object created by the GeoProcessor. */
export interface GeoMap {
  geoMapId?: string;
  name?: string;
  description?: string;
  dataPath?: string;
  crs?: string;
  properties?: {
    docPath?: string;
    extentInitial?: string;
  };
  geoLayers?: GeoLayer[];
  geoLayerViewGroups?: GeoLayerViewGroup[];
}
/** Interface for Typing the GeoLayer JSON object created by the GeoProcessor. */
export interface GeoLayer {
  geoLayerId?: string;
  name?: string;
  description?: string;
  crs?: string;
  geometryType?: string;
  layerType?: string;
  sourceFormat?: string;
  sourcePath?: string;
  properties?: {
    attribution?: string;
    isBackground?: string;
    zoomLevelMax?: string;
  },
  history?: string[];
}
/** Interface for Typing the GeoLayerViewGroup JSON object created by the GeoProcessor. */
export interface GeoLayerViewGroup {
  geoLayerViewGroupId?: string;
  name?: string;
  description?: string;
  properties?: {
    docPath?: string;
    isBackground?: string;
    selectBehavior?: string;
    selectedInitial?: string;
  },
  geoLayerViews?: GeoLayerView[];
}
/** Interface for Typing the GeoLayerView JSON object created by the GeoProcessor. */
export interface GeoLayerView {
  geoLayerViewId?: string;
  name?: string;
  description?: string;
  geoLayerId?: string;
  isWFS?: string;
  properties?: {
    imageBounds?: string;
    imageGalleryEventActionId?: string;
    refreshInterval?: string;
    selectedInitial?: string;
  },
  geoLayerSymbol?: GeoLayerSymbol;
}

/** Interface for Typing the GeoLayerSymbol JSON object created by the GeoProcessor. */
export interface GeoLayerSymbol {
  name?: string;
  description?: string;
  classificationType?: string;
  classificationAttribute?: string;
  properties?: {
    builtinSymbolImage?: string;
    classificationFile?: string;
    color?: string;
    fillColor?: string;
    fillOpacity?: string;
    imageAnchorPoint?: string;
    /** Path to the image to be shown in the map legend. */
    legendImagePath?: string;
    opacity?: string;
    outlineColor?: string;
    rasterResolution?: string;
    sizeUnits?: string;
    weight?: string;
    symbolImage?: string;
    symbolShape?: string;
    symbolSize?: string;
  }
}

/** Interface for Typing the EventConfig JSON object created by the user. */
export interface EventConfig {
  id?: string;
  name?: string;
  description?: string;
  layerAttributes?: {
    include?: any[];
    exclude?: any[];
    formats?: any[];
  }
  actions?: EventAction[];
}

/** Interface for Typing the EventAction JSON object created by the user. */
export interface EventAction {
  label?: string;
  action: string;
  resourcePath?: string;
  downloadFile?: string;
  imageGalleryAttribute?: string;
  featureLabelType?: string;
  saveFile?: string;
}

/** Interface for Typing the EventHandler JSON object created by the user. */
export interface EventHandler {
  eventType?: string;
  action?: string;
  properties?: {
    eventConfigPath?: string;
    // TODO: jpkeahey 2020.11.24 - popupConfigPath is deprecated.
    popupConfigPath?: string;
  }
}

/** Interface for Typing the MainMenu JSON object created by the user. */
export interface MainMenu {
  id?: string;
  name?: string;
  align?: string;
  enabled?: any;
  tooltip?: string;
  visible?: any;
  menus?: SubMenu[];
}

/** Interface for Typing the SubMenu JSON object created by the user. */
export interface SubMenu {
  name?:  string;
  action?:  string;
  enabled?: any;
  mapProject?: string;
  separatorBefore?: any;
  doubleSeparatorBefore?: any;
  tooltip?: string;
  visible?: any;
}

/** Enum with the supported file paths for the InfoMapper. */
export enum Path {
  aCP = 'appConfigPath',
  bSIP = 'builtinSymbolImagePath',
  csvPath = 'csvPath',
  cP = 'classificationPath',
  cPP = 'contentPagePath',
  cPage = 'Content Page',
  d3P = 'D3Path',
  dP = 'docPath',
  dVP = 'dateValuePath',
  dUP = 'dataUnitsPath',
  eCP = 'eventConfigPath',
  fMCP = 'fullMapConfigPath',
  gLGJP = 'geoLayerGeoJsonPath',
  hPP = 'homePagePath',
  iGP = 'imageGalleryPath',
  iP = 'imagePath',
  mP = 'markdownPath',
  raP = 'rasterPath',
  rP = 'resourcePath',
  sIP = 'symbolImagePath',
  sMP = 'stateModPath',
  vP = 'versionPath'
}

/** Enum for every type of layer refresh represented in the Map Component. */
export enum RefreshType {
  image,
  raster,
  tile,
  vector
}

/** Enum representing the 3 types of files that can be downloaded in an application. */
export enum SaveFileType {
  dataTable,
  text,
  tstable
}

/** Enum containing the different operators that are covered for graduated symbols. */
export enum Operator {
  gt = '>',
  gtet = '>=',
  lt = '<',
  ltet = '<='
}
  
/** Interface used for creating Bounds objects that contain Latitude and Longitude
 * bounds for zooming on a Leaflet map. */
export interface Bounds {
  NEMaxLat: number;
  SWMinLat: number;
  NEMaxLong: number;
  SWMinLong: number;
}

/** Enum with the currently supported InfoMapper style properties. */
export enum Style {
  color,
  fillOpacity,
  fillColor,
  opacity,
  size,
  shape,
  weight
}

/** Enum with the currently supported ${Property} functions. */
export enum PropFunction {
  toMixedCase = '.toMixedCase(',
  replace = '.replace('
}

/**
 * NOTE: Might not be used at the moment.
 * e, _this, geoLayer, symbol, geoLayerViewGroup, i
 */
export interface LeafletEvent {
  event?: any;
  mapCompRef?: any;
  geoLayer?: any;
  geoLayerViewGroup?: any;
  index?: number;
  symbol?: any;
}

/** Interface for containing properties to be used with creating a D3 chart. */
export interface D3Prop {
  chartType: D3Chart;
  dataPath: string;
  name: string;
  parent?: string;
  children?: string;
  value?: string;
  height?: number;
  width?: number;
  title?: string;
  colorScheme?: string[];
  margin?: number;
}

/** Enum for each supported D3 chart type. */
export enum D3Chart {
  tree = 'tidyTree',
  treemap = 'treeMap',
  // sankey,
  bar = 'bar'
  // line,
  // scatter
}