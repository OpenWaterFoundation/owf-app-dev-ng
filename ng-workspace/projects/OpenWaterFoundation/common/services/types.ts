// The interfaces and enums below are typed for use throughout the common library, as well
// as the ability to be utilized by outside consuming applications. It helps define
// different objects mainly related to the InfoMapper for now.

import { BehaviorSubject } from "rxjs";

// ENUM

/** All supported Datastore types. */
export enum DatastoreType {
  delimited = 'owf.datastore.delimited',
  dateValue = 'owf.datastore.datevalue',
  json = 'owf.datastore.json',
  stateMod = 'owf.datastore.statemod'
}

export enum DataType {
  geoJson = 'geoJson',
  CDSSWebService = 'CDSSWebService'
}

/** Each supported D3 chart type. */
export enum D3Chart {
  tree = 'tidyTree',
  treemap = 'treeMap',
  // sankey,
  bar = 'bar'
  // line,
  // scatter
}

/** Graph properties of a TSTool created time series graph object. */
export enum GraphProp {
  bc = 'backgroundColor',
  cm = 'chartMode',
  ct = 'chartType'
}

/** The different operators that are covered for graduated symbols. */
export enum Operator {
  gt = '>',
  gtet = '>=',
  lt = '<',
  ltet = '<='
}

