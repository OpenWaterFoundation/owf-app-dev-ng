import * as $ from 'jquery';

/**
 * A class that holds Leaflet and geoMapProject layer information and data. 
 */
export class MapLayerItem {
  /** A Marker to show where a filtered address resides on the map, connected to this LayerItem. */
  private addressMarker: any;
  /** A boolean representing whether this Item's Leaflet layer has been added to the Leaflet map initially. */
  private addedToMainMap = false;
  /** A boolean representing whether this Item's Leaflet layer is currently being displayed on the map. */
  private displayed = false;
  /** A boolean representing whether the Leaflet layer of this Item is a raster layer. */
  private isRaster: boolean;
  /** A boolean representing whether the Leaflet layer iof this Item is a vector layer. */
  private isVector: boolean;
  /** The Item's geoLayerId that it belongs to. */
  private layerItemGeoLayerId: string;
  /** The Item's geoLayerViewGroupId of the geoLayerViewGroup it belongs to. */
  private layerItemViewGroupId: string;
  /** The Leaflet layer created to be shown on the Leaflet map. */
  private leafletLayer: any;
  /**
   * The selectedBehavior property for this Item's Leaflet layer. Default is Any, signifying that the Item's geoLayerViewGroup
   * can have some, all or no layers opened or closed at given time.
   */
  private selectBehavior = 'Any';
  /** The selectedInitial property for this Item's Leaflet layer for initially displaying the layer on the map. */
  private selectInitial: boolean;
  /**
   * A separate selected geoJSON layer used for highlighting on the map. Can be added to the MapLayerItem so a map toggle
   * will effect both the selected highlighted layer and the regularly shown MapItem layer as well.
   */
  private selectedLayer: any;


  /**
   * @constructor Initializes a new MapLayerItem instance.
   * @param leafletLayer The reference to the Leaflet layer object that will be added to this Item.
   * @param geoLayer The geoLayer object from the map configuration file.
   * @param geoLayerView The geoLayerView object from the map configuration file.
   * @param geoLayerViewGroup The geoLayerViewGroup object from the map configuration file.
   * @param isRaster An optional argument for whether the Leaflet layer being added is a Raster layer. Will never be false; can
   * be undefined when creating a Vector layer, or true when creating a Raster.
   */
  constructor(leafletLayer: any, geoLayer: any, geoLayerView: any, geoLayerViewGroup: string, isRaster?: boolean) {
    this.init(leafletLayer, geoLayer, geoLayerView, geoLayerViewGroup, isRaster);
  }

  /**
   * Sets the given Marker to this LayerItem's @var addressMarker so it can be attached for layer toggling.
   * @param addressMarker The Marker to be added to this LayerItem.
   */
  public addAddressMarker(addressMarker: any): void {
    this.addressMarker = addressMarker;
  }

  /**
   * Adds the Leaflet layer from this layer item back onto the Leaflet map, set the @var displayed to true, hides both the
   * layer's description and symbol, and turns the slide toggle from off to checked
   * @param mainMap The reference to the Leaflet map object
   */
  public addItemLeafletLayerToMainMap(mainMap: any): void {
    mainMap.addLayer(this.leafletLayer);
    // Check to see if a selected layer exists and add it to the map as well.
    if (this.selectedLayer) {
      this.selectedLayer.addTo(mainMap);
    }
    // Check to see if an address marker exists and add it to the map.
    if (this.addressMarker) {
      this.addressMarker.addTo(mainMap);
    }
    this.displayed = true;

    (<HTMLInputElement>document.getElementById(this.layerItemGeoLayerId + "-slider")).checked = true;
    let description = $("#description-" + this.layerItemGeoLayerId);
    description.css('visibility', 'visible');
    description.css('height', '100%');
    let symbols = $("#symbols-" + this.layerItemGeoLayerId);
    symbols.css('visibility', 'visible');
    symbols.css('height', '100%');
  }

  /**
   * Sets the given Leaflet layer to this LayerItem and adds it to the given Leaflet map.
   * @param leafletLayer The leaflet layer to be added to this LayerItem.
   * @param mainMap The leaflet map that the layer will be added to.
   */
  public addLeafletLayer(leafletLayer: any, mainMap: any): void {
    this.leafletLayer = leafletLayer;
    mainMap.addLayer(this.leafletLayer);
  }

  /**
   * 
   * @param selectedLayer The geoJSON created Leaflet layer to be added to the layer item.
   */
  public addSelectedLayerToMainMap(selectedLayer: any, mainMap: any): void {
    this.selectedLayer = selectedLayer;
    this.selectedLayer.addTo(mainMap);
  }

  /**
   * @returns This MapLayerItem's geoLayerViewGroupId that it came from
   */
  public getItemGeoLayerViewGroupId(): string {
    return this.layerItemViewGroupId;
  }

  /**
   * @returns This MapLayerItem's Leaflet layer
   */
  public getItemLeafletLayer(): any {
    return this.leafletLayer;
  }

  /**
   * @returns This Item's selectBehavior.
   */
  public getItemSelectBehavior(): string {
    return this.selectBehavior;
  }

  /**
   * @returns The currently displayed selected geoJson layer.
   */
  public getSelectedLayer(): any {
    return this.selectedLayer;
  }

  /**
   * @returns Whether this LayerItem has any currently shown selected highlight layers or markers.
   */
  public hasAnySelectedLayers(): boolean {
    return (this.selectedLayer || this.addressMarker) ? true : false;
  }

