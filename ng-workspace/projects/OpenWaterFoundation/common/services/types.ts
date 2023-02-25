// The interfaces and enums below are typed for use throughout the common library
// as well as the ability to be utilized by consuming applications.

import { BehaviorSubject } from "rxjs";

/////////////////////////////////// ENUMS \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/** The different ways a Chart can be displayed in the InfoMapper. */
export enum ChartDisplayType {
  dlg = 'dialog',
  emd = 'embed',
  ful = 'full',
  wid = 'widget'
}

/** All supported Datastore types. */
export enum DatastoreType {
  delimited = 'owf.datastore.delimited',
  dateValue = 'owf.datastore.datevalue',
  ColoradoHydroBaseRest = 'owf.datastore.ColoradoHydroBaseRest',
  stateMod = 'owf.datastore.statemod'
}

/**
 * Currently unused.
 */
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
  ct = 'chartType',
  fl = 'fill',
  lw = 'lineWidth',
  sk = 'stacked'
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
  err = 'error',
  img = 'image',
  ind = 'statusIndicator',
  sel = 'selector',
  txt = 'text',
  ttl = 'title'
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

///////////////////////////////// INTERFACES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//////////////////////////////// APPLICATION \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/** The main AppConfig JSON object created by the user. */
export interface AppConfig {
  title: string;
  homePage: string;
  version: string;
  favicon?: string;
  dataUnitsPath?: string;
  googleAnalyticsTrackingId?: string;
  standaloneMap?: StandaloneMap;
  datastores?: Datastore[];
  mainMenu?: MainMenu[];
}

//////////////////////// GEOMAPPROJECT / MAP CONFIG \\\\\\\\\\\\\\\\\\\\\\\\\\\\

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
  keywords?: string[];
  geoMaps?: GeoMap[];
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
    expandedInitial?: string;
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
    refreshOffset?: string;
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
    labelText?: string;
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

/////////////////////////////////// MENUS \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/** The MainMenu JSON object created by the user. */
export interface MainMenu {
  id?: string;
  name?: string;
  description?: string;
  action?: string;
  enabled?: any;
  dashboardFile?: string;
  mapProject?: string;
  markdownFile?: string;
  storyFile?: string;
  tooltip?: string;
  url?: string;
  visible?: any;
  menus?: SubMenu[];
}

/** The SubMenu JSON object created by the user. */
export interface SubMenu {
  id?: string;
  name?:  string;
  description?: string;
  action?:  string;
  enabled?: any;
  dashboardFile?: string;
  mapProject?: string;
  markdownFile?: string;
  separatorBefore?: any;
  doubleSeparatorBefore?: any;
  storyFile?: string;
  tooltip?: string;
  url?: string;
  visible?: any;
}

////////////////////////////////// LEAFLET \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  
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

////////////////////////////////// GRAPHS \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

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
  TSAlias?: any,
  TSID?: any,
  XAxis?: string,
  YAxis?: string
}

/** A general object to help in using with a graphing package API. */
export interface PopulateGraph {
  chartMode?: string;
  chartType: string;
  datasetBackgroundColor?: string;
  datasetData?: number[];
  dataLabels?: string[];
  endDate?: string;
  fillType?: string;
  graphFileType: string;
  isCSV?: boolean;
  legendLabel: string;
  lineWidth?: string;
  plotlyDatasetData?: number[];
  plotlyXAxisLabels?: any[];
  startDate?: string;
  stackGroup?: string;
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
  author?: string;
  id?: string;
  title?: string;
  tooltip?: string;
  version?: string;
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
  fontFamily: string;
  fontSize: string;
  fontStyle?: string;
  fontWeight?: string;
  textColor?: string;
  textDecoration?: string;
}

///////////////////////////// DASHBOARD WIDGETS \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/** Base interface for widget objects shown in a dashboard. */
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

/**Chart widget properties.*/
export interface ChartWidget extends DashboardWidget {
  graphTemplatePath: string;
}

/**Image widget properties.*/
export interface ImageWidget extends DashboardWidget {
  imagePath: string;
  title?: string;
}

