import { Component,
          Inject,
          OnDestroy,
          OnInit }          from '@angular/core';

import { MatDialogRef,
          MAT_DIALOG_DATA } from '@angular/material/dialog';

import { OwfCommonService,
          Path }            from '@OpenWaterFoundation/common/services';
import { DialogService }    from '../dialog.service';

import { faXmark }          from '@fortawesome/free-solid-svg-icons';

import { MapLayerManager,
          MapLayerItem }    from '@OpenWaterFoundation/common/ui/layer-manager';
import { WindowManager }    from '@OpenWaterFoundation/common/ui/window-manager';

import * as Showdown        from 'showdown';


@Component({
  selector: 'app-dialog-properties',
  templateUrl: './dialog-properties.component.html',
  styleUrls: ['./dialog-properties.component.css', '../main-dialog-style.css']
})
export class DialogPropertiesComponent implements OnInit, OnDestroy {
  /** The layer's geoLayerId. */
  geoLayerId: string;
  /** The reference to the layer's geoLayer object. */
  geoLayer: any;
  /** The MapLayerItem that represents the layer for the properties being displayed. */
  layerItem: MapLayerItem;
  /** An array of all properties for this layer. */
  layerProperties: string[];
  /** Used as a path resolver and contains the path to the map configuration that is
   * using this TSGraphComponent. To be set in the app service for relative paths. */
  mapConfigPath: string;
  /** The instance of the MapLayerManager, a helper class that manages MapLayerItem
   * objects with Leaflet layers and other layer data for displaying, ordering,
   * and highlighting. */
  mapLayerManager: MapLayerManager = MapLayerManager.getInstance();
  /** The formatted string to be converted to HTML by Showdown. */
  showdownHTML: string;
  /** The Showdown config option object. Overrides the `app.module.ts` config option object. */
  showdownOptions = {
    emoji: true,
    flavor: 'github',
    noHeaderId: true,
    openLinksInNewWindow: true,
    parseImgDimensions: true,
    // This must exist in the config object and be set to false to work.
    simpleLineBreaks: false,
    strikethrough: true,
    tables: true
  }
  /** A unique string representing the windowId of this Dialog Component in the WindowManager. */
  windowId: string;
  /** The windowManager instance, which creates, maintains, and removes multiple open dialogs in an application. */
  windowManager: WindowManager = WindowManager.getInstance();
  /** All used icons in the DialogPropertiesComponent. */
  faXmark = faXmark;
  

  /**
   * 
   * @param dialogRef The reference to the DialogTSGraphComponent. Used for creation and sending of data.
   * @param commonService The reference to the app service, for sending data between components and higher scoped map variables.
   * @param matDialogData The object containing data passed from the Component that created this Dialog.
   */
  constructor(
    private commonService: OwfCommonService,
    private dialogService: DialogService,
    private dialogRef: MatDialogRef<DialogPropertiesComponent>,
    @Inject(MAT_DIALOG_DATA) private matDialogData: any
  ) {

    this.geoLayer = this.matDialogData.data.geoLayer;
    this.geoLayerId = this.matDialogData.data.geoLayerId;
    this.layerProperties = this.matDialogData.data.layerProperties;
    this.layerItem = this.mapLayerManager.getMapLayerItem(this.geoLayerId);
    this.mapConfigPath = this.matDialogData.data.mapConfigPath;
    this.windowId = this.geoLayerId + '-dialog-properties';
  }