  public hasSelectedLayer(): boolean {
    return this.selectedLayer ? true : false;
  }

  /**
   * Initializes and assigns the necessary variables for MapLayerItem creation set up.
   * @param leafletLayer The leaflet layer for the Leaflet map
   * @param geoLayer This layer's geoLayer from the geoMap
   * @param geoLayerView This layer's geoLayerView from the geoMap
   */
  private init(leafletLayer: any, geoLayer: any, geoLayerView: any, geoLayerViewGroup: any, isRaster?: boolean): void {
    this.displayed = false;
    this.leafletLayer = leafletLayer;
    if (geoLayerView.properties.selectedInitial === undefined || geoLayerView.properties.selectedInitial.toUpperCase() === 'TRUE') {
      this.selectInitial = true;
    } else if (geoLayerView.properties.selectedInitial.toUpperCase() === 'FALSE') {
      this.selectInitial = false;
    }
    this.layerItemViewGroupId = geoLayerViewGroup.geoLayerViewGroupId;
    this.layerItemGeoLayerId = geoLayer.geoLayerId;

    if (geoLayerViewGroup.properties.selectBehavior) {
      this.selectBehavior = geoLayerViewGroup.properties.selectBehavior;
    }

    if (isRaster === true) {
      this.isRaster = true;
      this.isVector = false;
    } else {
      this.isVector = true;
      this.isRaster = false;
    }
  }

  /**
   * Add the leaflet layer to the Leaflet map for the first time, doing the initializing step
   * of setting the @var addedToMainMap to true.
   * @param mainMap The reference to the Leaflet map object
   */
  public initItemLeafletLayerToMainMap(mainMap: any): void {
    if (this.leafletLayer.rasters) {
      this.leafletLayer.setZIndex(999);
    }
    this.leafletLayer.addTo(mainMap);
    // Check to see if a selected layer exists and add it to the map as well.
    if (this.selectedLayer) {
      this.selectedLayer.addTo(mainMap);
    }
    // Check to see if an address marker exists and add it to the map.
    if (this.addressMarker) {
      this.addressMarker.addTo(mainMap);
    }
    this.addedToMainMap = true;
    this.displayed = true;

    (<HTMLInputElement>document.getElementById(this.layerItemGeoLayerId + "-slider")).checked = true;
    let description = $("#description-" + this.layerItemGeoLayerId);
    description.css('visibility', 'visible');
    description.css('height', '100%');
    let symbols = $("#symbols-" + this.layerItemGeoLayerId);
    symbols.css('visibility', 'visible');
    symbols.css('height', '100%');
  }

  /**
   * @returns whether this layer item has been added to the Leaflet map for the first time
   */
  public isAddedToMainMap(): boolean {
    return this.addedToMainMap;
  }

  /**
   * @returns A boolean of whether this layer item is currently being displayed on the Leaflet map.
   */
  public isDisplayedOnMainMap(): boolean {
    return this.displayed;
  }

  /**
   * @returns A boolean of whether this Item's leaflet layer is a raster layer.
   */
  public isRasterLayer(): boolean {
    return this.isRaster;
  }

  /**
   * @returns A boolean of whether this Item's leaflet layer is a vector layer.
   */
  public isVectorLayer(): boolean {
    return this.isVector;
  }

  /**
   * @returns whether this layer item has the selectedInitial property set to true (undefined is defaulted to true) or false.
   */
  public isSelectInitial(): boolean {
    return this.selectInitial;
  }

  /**
   * Removes all selected highlighted layers connected to this LayerItem from the Leaflet map. If the optional hide argument
   * exists, treats the removal of the selected layer(s) as hidden on the map, keeping them in the layerItem.
   * @param mainMap The Leaflet map object reference.
   */
  public removeAllSelectedLayers(mainMap: any, hide?: any): void {
    // Check to see if a selected layer exists and remove it from the map.
    if (this.selectedLayer) {      
      mainMap.removeLayer(this.selectedLayer);
      // If hide is undefined, also set the selectedLayer to undefined to permanently remove it from this layerItem until
      // it is added back in.
      if (!hide) {
        this.selectedLayer = undefined;
      }
    }
    // Check to see if an address marker exists and remove it from the map.
    if (this.addressMarker) {
      mainMap.removeLayer(this.addressMarker);
    }
  }

  /**
   * Removes the Item Leaflet layer from the Leaflet map, sets the @var displayed to false, hides the description and symbol
   * of the layer in the side bar, and toggles the slide toggle button from checked to off.
   * @param mainMap The reference to the Leaflet map object.
   */
  public removeItemLeafletLayerFromMainMap(mainMap: any): void {
    // Remove the main layer associated with this LayerItem.
    mainMap.removeLayer(this.leafletLayer);
    // Check to see if a selected layer exists and remove it from the map.
    this.removeAllSelectedLayers(mainMap, 'hide');
    this.displayed = false;

    (<HTMLInputElement>document.getElementById(this.layerItemGeoLayerId + "-slider")).checked = false;
    let description = $("#description-" + this.layerItemGeoLayerId);
    description.css('visibility', 'hidden');
    description.css('height', 0);
    let symbols = $("#symbols-" + this.layerItemGeoLayerId);
    symbols.css('visibility', 'hidden');
    symbols.css('height', 0);
  }

}