/**Map widget properties.*/
export interface MapWidget extends DashboardWidget {
  mapConfigPath: string;
}

/**Selector widget properties. */
export interface SelectorWidget extends DashboardWidget {
  dataPath: string;
  dataFormat: string;
  displayName: string;
  graphTemplatePath?: string;
  JSONArrayName?: string;
  skipDataLines?: number;
}

/**Status Indicator widget properties. */
export interface StatusIndicatorWidget extends DashboardWidget {
  title?: string;
  dataPath?: string;
  dataFormat?: string;
  JSONArrayName?: string;
  referenceValue?: number;
  badRef?: string;
  // All three of these are being used for now.
  attributeName?: string;
  columnName?: string;
  propertyName?: string;

  skipDataLines?: number;
  classificationFile?: string;
  titleTooltip?: string;
  indicatorValueTooltip?: string;
  referenceValueTooltip?: string;
}

/** Title widget properties. */
export interface TextWidget extends DashboardWidget {
  contentType: string;
  graphTemplatePath: string;
  textPath: string;
  text?: string;
}

/** Title widget properties. */
export interface TitleWidget extends DashboardWidget {
  title: string;
}

/** Used when an event occurs in a dashboard widget that will effect another widget. */
export interface WidgetEvent {
  widgetName?: string;
}

/** Communicator object for passing necessary data from the Selector Widget to
 * the Chart Widget. */
export interface SelectEvent extends WidgetEvent {
  selectedItem?: any;
}

/** Handler for dealing with multiple widgets on one dasboard that can interact with
 * each other. */
export interface WidgetEventHandler {
  widgetName: string;
  eventType: string;
}

/** Each widget that is currently listening for events. BehaviorSubject will be subscribed
 * to by the listening widget. */
export interface ListenedToWidget {
  name: string;
  behaviorSubject: BehaviorSubject<WidgetEvent>
}

/////////////////////////////// STORY CONFIG \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/** Top level Story config object. */
export interface StoryConf {
  story: StoryMain;
}

/** Main Story object. Holds all story chapters. */
export interface StoryMain {
  name: string;
  chapters: StoryChapters[];
}

/** Each chapter in a story. */
export interface StoryChapters {
  name: string;
  tooltip?: string;
  pages: DashboardConf[];
}

//////////////////////////////// TIME SERIES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/** Datastore to be used by an InfoMapper's app config object. */
export interface Datastore {
  name?: string,
  type?: string,
  rootUrl?: string,
  aliases?: string[]
  apiKey?: string;
}

/** A parsed full TSID string. */
export interface TSID {
  location?: string;
  datastore?: string;
  path?: string;
}

///////////////////////////// TELEMETRY STATION \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/** Telemetry Station imported from TSTool. */
export interface TelStation {
  abbrev: string;
  contrArea: number;
  county: string;
  dataSource: string;
  dataSourceAbbrev: string;
  division: number;
  drainArea: number;
  flagA: string;
  flagB: string;
  gnisId: string;
  huc10: string;
  latitude: number;
  locationAccuracy: string;
  longitude: number;
  measDateTime: any;
  measValue: any;
  modified: any;
  moreInformation: string;
  parameter: string;
  stage: number;
  stationName: string;
  stationPorEnd: any;
  stationPorStart: any;
  stationStatus: string;
  stationType: string;
  streamMile: number;
  structureType: string;
  thirdParty: boolean;
  units: string;
  usgsStationId: string;
  utmX: number;
  utmY: number;
  waterDistrict: number;
  waterSource: string;
  wdid: string;
}

/** Telemetry Station Data Type imported from TSTool. */
export interface TelStationDataType {
  abbrev: string;
  contrArea: number;
  county: string;
  dataSource: string;
  dataSourceAbbrev: string;
  division: number;
  drainArea: number;
  gnisId: string;
  huc10: string;
  latdecdeg: number;
  locationAccuracy: string;
  longdecdeg: number;
  modified: any;
  parameter: string;
  parameterPorEnd: any;
  parameterPorStart: any;
  parameterUnit: string;
  stationName: string;
  stationStatus: string;
  stationType: string;
  streamMile: number;
  structureType: string;
  thirdParty: boolean;
  timeStep?: string;
  usgsStationId: string;
  utmX: number;
  utmY: number;
  waterDistrict: number;
  waterSource: string;
  wdid: string;
}