  /**
   * Iterate over the geoLayer object and assigns each key and value to a table and gives other useful information to users in a
   * markdown string so it can be displayed in the dialog. Formats some of the attributes as well for lengthy URL's. 
   */
  private buildMarkdownString(): string {

    var markdownString = '## Layer Properties ##\n\n' +
    'Layers have the following properties:\n' +
    'Raster layers contain equal-sized grid cells with dimensional units that match the coordinate ' +
    'reference system. Raster layers contain one or more bands, each of which have a data type and ' +
    'contain values for the raster cells.  Mouse over a cell or click on a cell to see the cell\'s ' +
    'data value.  Cell values can can also have no data value.' +
    '2. Layer metadata, which is information about the layer (see the ***Layer Metadata*** and ***Layer ' +
    'Configuration Properties*** sections below).\n\n';
    
    // Create the Layer Properties table by iterating over all properties in a feature in the layer, if the layer is a Vector.
    if (this.layerItem.isVectorLayer() === true) {
      markdownString += '| Property - (Attribute)|\n| ------- |\n';
      for (let property of this.layerProperties) {
        markdownString += '| ' + property + ' |\n';
      }
    }
    // If the layer is a Raster layer, add the main properties for the layer, then iterate through each band and list information
    // for each one.
    else if (this.layerItem.isRasterLayer() === true) {
      markdownString += '## Raster Properties ##\n\n' +
      '<pre class="raster-properties">';

      let geoRaster = this.layerItem.getItemLeafletLayer();

      markdownString +=
      '<b>Height:</b> ' + geoRaster.height + '\n' +
      '<b>Width:</b> ' + geoRaster.width + '\n' +
      '<b>Number of Bands:</b> ' + geoRaster.rasters.length + '\n' +
      '<b>Max Lat:</b> ' + geoRaster.maxLat.toFixed(8) + '\n' +
      '<b>Max Lng:</b> ' + geoRaster.maxLng.toFixed(8) + '\n' +
      '<b>Min Lat:</b> ' + geoRaster.minLat.toFixed(8) + '\n' +
      '<b>Min Lng:</b> ' + geoRaster.minLng.toFixed(8) + '\n' +
      '<b>Pixel Height:</b> ' + geoRaster.pixelHeight.toFixed(8) + '\n' +
      '<b>Pixel Width:</b> ' + geoRaster.pixelWidth.toFixed(8) + '\n' +
      '<b>Projection:</b> ' + geoRaster.projection + '\n' +
      '<b>Tile Height:</b> ' + geoRaster.tileHeight + '\n' +
      '<b>Tile Width:</b> ' + geoRaster.tileWidth + '\n' +
      '<b>x Max:</b> ' + geoRaster.xmax.toFixed(8) + '\n' +
      '<b>x Min:</b> ' + geoRaster.xmin.toFixed(8) + '\n' +
      '<b>y Max:</b> ' + geoRaster.ymax.toFixed(8) + '\n' +
      '<b>y Min:</b> ' + geoRaster.ymin.toFixed(8) + '\n\n';
      
      for (let i = 0; i < geoRaster.rasters.length; ++i) {
        markdownString +=
        '<b>Band ' + (i + 1) + '</b>\n' +
        '  <b>Data Type:</b> ' + this.dialogService.getInstanceOf(geoRaster.rasters[i][0]) + '\n' +
        '  <b>Has No Data Value:</b> ' + (geoRaster.noDataValue === null ? 'False' : 'True') + '\n' +
        '  <b>No Data Value:</b> ' + (geoRaster.noDataValue === null ? 'N/A' : geoRaster.noDataValue) + '\n';
      }

      markdownString += '</pre>\n\n';

      markdownString += '# Layer Properties #\n\n' +
      'Raster layers have the following properties:\n' + 
      '1. Raster layers contain equal-sized grid cells with dimensional units that match the coordinate reference system. ' +
      'Raster layers contain one or more bands, each of which have a data type and contain values for the raster cells. ' +
      'Mouse over a cell or click on a cell to see the cell\'s data value.  Cell values can can also have no data value.\n' +
      '2. Layer metadata, which is information about the layer (see the ***Layer Metadata*** and ***Layer Configuration Properties*** sections below).\n\n'
    }
    

    markdownString += '## Layer Metadata ##\n\n' +
    'This application does not currently support displaying Geographic Information System layer metadata files. However, this feature is envisioned for the future.\n\n';

    markdownString += '## Layer Configuration Properties\n\n' +
    'The following are layer configuration properties that are used by the web application.\n' +
    'URL values, such as for `sourcePath`, are automatically detected and are converted to display "Link". If the URL contains a ' +
    'supported file extension (.csv, .json, etc.), clicking on link will immediately download the file. If download is not automatic, ' +
    'clicking on link will show the file in a new tab, which can be saved using the browser\'s save feature. Additionally, right-click ' +
    'on the link and save the associated file using ***Save link as…***\n\n';

    // Create the Layer Configuration Properties table by iterating over all properties in the geoLayer object
    markdownString += '| Property | Value |\n| ------ | ------ |\n';
    for (let property in this.geoLayer) {
      // Skip the history property, as it is not relevant to all users, per Steve
      if (property.toUpperCase().includes('HISTORY')) {
        continue;
      }
      // The value from the geoLayer object is an array. Iterate over it and use the same property name, with the each value
      // either printed normally if a number or string, or as a link
      if (Array.isArray(this.geoLayer[property])) {
        for (let prop of this.geoLayer[property]) {
          markdownString += '| ' + property + ' | ' +

          (this.commonService.isURL(prop) ? '[Link] (' + prop + ')' : prop) +
                            ' |\n';
        }
      } else if (typeof this.geoLayer[property] === 'object') {
        // When handling a nested object in the geoLayer object, this only handles ONE. Any more nested objects will not be printed.
        for (let prop in this.geoLayer[property]) {
          markdownString += '| ' + prop + ' | ' +

          (this.commonService.isURL(this.geoLayer[property][prop]) ? '[Link] (' + this.geoLayer[property][prop] + ')' : this.geoLayer[property][prop]) +
                            ' |\n';
        }
      } else if (typeof this.geoLayer[property] === 'string') {
        markdownString += '| ' + property + ' | ' +
        
        (this.commonService.isURL(this.geoLayer[property]) ? '[Link] (' + this.geoLayer[property] + ')' : this.geoLayer[property]) +
                          ' |\n';
      }
    }
    

    var fullPath: string = this.commonService.buildPath(Path.gLGJP, [this.geoLayer.sourcePath]);
    var formattedPath = this.commonService.condensePath(fullPath, 'link');

    markdownString += '\n## Download Layer ##\n\n' +
    'The source layer file can be downloaded from: [' + formattedPath + '] (' + fullPath + ')\n\n' +
    'In some cases the source layer is a URL and not a simple file. In this case, use the `sourcePath` in Layer Configuration ' +
    'Properties to access the source data. The layer **Information** popup menu also typically lists the data source.'

    return markdownString;
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive. Called after the constructor.
   */
  ngOnInit(): void {
    this.commonService.setMapConfigPath(this.mapConfigPath);
    this.formatLayerProperties();

    var markdownString = this.buildMarkdownString();
    let converter = new Showdown.Converter({
        openLinksInNewWindow: true,
        parseImgDimensions: true,
        simpleLineBreaks: false,
        strikethrough: true,
        tables: true
    });
    this.showdownHTML = converter.makeHtml(markdownString);
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked, and removes this
   * dialog's window ID from the windowManager.
   */
  onClose(): void {
    this.dialogRef.close();
    this.windowManager.removeWindow(this.windowId);
  }

  /**
   * Called once, before the instance is destroyed. If the page is changed or a
   * link is clicked on in the dialog that opens a new map, make sure to close the
   * dialog and remove it from the window manager.
   */
  ngOnDestroy(): void {
    this.dialogRef.close();
    this.windowManager.removeWindow(this.windowId);
  }

  /**
   * Iterates over the layer properties array and formats each property string so
   * they can be appropriately displayed in a markdown string.
   */
  private formatLayerProperties(): void {
    // Index iteration must be used since we're changing the original array elements.
    for (let i = 0; i < this.layerProperties.length; ++i) {
      //  An underscore is used as a styling mechanism for markdown. If one is encountered,
      // two backslashes will add one backslash, since backslashes needs to be escaped.
      // Then the single backslash is itself being used to escape the underscore, so if
      // part of a property string is encased by them, it won't italicize the word.
      this.layerProperties[i] = this.layerProperties[i].replace(/_/g, '\\_');
    }
  }

}