/** The supported file paths for the InfoMapper. */
export enum Path {
  aCP = 'appConfigPath',
  bSIP = 'builtinSymbolImagePath',
  csvPath = 'csvPath',
  cP = 'classificationPath',
  cPP = 'contentPagePath',
  cPage = 'Content Page',
  d3P = 'D3Path',
  dbP = 'dashboardPath',
  dP = 'docPath',
  dVP = 'dateValuePath',
  dUP = 'dataUnitsPath',
  eCP = 'eventConfigPath',
  fMCP = 'fullMapConfigPath',
  gP = 'gapminderPath',
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

/** The currently supported ${Property} functions. */
export enum PropFunction {
  toMixedCase = '.toMixedCase(',
  replace = '.replace('
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

/** The currently supported InfoMapper style properties. */
export enum Style {
  backgroundColor,
  color,
  fillOpacity,
  fillColor,
  opacity,
  size,
  shape,
  weight
}

/** Each implemented Widget Type. */
export enum Widget {
  cht = 'chart',
  dsh = 'dashboard',
  err = 'error',
  img = 'image',
  ind = 'statusIndicator',
  sel = 'selector',
  txt = 'text'
}

/** Enum representing the supported Window Types (Dialog Types) for the WindowManager. */
// export enum WindowType {
//   D3 = 'D3',
//   DOC = 'Documentation',
//   HEAT = 'Heatmap',
//   GAL = 'Gallery',
//   GAP = 'Gapminder',
//   PROJ = 'Project',
//   TABLE = 'Table',
//   TEXT = 'Text',
//   TSGRAPH = 'TSGraph'
// }

// INTERFACES

/////////////////////////////// APPLICATION \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/** The main AppConfig JSON object created by the user. */
export interface AppConfig {
  title?: string;
  homePage: string;
  favicon?: string;
  dataUnitsPath?: string;
  googleAnalyticsTrackingId?: string;
  version?: string;
  datastores?: Datastore[];
  mainMenu?: MainMenu[];
}

////////////////////////////// GEOMAPPROJECT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/** The GeoMapProject JSON object created by the GeoProcessor. */
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
/** The GeoMap JSON object created by the GeoProcessor. */
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
/** The GeoLayer JSON object created by the GeoProcessor. */
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
/** The GeoLayerViewGroup JSON object created by the GeoProcessor. */
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
/** The GeoLayerView JSON object created by the GeoProcessor. */
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

/** The GeoLayerSymbol JSON object created by the GeoProcessor. */
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

///////////////////////////////// EVENTS \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/** The EventConfig JSON object created by the user. */
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

/** The EventAction JSON object created by the user. */
export interface EventAction {
  label?: string;
  action: string;
  resourcePath?: string;
  downloadFile?: string;
  imageGalleryAttribute?: string;
  featureLabelType?: string;
  saveFile?: string;
}

/** The EventHandler JSON object created by the user. */
export interface EventHandler {
  eventType?: string;
  action?: string;
  properties?: {
    eventConfigPath?: string;
    // TODO: jpkeahey 2020.11.24 - popupConfigPath is deprecated.
    popupConfigPath?: string;
  }
}

////////////////////////////////// MENUS \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/** The MainMenu JSON object created by the user. */
export interface MainMenu {
  id?: string;
  name?: string;
  align?: string;
  action?: string;
  enabled?: any;
  tooltip?: string;
  visible?: any;
  menus?: SubMenu[];
}

/** The SubMenu JSON object created by the user. */
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

///////////////////////////////// LEAFLET \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  
/** Used for creating Bounds objects that contain Latitude and Longitude
 * bounds for zooming on a Leaflet map. */
export interface Bounds {
  NEMaxLat: number;
  SWMinLat: number;
  NEMaxLong: number;
  SWMinLong: number;
}

/**
 * NOTE: Might not be used right now.
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

///////////////////////////////// GRAPHS \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/** Properties to be used with creating a D3 chart. */
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

/** The main object for the created graph template JSON file made from TSTool. */
export interface GraphTemplate {
  product?: GraphProd
}

/** The product object with top level properties, and the array of sub products. */
export interface GraphProd {
  properties?: GraphProdProp,
  subProducts?: GraphSubProd[]
}

/** The top level properties for the graph template object, e.g. the main graph title. */
export interface GraphProdProp {
  CurrentDateTime?: string,
  CurrentDateTimeColor?: string,
  Enabled?: string,
  LayoutNumberOfCols?: string,
  LayoutNumberOfRows?: string,
  LayoutType?: string,
  MainTitleFontName?: string,
  MainTitleFontSize?: string,
  MainTitleFontStyle?: string,
  MainTitleString?: string,
  OutputFile?: string,
  ProductID?: string,
  ProductName?: string,
  ProductType?: string,
  ShowDrawingAreaOutline?: string,
  SubTitleFontName?: string,
  SubTitleFontSize?: string,
  SubTitleFontStyle?: string,
  SubTitleString?: string,
  TotalHeight?: string,
  TotalWidth?: string
}

/** The subProduct object with more granular properties, and each graph's data object. */
export interface GraphSubProd {
  properties?: GraphSubProdProp
  data?: GraphData[],
  annotations?: []
}

/** The properties for the Graph's subProduct object. */
export interface GraphSubProdProp {
  AnnotationProvider?: string,
  BottomXAxisLabelFontName?: string,
  BottomXAxisLabelFontSize?: string,
  BottomXAxisLabelFontStyle?: string,
  BottomXAxisMajorGridColor?: string,
  BottomXAxisMinorGridColor?: string,
  BottomXAxisTitleFontName?: string,
  BottomXAxisTitleFontSize?: string,
  BottomXAxisTitleFontStyle?: string,
  BottomXAxisTitleString?: string,
  DataLabelFontName?: string,
  DataLabelFontSize?: string,
  DataLabelFontStyle?: string,
  DataLabelFormat?: string,
  DataLabelPosition?: string,
  Enabled?: string,
  GraphType?: string,
  LayoutYPercent?: string,
  LeftYAxisDirection?: string,
  LeftYAxisIgnoreUnits?: string,
  LeftYAxisLabelFontName?: string,
  LeftYAxisLabelFontSize?: string,
  LeftYAxisLabelFontStyle?: string,
  LeftYAxisLabelPrecision?: string,
  LeftYAxisLegendPosition?: string,
  LeftYAxisMajorGridColor?: string,
  LeftYAxisMajorTickColor?: string,
  LeftYAxisMax?: string,
  LeftYAxisMin?: string,
  LeftYAxisMinorGridColor?: string,
  LeftYAxisTitleFontName?: string,
  LeftYAxisTitleFontSize?: string,
  LeftYAxisTitleFontStyle?: string,
  LeftYAxisTitlePosition?: string,
  LeftYAxisTitleRotation?: string,
  LeftYAxisTitleString?: string,
  LeftYAxisType?: string,
  LeftYAxisUnits?: string,
  LegendFontName?: string,
  LegendFontSize?: string,
  LegendFontStyle?: string,
  LegendFormat?: string,
  LegendPosition?: string,
  MainTitleFontName?: string,
  MainTitleFontSize?: string,
  MainTitleFontStyle?: string,
  MainTitleString?: string,
  RightYAxisDirection?: string,
  RightYAxisGraphType?: string,
  RightYAxisIgnoreUnits?: string,
  RightYAxisLabelFontName?: string,
  RightYAxisLabelFontSize?: string,
  RightYAxisLabelFontStyle?: string,
  RightYAxisLabelPrecision?: string,
  RightYAxisLegendPosition?: string,
  RightYAxisMajorGridColor?: string,
  RightYAxisMajorTickColor?: string,
  RightYAxisMax?: string,
  RightYAxisMin?: string,
  RightYAxisMinorGridColor?: string,
  RightYAxisTitleFontName?: string,
  RightYAxisTitleFontSize?: string,
  RightYAxisTitleFontStyle?: string,
  RightYAxisTitlePosition?: string,
  RightYAxisTitleRotation?: string,
  RightYAxisTitleString?: string,
  RightYAxisType?: string,
  RightYAxisUnits?: string,
  SelectedTimeSeriesLineWidth?: string,
  SubTitleFontName?: string,
  SubTitleFontSize?: string,
  SubTitleFontStyle?: string,
  SubTitleString?: string,
  TopXAxisLabelFontName?: string,
  TopXAxisLabelFontSize?: string,
  TopXAxisLabelFontStyle?: string,
  TopXAxisTitleFontName?: string,
  TopXAxisTitleFontSize?: string,
  TopXAxisTitleFontStyle?: string,
  ZoomEnabled?: string,
  ZoomGroup?: string
}

/** The Graph's subProduct data object, which only has a properties object. */
export interface GraphData {
  properties?: GraphDataProp
}

/** The properties for each graph being created in the graph template object. */
export interface GraphDataProp {
  Color?: string,
  DataLabelFormat?: string,
  DataLabelPosition?: string,
  Enabled?: string,
  FlaggedDataSymbolStyle?: string,
  GraphType?: string,
  LegendFormat?: string,
  LineStyle?: string,
  LineWidth?: string,
  SymbolSize?: string,
  SymbolStyle?: string,
  TSAlias?: string,
  TSID?: string,
  XAxis?: string,
  YAxis?: string
}

/** A general object to help in using a graphing package API. */
export interface PopulateGraph {
  chartMode?: string;
  chartType: string;
  datasetBackgroundColor?: string;
  datasetData?: number[];
  dataLabels?: string[];
  dateType?: string;
  endDate?: string;
  graphFileType: string;
  isCSV?: boolean;
  legendLabel: string;
  legendPosition: any;
  plotlyDatasetData?: number[];
  plotly_xAxisLabels?: any[];
  startDate?: string;
  yAxesLabelString: string;
}

///////////////////////////// DASHBOARD CONFIG \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/** Main Dashboard configuration object. */
export interface DashboardConf {
  metadata: DashboardMetadata;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
}

/** Dashboard metadata object. */
export interface DashboardMetadata {
  version?: string;
  author?: string;
  title?: string;
}

/** Dashboard layout object. */
export interface DashboardLayout {
  backgroundColor?: string;
  columns: number;
  gutterSize?: string;
}

/** Styling for the MatGridTile in the Dashboard Component. */
export interface WidgetTileStyle {
  backgroundColor?: string;
  textColor?: string;
}

//////////////////////////// DASHBOARD WIDGETS \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/** Dashboard widget object. */
export interface DashboardWidget {
  type: string;
  name: string;
  description?: string;
  columns?: number;
  rows?: number;
  eventHandlers?: WidgetEventHandler[];
  style?: WidgetTileStyle;
  errorTypes?: string[];
}

export interface ChartWidget extends DashboardWidget {
  graphTemplatePath: string;
}

export interface ImageWidget extends DashboardWidget {
  imagePath: string;
}

export interface MapWidget extends DashboardWidget {
  mapConfigPath: string;
}

export interface SelectorWidget extends DashboardWidget {
  dataPath: string;
  dataFormat: string;
  displayName: string;
  graphTemplatePath?: string;
  JSONArrayName?: string;
  skipDataLines?: number;
}

export interface StatusIndicatorWidget extends DashboardWidget {
  title?: string;
  dataPath?: string;
  referenceValue?: number;
  badRef?: string;
}

export interface TextWidget extends DashboardWidget {
  textPath: string;
  graphTemplatePath: string;
}

export interface WidgetEvent {
  widgetName?: string;
}

/**
 * Communicator object for passing necessary data from the Selector Widget to
 * the Chart Widget.
 */
 export interface SelectEvent extends WidgetEvent {
  selectedItem?: any;
}

export interface WidgetEventHandler {
  widgetName: string;
  eventType: string;
}

export interface ListenedToWidget {
  name: string;
  behaviorSubject: BehaviorSubject<WidgetEvent>
}

/////////////////////////////// Time Series \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


export interface Datastore {
  name: string,
  type: string,
  rootUrl: string,
  aliases?: string[]
}

/** An object representing a parsed full TSID string. */
export interface TSID {
  location?: string;
  datastore?: string;
  path?: string;
}

/////////////////////////////////// Misc \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/**
 * 
 */
export interface ParsedProp {
  foundProps: string[];
  line: string;
}