/** Telemetry Time Series imported from TSTool. */
export interface TelTimeSeries {
  abbrev: string;
  flagA: string;
  flagB: string;
  measCount: number;
  measDate?: any;
  measDateTime?: any;
  measUnit: string;
  measValue: number;
  modified: any;
  parameter: string;
}

/////////////////////////////////// TREE \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/** Sent from each IM Builder node-menu component to the main Build component. */
export interface MenuChoice {
  choiceType: string;
  node: TreeFlatNode;
}

/** A flat version of the TreeNode to be used with a flat Angular Material tree.
 * Used for dragging and dropping the treen nodes. */
export interface TreeFlatNode {
  expandable?: boolean;
  name?: string;
  id?: string;
  level?: string;
  saved?: boolean;
  flatLevel?: number;
}

/** Used by the Angular Material Tree Control and Data Source in the IM Builder. */
export interface TreeNodeData extends TreeNode<TreeNodeData> {
  level: string;
  name: string;
  id?: string;
  saved?: boolean;
  children?: TreeNodeData[];
}

/////////////////////////////////// FILE \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/** Used by application file explorer components. */
export interface FileNode {
  id?: string;
  isFolder: boolean;
  name: string;
  parent: string;
}

////////////////////////////////// SEARCH \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/** Item that can be added to the Lunr search index. */
export interface SearchItem {
  title: string;
  text?: string;
  keywords?: string;
}

/** Contains metadata for a SearchItem that shouldn't be searchable in the index,
 * but is needed for displaying the results in the search table. */
export interface SearchItemMetadata {
  routerPath: string;
  type: string;
}

/** Optional choices to enhance a global application search. */
export interface SearchOptions {
  keywordSearch: boolean;
  fuzzySearch: boolean;
}

/** Used by the Angular Material table to display the results of a search. */
export interface SearchResultsDisplay {
  page: string;
  totalScore: number;
  routerPath: string;
  type: string;
}

/////////////////////////////// MISCELLANEOUS \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/** Passed from the Chart component with the necessary data for creating and displaying
 * an attribute table. */
export interface AttributeTableParams {
  attributeTable: any[];
  dateTimeColumnName: string;
  isTSFile: boolean;
  TSArrayRef: any[];
  valueColumns: string[];
}

/** Chart Dialog properties. */
export interface ChartDialog {
  graphTemplate: GraphTemplate;
}

/** Currently unused. Object holding all possible parameters that can be given to
 * a dialog. */
export interface DialogParams {
  fullResourcePath?: string;
  text?: string;
  windowID?: string;
}

/** Currently unused. Might be used with the IM Builder, which is currently using
 * this same type in the application. */
export interface ParamAccountValues {
  accountPath?: string;
  accountType?: string;
  accountName?: string;
  region?: string;
  userPoolId?: string;
  userPoolClientId?: string;
}

/** Currently unused. Might be used with the IM Builder, which is currently using
 * this same type in the application. */
export interface ParamAccount {
  slug?: string;
  values?: ParamAccountValues;
}


/** Can be returned from the obtainPropertiesFromLine() method. Used for searching
 * through all found ${} properties in a string. */
export interface ParsedProp {
  foundProps: string[];
  line: string;
}

/** Can be used to tell an AppConfig object that a map is to be used by itself, instead
 * of the entire InfoMapper application. */
export interface StandaloneMap {
  mapProject: string;
}

/** Type to be used recursively by the TreeNodeData interface. Code found at:
 * https://stackoverflow.com/questions/47842266/recursive-types-in-typescript. */
export type TreeNode<T> = {
  [key: string]: boolean | number | string | T[];
}