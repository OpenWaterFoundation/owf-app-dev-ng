import GeoRasterLayer      from 'georaster-layer-for-leaflet';
import { MapLayerManager,
          MapLayerItem }   from '@OpenWaterFoundation/common/ui/layer-manager';

import geoblaze            from 'geoblaze';
import { format }          from 'date-fns';
import { EventConfig,
          GeoLayerSymbol,
          GeoLayerView,
          Operator,
          PropFunction,
          Style }          from '@OpenWaterFoundation/common/services';

declare var L: any;


/**
 * A utilization class for the Map Component and some Dialog Component classes.
 * It helps with unit & integration testing using Jasmine and Karma by keeping code
 * out of the Component class, which has proven difficult to test due to their size.
 */
// @dynamic
export class MapUtil {
  
  /** Object with the geoLayerId as the key, and an object for displaying a raster
   * cell's information in the upper left Leaflet Control div popup. Used for keeping
   * track of multiple rasters shown on the map. */
  private static currentRasterLayers: any = {};
  /** The constant containing the colors of a defaulted color table for displaying categorized layers. */
  static readonly defaultColorTable =
    ['#b30000', '#ff6600', '#ffb366', '#ffff00', '#59b300', '#33cc33', '#b3ff66', '#00ffff',
      '#66a3ff', '#003cb3', '#3400b3', '#6a00b3', '#9b00b3', '#b30092', '#b30062', '#b30029'];
  /** Holds the original style object of a feature on the layer. */
  private static originalStyle: any;
  /** The instance of the MapLayerManager, a helper class that manages MapLayerItem
   * objects with Leaflet layers and other layer data for displaying, ordering,
   * and highlighting. */
  mapLayerManager: MapLayerManager = MapLayerManager.getInstance();
  /** The constant variable for what a cell value will contain as a missing value.
   * NOTE: May be turned into an array in the future for a list of all known missing
   * values. */
  private static readonly missingValue = -3.3999999521443642e38;
  /** A read only object for dynamically using operators between two integers. */
  static readonly operators = {
    '>': function (a: any, b: any) { return a > b; },
    '>=': function (a: any, b: any) { return a >= b; },
    '<': function (a: any, b: any) { return a < b; },
    '<=': function (a: any, b: any) { return a <= b; }
  }

  /**
   * Adds style to a geoJson Leaflet layer, determined by properties set in the GeoLayerSymbol, or set to a default.
   * @param sp The object being passed with Style Property data.
   */
  static addStyle(sp: any): any {
    // Convert the symbolShape property (if it exists) to lowercase, needed to work with the third-party npm package ShapeMarker.
    if (sp.symbol.properties.symbolShape) {
      sp.symbol.properties.symbolShape = sp.symbol.properties.symbolShape.toLowerCase();
    }

    // TODO: jpkeahey 2020.08.14 - Classification file might not be the best way to determine whether or not
    // the layer is a categorized polygon.
    // The style returned is either for a categorized polygon, and everything else.
    if (sp.symbol.properties.classificationFile) {
      // Before the classification attribute is used, check to see if it exists, and complain if it doesn't. Don't use bang (!)
      // at the start of the conditional, because if the classificationAttribute is 0, not 0 is true, and this error will print.
      if (sp.feature['properties'][sp.symbol.classificationAttribute] === undefined) {
        console.error("The property 'classificationAttribute' value '" + sp.symbol.classificationAttribute +
          "' was not found. Confirm that the specified attribute exists in the layer attribute table." +
          'Using default styling.');
      }

      // Check to see if the classificationType exists and is defined as graduated.
      if (sp.symbol.classificationType && sp.symbol.classificationType.toUpperCase().includes('GRADUATED')) {
        // Iterate over each line in the classification file.
        for (let line of sp.results) {
          var valueObj = MapUtil.determineValueOperator(line.valueMin, line.valueMax);
          // MapUtil.operators is the readonly object that maps each operator string to a function,
          // e.g. MapUtil.operators['>'] will do a > b.
          if (MapUtil.operators[valueObj.minOp](sp.feature.properties[sp.symbol.classificationAttribute], valueObj.valueMin) &&
              //               |---operator---||--------------------------a----------------------------|  |--------b-------|
              MapUtil.operators[valueObj.maxOp](sp.feature.properties[sp.symbol.classificationAttribute], valueObj.valueMax)) {
            
            // Don't need to convert hex to RGB because Leaflet will take care it.
            return {
              color: this.verify(line.color, Style.color),
              fillColor: this.verify(line.fillColor, Style.fillColor),
              fillOpacity: this.verify(line.fillOpacity, Style.fillOpacity),
              opacity: this.verify(line.opacity, Style.opacity),
              radius: this.verify(parseInt(line.symbolSize), Style.size),
              shape: this.verify(line.symbolShape, Style.shape),
              weight: this.verify(parseInt(line.weight), Style.weight)
            };
          }
        }
        return;
      }

      // TODO: jpkeahey 2021.05.27 - Replace the i with a (let ... of ...) loop 
      for (let i = 0; i < sp.results.length; i++) {
        // If the classificationAttribute is a string, check to see if it's the same as the variable returned from Papaparse.
        if (typeof sp.feature['properties'][sp.symbol.classificationAttribute] === 'string' &&
          sp.feature['properties'][sp.symbol.classificationAttribute].toUpperCase() === sp.results[i]['value'].toUpperCase()) {

          return {
            color: this.verify(sp.results[i]['color'], Style.color),
            fillOpacity: this.verify(sp.results[i]['fillOpacity'], Style.fillOpacity),
            opacity: this.verify(sp.results[i]['opacity'], Style.opacity),
            stroke: sp.symbol.properties.outlineColor === "" ? false : true,
            weight: this.verify(parseInt(sp.results[i]['weight']), Style.weight)
          }
        }
        // If the classificationAttribute is a number, compare it with the results.
        else if (sp.feature['properties'][sp.symbol.classificationAttribute] === parseInt(sp.results[i]['value'])) {
          return {
            color: this.verify(sp.results[i]['color'], Style.color),
            fillOpacity: this.verify(sp.results[i]['fillOpacity'], Style.fillOpacity),
            opacity: this.verify(sp.results[i]['opacity'], Style.opacity),
            stroke: sp.symbol.properties.outlineColor === "" ? false : true,
            weight: this.verify(parseInt(sp.results[i]['weight']), Style.weight)
          }
        }
      }

    }
    // Return all possible style properties, and if the layer doesn't have a use for one, it will be ignored.
    else {
      return {
        color: this.verify(sp.symbol.properties.color, Style.color),
        fillColor: this.verify(sp.symbol.properties.fillColor, Style.fillColor),
        fillOpacity: this.verify(sp.symbol.properties.fillOpacity, Style.fillOpacity),
        opacity: this.verify(sp.symbol.properties.opacity, Style.opacity),
        radius: this.verify(parseInt(sp.symbol.properties.symbolSize), Style.size),
        stroke: sp.symbol.properties.outlineColor === "" ? false : true,
        shape: this.verify(sp.symbol.properties.symbolShape, Style.shape),
        weight: this.verify(parseInt(sp.symbol.properties.weight), Style.weight)
      }
    }

  }

  /**
   * Goes through each feature in the selected layer and assigns an arbitrary hex number color to display both on the map
   * and the legend. NOTE: There cannot be more than 16 default colors for the InfoMapper.
   * @returns an string array containing the feature label, followed by the feature color e.g. colorTable = ['Bear Creek', '#003cb3'];
   * @param features An array of all features of the selected layer
   * @param symbol The symbol object containing data about the selected layer
   */
  static assignColor(features: any[], symbol: any): string[] {
    let colors: string[] = MapUtil.defaultColorTable;
    let colorTable: any[] = [];

    // Before the classification attribute is used, check to see if it exists,
    // and complain if it doesn't.
    if (!features[0]['properties'][symbol.classificationAttribute]) {
      console.error("The classification file property 'classificationAttribute' value",
        features[0]['properties'][symbol.classificationAttribute],
        "was not found. Confirm that the specified attribute exists in the layer attribute table.");
    }

    // TODO: jpkeahey 2020.04.30 - Let people know that no more than 16 default
    // colors can be used
    for (let i = 0; i < features.length; i++) {
      if (typeof features[i]['properties'][symbol.classificationAttribute] === 'string') {
        colorTable.push(features[i]['properties'][symbol.classificationAttribute].toUpperCase());
      }
      else {
        colorTable.push(features[i]['properties'][symbol.classificationAttribute]);
      }
      colorTable.push(colors[i]);
    }
    return colorTable;
  }

  // TODO: jpkeahey 2020.07.20 - This isn't being used, and therefore the legend colors aren't being set. What to do?
  /**
   * If no color table is given, create your own for populating the legend colors
   * @param features All features on the Leaflet layer
   * @param symbol The geoLayerSymbol data from the geoLayer
   */
  private assignLegendColor(features: any[], symbol: any) {
    let colors: string[] = MapUtil.defaultColorTable;
    let colorTable: any[] = [];
    // TODO: jpkeahey 2020.04.30 - Make sure you take care of more than 16
    for (let i = 0; i < features.length; i++) {
      colorTable.push(symbol.classificationAttribute + ' ' +
        features[i]['properties'][symbol.classificationAttribute]);
      colorTable.push(colors[i]);
    }
    return colorTable;
  }

  /**
   * @returns The divContent string with the default HTML to show in the Leaflet popup. Shows properties, converted links,
   * and converted Linux like epoch times into human readable date/times.
   * @param featureProperties The object containing feature properties. May be filtered.
   */
  static buildDefaultDivContentString(featureProperties: any): string {
    var divContents = '';
    var feature: any;
    // Boolean to show if we've converted any epoch times in the features. Used to add what the + sign means in the popup.
    var converted = false;
    // Boolean to help determine if the current property needs to be converted
    var convertedEpochTime: boolean;

    // Go through each property and write the correct html for displaying
    for (let property in featureProperties) {
      // Reset the converted boolean so the rest of the feature don't have + signs on them
      convertedEpochTime = false;
      // Rename features so the long e.tar... isn't used in many places
      feature = featureProperties[property];
      if (typeof feature == 'string') {
        if (feature.startsWith("http://") || feature.startsWith("https://")) {
          // If the value is a http or https link, convert it to one
          divContents += '<b>' + property + ':</b> ' +
            "<a class='leaflet-popup-wrap' href='" +
            encodeURI(feature) + "' target=_blank'" +
            "'>" +
            feature +
            "</a>" +
            "<br>";

        } else { // Display a regular non-link string in the popup
          divContents += '<b>' + property + ':</b> ' + feature + '<br>';
        }
      } else { // Display a non-string in the popup
        // This will convert the feature to ISO 8601 string using date-fns.
        if (typeof feature === 'number') {
          if (/date|time/i.test(property) && feature > 1000000000) {
            converted = true;
            convertedEpochTime = true;

            divContents += '<b>' + property + ':</b> ' + feature + '<br>';
            feature = MapUtil.convertEpochToFormattedDate(feature);
          }
        }

        if (convertedEpochTime) {
          divContents += '<b>+' + property + '</b>: ' + feature + '<br>';
        } else {
          divContents += '<b>' + property + '</b>: ' + feature + '<br>';
        }

      }
    }
    // Add in the explanation of what the prepended + sign means above
    if (converted) {
      divContents += '<br> <b>+</b> auto-generated values';
    }
    return divContents;
  }

  /**
   * Build the string that will become the HTML to populate the Leaflet popup with feature properties and the possibility
   * of TSGraph & Doc creating bootstrap buttons.
   * @param popupTemplateId The id property from the popup template config file to help ensure HTML id uniqueness
   * @param action The action object from the popup template config file
   * @param layerAttributes An object containing up to 3 arrays for displaying properties for all features in the layer.
   * @param featureProperties All feature properties for the layer.
   * @param firstAction Boolean showing whether the action currently on is the first action, or all others after.
   */
  static buildPopupHTML(popupTemplateId: string, action: any, layerAttributes: any,
    featureProperties: any, firstAction: boolean, hoverEvent?: boolean): string {

    // VERY IMPORTANT! When the user clicks on a marker, a check is needed to determine if the marker has been clicked on before,
    // and if so, that HTML element needs to be removed so it can be created again. This allows each created button to be
    // referenced specifically for the marker being created.
    if (firstAction !== null) {
      if (L.DomUtil.get(popupTemplateId + '-' + action.label) !== null) {
        L.DomUtil.remove(L.DomUtil.get(popupTemplateId + '-' + action.label));
      }
    }

    // The only place where the original featureProperties object is used. Returns a new, filtered object with only the
    // properties desired from the layerAttributes property in the user created popup config file
    var filteredProperties: any;
    if (hoverEvent === true) {
      filteredProperties = featureProperties;
    } else {
      filteredProperties = MapUtil.filterProperties(featureProperties, layerAttributes);
    }

    // The string to return with all the necessary HTML to show in the Leaflet popup.
    var divContents = '';
    // First action, so show all properties (including the encoding of URL's) and the button for the first action. 
    if (firstAction === true) {
      divContents = MapUtil.buildDefaultDivContentString(filteredProperties);
      // Create the action button (class="btn btn-light btn-sm" creates a nicer looking bootstrap button than regular html can)
      // For some reason, an Angular Material button cannot be created this way.
      // The unique Cypress attribute is also added here.
      divContents += '<br><button class="btn btn-light btn-sm" id="' + popupTemplateId + '-' + action.label +
        '" data-cy="' + popupTemplateId + '-' + action.label +
        '" style="background-color: #c2c1c1">' + action.label + '</button>';
    }
    // The features have already been created, so just add a button with a new id to keep it unique.
    else if (firstAction === false) {
      divContents += '&nbsp&nbsp<button class="btn btn-light btn-sm" id="' + popupTemplateId + '-' + action.label +
        '" data-cy="' + popupTemplateId + '-' + action.label +
        '" style="background-color: #c2c1c1">' + action.label + '</button>';
    }
    // If the firstAction boolean is set to null, then no actions are present in the popup template, and so the default
    // action of showing everything property for the feature is used
    else if (firstAction === null) {
      divContents = MapUtil.buildDefaultDivContentString(filteredProperties);
    }
    return divContents;
  }

  /**
   * Converts a Linux epoch number to a date-time human readable string. To be displayed
   * on a feature popup div in the upper left corner of the map.
   * @param epochTime The amount of seconds or milliseconds since January 1st, 1970 to be converted.
   */
  static convertEpochToFormattedDate(epochTime: number): string {
    // Convert the epoch time to an ISO 8601 string with an offset and return it.
    return format(epochTime, 'yyyy-MM-dd HH:mm:ss');
  }

  /**
   * @returns the number array for the icon anchor so the image is displayed so that the point is in
   * the correct location on the map, whether the user is zoomed far in or out.
   * @param symbolPath The path to the image to show on the map
   */
  static createAnchorArray(symbolPath: any, imageAnchorPoint: string): number[] {
    // Split the image path by underscore, since it will have to contain at least one of those. Then pop the
    // last instance of this, as it will have the image dimensions. Splitting by x in between the numbers will
    // separate them into an array
    var imageSizeArray: string[] = symbolPath.split('_').pop().split(/x|X/);
    var strike1: boolean;

    if (imageSizeArray.length === 1) strike1 = true;

    if (imageSizeArray[0].length > 2) {
      imageSizeArray[0] = imageSizeArray[0].split('-').pop();
    }
    // Iterate over the array and slice off any file extensions hanging around
    for (let i in imageSizeArray) {
      if (imageSizeArray[i].includes('.')) {
        imageSizeArray[i] = imageSizeArray[i].substring(0, imageSizeArray[i].indexOf('.'));
      }
    }
    // Now that the strings have been formatted to numbers, convert them to actual numbers
    var anchorArray: number[] = imageSizeArray.map(Number);
    // Check if the imageAnchorPoint variable is undefined, by not being given, and
    // assign it as an empty string if so
    if (imageAnchorPoint === undefined) imageAnchorPoint = '';
    // If the number array only has one entry, and that entry is NaN, that's strike1.
    if (strike1 && anchorArray.length === 1 && isNaN(anchorArray[0]) && imageAnchorPoint.toUpperCase() !== 'UPPERLEFT') {
      console.warn('Symbol Image position given as \'' + imageAnchorPoint +
        '\', but no dimensions present in Image file name. Resorting to default position \'UpperLeft\'');
    }

    // Depending on where the point is on the image, change the anchor pixels accordingly
    switch (imageAnchorPoint.toUpperCase()) {
      case 'BOTTOM':
        anchorArray[0] = Math.floor(anchorArray[0] / 2);
        return anchorArray;
      case 'CENTER':
        anchorArray[0] = Math.floor(anchorArray[0] / 2);
        anchorArray[1] = Math.floor(anchorArray[1] / 2);
        return anchorArray;
      case 'UPPERLEFT':
        return null;
      case 'TOP':
        anchorArray[0] = Math.floor(anchorArray[0] / 2);
        anchorArray[1] = 0;
        return anchorArray;
      case 'UPPERRIGHT':
        anchorArray[1] = 0;
        return anchorArray;
      case 'LOWERRIGHT':
        return anchorArray;
      case 'LOWERLEFT':
        anchorArray[0] = 0;
        return anchorArray;
      case 'LEFT':
        anchorArray[0] = 0;
        anchorArray[1] = Math.floor(anchorArray[1] / 2);
        return anchorArray;
      case 'RIGHT':
        anchorArray[1] = Math.floor(anchorArray[1] / 2);
        return anchorArray;
      default:
        return null;
    }
  }

  /**
   * Create Tooltips on the Image Markers of a Leaflet layer dependant on conditional
   * statements that look at (if applicable) event actions from a popup template file
   * and the geoLayerView data from the map configuration file.
   * @param leafletMarker The reference to the Leaflet Marker object that's being
   * created in the layer.
   * @param eventObject The object containing the type of event as the key (e.g. click-eCP)
   * and the entire event object from the popup template file.
   * @param imageGalleryEventActionId The geoLayerView property for determining
   * whether to display the Image Gallery menu in the side bar Leaflet Kebab menu.
   * @param labelText The geoLayerSymbol property for showing a user-defined label
   * in the tooltip instead of default numbering.
   */
  static createLayerTooltips(leafletMarker: any, eventObject: any,
    imageGalleryEventActionId: string, labelText: string, count: number): void {

    // Check the eventObject to see if it contains any keys in it. If it does, then
    // event actions have been added and can be iterated over to determine if one
    // of them contains an action to display an Image Gallery.
    if (Object.keys(eventObject).length > 0) {
      for (var action of eventObject['click-eCP'].actions) {
        if (action.action && action.action.toUpperCase() === 'DISPLAYIMAGEGALLERY') {
          // By default, if the geoLayerSymbol property labelText is not given, then
          // create the tooltip default labels.
          if (!action.featureLabelType || action.featureLabelType.toUpperCase() === 'FEATURENUMBER') {
            leafletMarker.bindTooltip(count.toString(), {
              className: 'feature-label',
              direction: 'bottom',
              permanent: true
            });
          }

        }
      }
    }
    // If a Kebab menu item needs to be added for the Image Gallery, then create
    // the tooltips here.
    else if (imageGalleryEventActionId) {
      if (!labelText) {
        leafletMarker.bindTooltip(count.toString(), {
          className: 'feature-label',
          direction: 'bottom',
          permanent: true
        });
      }

    }

    // if (imageGalleryEventActionId || labelText.toUpperCase() === 'FEATURENUMBER') {

    // }
    // else if (labelText.toUpperCase() === 'ATTRIBUTEVALUE') {
    //   for (let action of eventObject['click-eCP'].actions) {
    //     if (action.id === imageGalleryEventActionId) {
    //       if (action.featureLabelType.toUpperCase() === 'FEATURENUMBER') {
    //         leafletMarker.bindTooltip(count.toString(), {
    //           className: 'feature-label',
    //           direction: 'bottom',
    //           permanent: true
    //         });
    //       }
    //     }
    //   }
    // }

  }

  /**
   * Creates a single band raster layer on the Leaflet map with the necessary debug properties, georaster object, 
   * pixel values to color function, and resolution.
   * @param georaster The georaster-for-leaflet-layer object with data for the raster.
   * @param result The result object from PapaParse after asynchronously reading the CSV classification file.
   * @param symbol The GeoLayerSymbol object from the map configuration file.
   */
  static createSingleBandRaster(georaster: any, result: any, symbol: GeoLayerSymbol): any {
    var geoRasterLayer = new GeoRasterLayer({
      debugLevel: 0,
      georaster,
      // Sets the color and opacity of each cell in the raster layer.
      pixelValuesToColorFn: (values: any) => {
        if (values[0] === 0) {
          return undefined;
        }
        // Iterate over each line in the classification file
        for (let line of result.data) {
          // If the Raster layer is a CATEGORIZED layer, then set each color accordingly.
          if (symbol.classificationType.toUpperCase() === 'CATEGORIZED') {
            if (values[0] === parseInt(line.value)) {
              let conversion = MapUtil.hexToRGB(line.fillColor);

              return `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, ${line.fillOpacity})`;
            }
          }
          // If the Raster layer is a GRADUATED layer, then determine what color each value should be under.
          else if (symbol.classificationType.toUpperCase() === 'GRADUATED') {

            // If the cell value is no data and either the valueMin or valueMax of the current line from the classification
            // file is no data, set the cell value to the line's values.
            if (MapUtil.isCellValueMissing(values[parseInt(symbol.classificationAttribute) - 1]) === 'no data' &&
              (line.valueMin.toUpperCase() === 'NODATA' || line.valueMax.toUpperCase() === 'NODATA')) {

              let conversion = MapUtil.hexToRGB(line.fillColor);

              return `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, ${line.fillOpacity})`;
            }
            // This is the default if there is no 'Nodata' value in the classification value, which is full cell transparency.
            else if (MapUtil.isCellValueMissing(values[parseInt(symbol.classificationAttribute) - 1]) === 'no data') {
              continue;
            } else {
              var valueObj = MapUtil.determineValueOperator(line.valueMin, line.valueMax);
              // The valueMin and valueMax are numbers, so check if the value from the raster cell is between the two, with
              // inclusiveness and exclusiveness being determined by the number type. Use the readonly variable operators with
              // the min and max operators to determine what should be used, with the value from the cell and the
              // valueMin/valueMax as the parameters for the function.
              if (MapUtil.operators[valueObj.minOp](values[parseInt(symbol.classificationAttribute) - 1], valueObj.valueMin) &&
                MapUtil.operators[valueObj.maxOp](values[parseInt(symbol.classificationAttribute) - 1], valueObj.valueMax)) {

                let conversion = MapUtil.hexToRGB(line.fillColor);

                return `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, ${line.fillOpacity})`;
              }
            }
          }
        }

        for (let line of result.data) {
          if (line.value === '*') {
            if (line.fillColor && !line.fillOpacity) {
              let conversion = MapUtil.hexToRGB(line.fillColor);

              return `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, 0.7)`;
            } else if (!line.fillColor && line.fillOpacity) {
              return `rgba(0, 0, 0, ${line.fillOpacity})`;
            } else
              return `rgba(0, 0, 0, 0.6)`;
          }
        }
      },
      resolution: symbol.properties.rasterResolution ? parseInt(symbol.properties.rasterResolution) : 64
    });
    return geoRasterLayer;
  }

  /**
   * Creates a multi-band raster layer on the Leaflet map with the necessary debug properties, georaster object, 
   * custom drawing function, and resolution.
   * @param georaster The georaster-for-leaflet-layer object with data for the raster.
   * @param result The result object from PapaParse after asynchronously reading the CSV classification file.
   * @param symbol The GeoLayerSymbol object from the map configuration file.
   */
  static createMultiBandRaster(georaster: any, geoLayerView: any, result: any, symbol: any): any {

    var classificationAttribute = symbol.classificationAttribute;
    // Check the classificationAttribute to see if it is a number, and if not, log the error.
    if (classificationAttribute && isNaN(classificationAttribute)) {
      console.error('The GeoLayerSymbol property \'classificationAttribute\' must be a number representing which band\'s ' +
        'cell value is desired for displaying a Raster layer. Using the first band by default (This will probably not show on the map)');
      classificationAttribute = '1';
    }
    // If the classificationAttribute is a number but smaller or larger than the number of bands in the raster, log the error.
    else if (!isNaN(classificationAttribute)) {
      if (parseInt(classificationAttribute) < 1 || parseInt(classificationAttribute) > georaster.numberOfRasters) {
        console.error('The geoRaster with geoLayerId \'' + geoLayerView.geoLayerId + '\' contains ' + georaster.numberOfRasters +
          ' bands, but the \'classificationAttribute\' property was given the number ' + parseInt(classificationAttribute) +
          '. Using the first band by default (This will probably not show on the map)');
      }
    }

    // var geoRasterLayer = new GeoRasterLayer({
    //   debugLevel: 0,
    //   georaster,
    //   // Create a custom drawing scheme for the raster layer. This might overwrite pixelValuesToColorFn().
    //   customDrawFunction: ({ context, values, x, y, width, height }) => {

    //     for (let line of result.data) {
    //       // If the Raster layer is a CATEGORIZED layer, then set each color accordingly.
    //       if (symbol.classificationType.toUpperCase() === 'CATEGORIZED') {
    //         // Use the geoLayerSymbol attribute 'classificationAttribute' to determine what band is being used for
    //         // the coloring of the raster layer. Convert both it and the values index to a number.
    //         if (values[parseInt(classificationAttribute) - 1] === parseInt(line.value)) {
    //           let conversion = MapUtil.hexToRGB(line.fillColor);

    //           context.fillStyle = `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, ${line.fillOpacity})`;
    //           context.fillRect(x, y, width, height);
    //         }
    //         // If the out of range attribute asterisk (*) is used, use its fillColor.
    //         else if (line.value === '*') {
    //           if (line.fillColor && !line.fillOpacity) {
    //             let conversion = MapUtil.hexToRGB(line.fillColor);

    //             context.fillStyle = `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, 0.7)`;
    //             context.fillRect(x, y, width, height);
    //           } else if (!line.fillColor && line.fillOpacity) {
    //             context.fillStyle = `rgba(0, 0, 0, ${line.fillOpacity})`;
    //             context.fillRect(x, y, width, height);
    //           } else {
    //             context.fillStyle = `rgba(0, 0, 0, 0.6)`;
    //             context.fillRect(x, y, width, height);
    //           }
    //         }
    //         // If the no data value is present, make the cell invisible.
    //         else {
    //           context.fillStyle = `rgba(0, 0, 0, 0)`;
    //           context.fillRect(x, y, width, height);
    //         }
    //       }
    //       // If the Raster layer is a GRADUATED layer, then determine what color each value should be under.
    //       else if (symbol.classificationType.toUpperCase() === 'GRADUATED') {
    //         // If the cell value is no data and either the valueMin or valueMax of the current line from the classification
    //         // file is no data, set the cell value to the line's values.
    //         if (MapUtil.isCellValueMissing(values[parseInt(symbol.classificationAttribute) - 1]) === 'no data' &&
    //           (line.valueMin.toUpperCase() === 'NODATA' || line.valueMax.toUpperCase() === 'NODATA')) {

    //           let conversion = MapUtil.hexToRGB(line.fillColor);

    //           return `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, ${line.fillOpacity})`;
    //         }
    //         // This is the default if there is no 'Nodata' value in the classification value, which is full cell transparency.
    //         else if (MapUtil.isCellValueMissing(values[parseInt(symbol.classificationAttribute) - 1]) === 'no data') {
    //           continue;
    //         } else {
    //           var valueObj = MapUtil.determineValueOperator(line.valueMin, line.valueMax);
    //           // The valueMin and valueMax are numbers, so check if the value from the raster cell
    //           // is between the two, with inclusiveness and exclusiveness being determined by the number type. Use the readonly
    //           // variable operators with the min and max operators to determine what should be used, with the value from the cell
    //           // and the valueMin/valueMax as the parameters for the function.
    //           if (MapUtil.operators[valueObj.minOp](values[parseInt(symbol.classificationAttribute) - 1], valueObj.valueMin) &&
    //             MapUtil.operators[valueObj.maxOp](values[parseInt(symbol.classificationAttribute) - 1], valueObj.valueMax)) {

    //             let conversion = MapUtil.hexToRGB(line.fillColor);

    //             context.fillStyle = `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, ${line.fillOpacity})`;
    //             context.fillRect(x, y, width, height);
    //           }
    //         }
    //         // If the out of range attribute asterisk (*) is used, use its fillColor.
    //         if (line.valueMin === '*' || line.valueMax === '*') {
    //           if (line.fillColor && !line.fillOpacity) {
    //             let conversion = MapUtil.hexToRGB(line.fillColor);

    //             context.fillStyle = `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, 0.7)`;
    //             context.fillRect(x, y, width, height);
    //           } else if (!line.fillColor && line.fillOpacity) {
    //             context.fillStyle = `rgba(0, 0, 0, ${line.fillOpacity})`;
    //             context.fillRect(x, y, width, height);
    //           } else {
    //             context.fillStyle = `rgba(0, 0, 0, 0.6)`;
    //             context.fillRect(x, y, width, height);
    //           }
    //         }
    //         // If the values are not in between
    //         else {
    //           context.fillStyle = `rgba(0, 0, 0, 0)`;
    //           context.fillRect(x, y, width, height);
    //         }
    //       }

    //     }
    //   },
    //   // If the geoLayerSymbol has a rasterResolution property, then convert from string to number and use it.
    //   resolution: symbol.properties.rasterResolution ? parseInt(symbol.properties.rasterResolution) : 64
    // });
    // return geoRasterLayer;
  }

  /**
   * @returns An object representing what the current cell's valueMin, valueMax, and valueMin & valueMax operators. Used for
   * deciding what operators to look between the values.
   * @param min The valueMin property of one line from the CSV classification file for Graduated layers.
   * @param max The valueMax property of one line from the CSV classification file for Graduated layers.
   */
  private static determineValueOperator(min: string, max: string): any {

    var valueMin: any = null;
    var valueMax: any = null;
    var minOp: Operator = null;
    var maxOp: Operator = null;
    var minOpPresent = false;
    var maxOpPresent = false;

    // Check to see if either of them are actually positive or negative infinity.
    if (min.toUpperCase().includes('-INFINITY')) {
      valueMin = Number.MIN_SAFE_INTEGER;
      minOp = Operator.gt;
    }
    if (max.toUpperCase().includes('INFINITY')) {
      valueMax = Number.MAX_SAFE_INTEGER;
      maxOp = Operator.lt;
    }

    // Contains operator
    if (min.includes(Operator.gt)) {
      valueMin = parseFloat(min.replace(Operator.gt, ''));
      minOp = Operator.gt;
      minOpPresent = true;
    }
    if (min.includes(Operator.gtet)) {
      valueMin = parseFloat(min.replace(Operator.gtet, ''));
      minOp = Operator.gtet;
      minOpPresent = true;
    }
    if (min.includes(Operator.lt)) {
      valueMin = parseFloat(min.replace(Operator.lt, ''));
      minOp = Operator.lt;
      minOpPresent = true;
    }
    if (min.includes(Operator.ltet)) {
      valueMin = parseFloat(min.replace(Operator.ltet, ''));
      minOp = Operator.ltet;
      minOpPresent = true;
    }

    // Contains operator
    if (max.includes(Operator.gt)) {
      valueMax = parseFloat(max.replace(Operator.gt, ''));
      maxOp = Operator.gt;
      maxOpPresent = true;
    }
    if (max.includes(Operator.gtet)) {
      valueMax = parseFloat(max.replace(Operator.gtet, ''));
      maxOp = Operator.gtet;
      maxOpPresent = true;
    }
    if (max.includes(Operator.lt)) {
      valueMax = parseFloat(max.replace(Operator.lt, ''));
      maxOp = Operator.lt;
      maxOpPresent = true;
    }
    if (max.includes(Operator.ltet)) {
      valueMax = parseFloat(max.replace(Operator.ltet, ''));
      maxOp = Operator.ltet;
      maxOpPresent = true;
    }

    // If no operator is detected in the valueMin property.
    if (minOpPresent === false) {
      valueMin = parseFloat(min);
      minOp = Operator.gt;
    }
    // If no operator is detected in the valueMax property.
    if (maxOpPresent === false) {
      valueMax = parseFloat(max);
      maxOp = Operator.ltet;
    }

    // The following two if, else if statements are done if only a number is given as valueMin and valueMax.
    // If the min is an integer or float.
    // if (MapUtil.isInt(min)) {
    //   valueMin = parseInt(min);
    //   minOp = Operator.gtet;
    // } else if (MapUtil.isFloat(min)) {
    //   valueMin = parseFloat(min);
    //   minOp = Operator.gt;
    // }

    // If the max is an integer or float.
    // if (MapUtil.isInt(max)) {
    //   valueMax = parseInt(max);
    //   maxOp = Operator.ltet;
    // } else if (MapUtil.isFloat(max)) {
    //   valueMax = parseFloat(max);
    //   maxOp = Operator.ltet;
    // }

    // Each of the attributes below have been assigned; return as an object.
    return {
      valueMin: valueMin,
      valueMax: valueMax,
      minOp: minOp,
      maxOp: maxOp
    }

  }

  /**
   * Takes care of displaying one or more raster cell's data in the upper left popup div on the Leaflet map. 
   * @param e The Event object from Leaflet.
   * @param georaster The georaster object returned from the georaster-layer-for-leaflet & geoblaze function.
   * @param geoLayerView An InfoMapper GeoLayerView object with data from the raster's geoLayerView in the map config file.
   * @param originalDivContents A string representing the current layer's name and default <hr> and text, displayed at the bottom.
   * @param layerItem The layerItem instance to help determine if a layer is currently visible on the map.
   * @param symbol An InfoMapper GeoLayerSymbol object from the map config file to decide what the classificationAttribute is,
   * and therefore what raster band is being used for the cell value to display.
   */
  static displayMultipleHTMLRasterCells(
    e: any,
    georaster: any,
    geoLayerView: GeoLayerView,
    originalDivContents: string,
    layerItem: MapLayerItem,
    symbol: GeoLayerSymbol,
    geoMapId: string
  ): void {

    /**
     * The instance of the MapLayerManager, a helper class that manages MapLayerItem objects with Leaflet layers
     * and other layer data for displaying, ordering, and highlighting.
     */
    var mapLayerManager: MapLayerManager = MapLayerManager.getInstance();

    let div = L.DomUtil.get(geoMapId +'-title-card');
    // var originalDivContents: string = div.innerHTML;
    // If the raster layer is not currently being displayed on the map, then don't show anything over a hover.
    if (layerItem.isDisplayedOnMainMap() === false) {
      return;
    }
    // Check with the MapLayerManager to see if there are any vector layers currently being shown on the map.
    // If there are, and the raster is not being moused over, then don't do anything with the hover event.
    else if (mapLayerManager.isVectorDisplayed()) {
      const latlng = [e.latlng.lng, e.latlng.lat];
      const results = geoblaze.identify(georaster, latlng);
      if (results === null) {
        // NOTE: This creates a tiny issue where if both a vector and raster are displayed, mousing out of
        // the raster will not reset the Leaflet Control div.
        // div.innerHTML = originalDivContents;
        return;
      }
    }

    var divContents = '';
    var split1: string[];
    var divEnd: string;
    // If the amount of displayed Raster layers on the map is one, restart all the HTML after the point-info <p> tag.
    if (mapLayerManager.displayedRasterLayers() === 1) {
      split1 = div.innerHTML.split('<hr class="upper-left-map-info-divider">');
      divEnd = '<hr class="upper-left-map-info-divider"/>' + split1[split1.length - 1];
      split1 = div.innerHTML.split('<hr class="upper-left-map-info-small-divider">');
      // Iterate over all layers on the map, and if a layer is both a raster and not displayed on the map, remove it from the
      // currentRasterLayers object that keeps track of raster layers for displaying their info in the div.
      var allMapLayers = mapLayerManager.getMapLayers();
      for (let geoLayerId in allMapLayers) {
        if (allMapLayers[geoLayerId].isRasterLayer() === true && allMapLayers[geoLayerId].isDisplayedOnMainMap() === false) {
          delete MapUtil.currentRasterLayers[geoLayerId];
        }
      }
    } else {
      split1 = div.innerHTML.split('<hr class="upper-left-map-info-divider">');
      divEnd = '<hr class="upper-left-map-info-divider"/>' + split1[split1.length - 1];
    }

    split1 = div.innerHTML.split('<hr class="upper-left-map-info-divider">');

    divContents += split1[0];

    const latlng = [e.latlng.lng, e.latlng.lat];
    const results = geoblaze.identify(georaster, latlng);
    var cellValue: number;
    // The classificationAttribute needs to be set as the band that needs to be displayed in the Leaflet
    // upper-left Control on the map. If it isn't, it will display undefined.
    if (results !== null) {
      cellValue = results[parseInt(symbol.classificationAttribute) - 1];
      // Now that the cellValue has been determined, check if the current raster layer's geoLayerId is in the currentRasterLayers
      // object as a key. If it is not, or the cellValue has changed since the last time this event function was called, update
      // the object that's given as the value in the currentRasterLayers object.
      if (!(geoLayerView.geoLayerId in MapUtil.currentRasterLayers) ||
        MapUtil.currentRasterLayers[geoLayerView.geoLayerId]['cellValue'] !== cellValue) {
        MapUtil.currentRasterLayers[geoLayerView.geoLayerId] = {
          cellValue: cellValue,
          geoLayerName: geoLayerView.name
        };
      }
    }

    // If the results of the currentRasterLayer are null, remove it from the currentRasterLayers object, then check to see if
    // there's still a raster layer event object left.
    if (results === null) {
      delete MapUtil.currentRasterLayers[geoLayerView.geoLayerId];
      // If there is another event object, iterate through and write it out to the div.innerHTML string;
      if (Object.keys(MapUtil.currentRasterLayers).length > 0) {
        var first = true;
        for (let key of Object.keys(MapUtil.currentRasterLayers)) {
          if (divContents.includes('upper-left-map-info-small-divider') && first === true) {
            divContents = divContents.substring(0, divContents.indexOf('<hr'));
            first = false;
          }
          divContents += '<hr class="upper-left-map-info-small-divider">Raster: ' +
            MapUtil.currentRasterLayers[key]['geoLayerName'] + '<br>' +
            '<b>Cell Value:</b> ' +
            MapUtil.isCellValueMissing(MapUtil.currentRasterLayers[key]['cellValue']);
        }
        div.innerHTML = divContents + divEnd;
        return;
      }
      // If there's nothing left in the currentRasterLayers object
      else {
        div.innerHTML = originalDivContents;
      }
    }
    // If the mouse is currently hovering over the same cell as before, don't do anything. This was commented out as it was
    // not working as intended. It actually works better without it.
    // else if (div.innerHTML.includes('<b>Cell Value:</b> ' + MapUtil.isCellValueMissing(cellValue))) {

    //   return;
    // }
    // If the results are different, update the divContents accordingly.
    else {
      var first = true;
      // Iterate through each raster layer in the currentRasterLayers object, and add one's information to the div
      // innerHTML string.
      for (let key of Object.keys(MapUtil.currentRasterLayers)) {
        if (divContents.includes('upper-left-map-info-small-divider') && first === true) {
          divContents = divContents.substring(0, divContents.indexOf('<hr'));
          first = false;
        }
        divContents += '<hr class="upper-left-map-info-small-divider">Raster: ' +
          MapUtil.currentRasterLayers[key]['geoLayerName'] + '<br>' +
          '<b>Cell Value:</b> ' +
          MapUtil.isCellValueMissing(MapUtil.currentRasterLayers[key]['cellValue']);
      }
      // NOTE: Older way of showing the raster HTML innerHTML string, and possibly more stable than the current code.
      // if (divContents.includes('upper-left-map-info-small-divider')) {
      //   divContents = divContents.substring(0, divContents.indexOf('<hr'));
      // }
      // divContents += '<hr class="upper-left-map-info-small-divider">Raster: ' +
      // geoLayerView.name + '<br>' +
      // '<b>Cell Value:</b> ' +
      // MapUtil.isCellValueMissing(cellValue) +
      // '<hr class="upper-left-map-info-divider"/>' +
      // split[1];

      // Tack on the bottom <hr> divider and the rest of the split string from before. Use split.length - 1 to always get the
      // last element in the split string.
      div.innerHTML = divContents + divEnd;
    }
  }

  /**
   * Takes an object and filters it down to a newly created smaller object by filtering down by the provided layerAttributes
   * object. This is retrieved from the popup config file provided by a user.
   * @param featureProperties The original feature Properties object taken from the feature.
   * @param layerAttributes The object containing rules, regex, and general instructions for filtering out properties.
   */
  static filterProperties(featureProperties: any, layerAttributes: EventConfig['layerAttributes']): any {

    var included: string[] = layerAttributes.include;
    var excluded: string[] = layerAttributes.exclude;
    var filteredProperties: any = {};
    // This is 'default', but the included has an asterisk wildcard to include every property.
    if ((included.includes('*') && excluded.length === 0) || (included.length === 0 && excluded.length === 0)) {
      return featureProperties;
    }
    // If the include array has the wildcard asterisk and we're here, then the excluded array has at least one element,
    // so iterate over the original featureProperties object and skip any keys in the excluded array
    else if (included.includes('*') || included.length === 0) {
      for (const key in featureProperties) {
        if (excluded.includes(key)) {
          continue;
        }
        // else if () {

        // }
        else {
          filteredProperties[key] = featureProperties[key];
        }
      }
      return filteredProperties;
    }
    // If the included array does not have a wildcard, but contains more than one element, then assume that every property of the
    // feature is excluded EXCEPT whatever is given in the included array, and display those
    else if ((included.length > 0 && excluded.length === 0) || (included.length > 0 && excluded.includes('*'))) {
      // This iterates over the included array so that they can be added in the order given to the filteredProperties array
      // This way the properties can be displayed in the order they were given in the HTML and Leaflet popup
      for (const elem of included) {
        if (elem in featureProperties) {
          filteredProperties[elem] = featureProperties[elem];
        }
        // else if (elem.substring(1).includes("*")) {

        // }
      }
      return filteredProperties;
    }

  }

  /**
   * 
   * @param keys 
   * @param features 
   */
  static formatAllFeatures(keys: string[], features: any[]): any {

    // var featureIndex = 0;
    // var propertyIndex = 0;

    // for (let property in features[0].properties) {
    //   if (typeof features[0].properties[property] === 'number') {
    //     if (/date|time/i.test(property) && features[0].properties[property] > 100000000 ) {

    //       keys.splice(propertyIndex + 1, 0, '+' + keys[propertyIndex]);

    //       var formattedFeature: any = property;  

    //       // features.splice(i + 1, 0, );
    //     }
    //   }
    //   ++propertyIndex;
    // }
    return features;
  }

  static formatDisplayedColumns(keys: any): any {


    return keys;
  }

  /**
   * 
   * @param symbol The symbol data from the geoLayerView
   * @param strVal The classification attribute that needs to match with the color being searched for
   * @param colorTable The default color table created when a user-created color table was not found
   */
  static getColor(symbol: any, strVal: string, colorTable: any) {

    switch (symbol.classificationType.toUpperCase()) {
      case "SINGLESYMBOL":
        return symbol.color;
      // TODO: jpkeahey 2020.04.29 - Categorized might be hard-coded
      case "CATEGORIZED":
        var color: string = 'gray';
        for (let i = 0; i < colorTable.length; i++) {
          if (colorTable[i] == strVal) {
            color = colorTable[i + 1];
          }
        }
        return color;
      // TODO: jpkeahey 2020.07.07 - This has not yet been implemented
      case "GRADUATED":
        return;
    }
    return symbol.color;
  }

  /**
   * Takes a hex string ('#b30000') and converts to rgb (179, 0, 0)
   * Code from user Tim Down @ https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
   * @param hex The string representing a hex value
   */
  static hexToRGB(hex: string): any {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;

  }

  /**
   * 
   * @param cellValue 
   */
  static isCellValueMissing(cellValue: number): number | string {

    let nodataValueMin = MapUtil.missingValue - .000001;
    let nodataValueMax = MapUtil.missingValue + .000001;

    if ((cellValue >= nodataValueMin) && (cellValue <= nodataValueMax)) {
      return 'no data';
    }
    else {
      return cellValue;
    }
  }

  /**
   * @returns True if the given @var num is an integer number, and false otherwise.
   * @param num The number to be tested as an integer value.
   */
  static isInt(num: any): boolean {
    return Number(num) === parseInt(num) && Number(num) % 1 === 0;
  }

  /**
   * @returns True if the given @var num is a floating point number, and false otherwise.
   * @param num The number to be tested as a floating point number.
   */
  static isFloat(num: any): boolean {
    return Number(num) === parseFloat(num) && Number(num) % 1 !== 0;
  }

  /**
   * 
   * @param styleObj The object containing styling for a feature on a layer.
   * @returns A string hex code of what the highlight color should be on a hover event.
   */
  static highlightColor(styleObj?: any): string {
    // If the color being used is anywhere near yellow, use magenta instead.
    if (parseInt(styleObj.color.substring(1), 16) >= 16776960 && parseInt(styleObj.color.substring(1), 16) <= 16777054) {
      return '#FF00FF';
    }
    // If any other non yellowish color is being used, highlight with yellow.
    return '#ffff00';
  }

  /**
   * Parse the geoLayerView property `imageBounds` and handle any user errors.
   * @param imageBounds The raw image bounds string obtained from the map config file.
   * @returns The nested number array needed by the Leaflet imageOverlay constructor.
   */
  static parseImageBounds(imageBounds: string): number[][] {
    var splitBounds = imageBounds.split(',');
    // If 2 sets of lat, lng bounds aren't given, inform the user and return the default value.
    if (splitBounds.length !== 4) {
      console.error('Incorrect number of bounds. Please provide two sets of latitude and longitude points.');
      return [[0, 0], [0, 0]];
    }

    var corner1 = [];
    var corner2 = [];

    for (var i = 0; i < splitBounds.length; ++i) {
      // If one of the provided lat, lng values isn't a number, inform the user
      // and return the default.
      if (isNaN(+splitBounds[i].trim())) {
        console.error("A bound was not a number. Try again.");
        break;
      }
      // Add the first two bounds to corner1, and the last two to corner2.
      if (i < 2) {
        corner1.push(+splitBounds[i].trim());
      } else {
        corner2.push(+splitBounds[i].trim());
      }
    }

    return [corner1, corner2];
  }

  /**
   * Resets the feature styling back to the original when a mouseout event occurs on the map, and resets the topleft
   * popup from the feature the mouse hover was on, back to the default text.
   * @param e The event object passed when a mouseout on a feature occurs.
   * @param geoLayer A reference to the current geoLayer the feature is from.
   * @param geoLayerView A reference to the current geoLayerView the feature if from.
   * @param geoMapName The name of the current GeoMap the feature resides in.
   */
  static resetFeature(e: any, geoLayer: any, geoLayerView: any,
  geoMapName: string, geoMapId: string): void {

    if (geoLayerView.properties.highlightEnabled && geoLayerView.properties.highlightEnabled === 'true') {
      if (geoLayer.geometryType.toUpperCase().includes('LINESTRING')) {
        let layer = e.target;
        layer.setStyle(MapUtil.originalStyle);
      } else if (geoLayer.geometryType.toUpperCase().includes('POLYGON')) {
        let layer = e.target;
        layer.setStyle(MapUtil.originalStyle);
      }
    }

    let div = document.getElementById(geoMapId + '-title-card');
    let instruction: string = "Move over or click on a feature for more information";
    let divContents: string = "";

    divContents = ('<h4 id="geoLayerView">' + geoMapName + '</h4>' + '<p id="point-info"></p>');
    if (instruction != "") {
      divContents += ('<hr class="upper-left-map-info-divider"/>' + '<p><i>' + instruction + '</i></p>');
    }
    div.innerHTML = divContents;
  }

  /**
   * Run the appropriate PropFunction function that needs to be called on the ${} property value
   * @param featureValue The property value that needs to be manipulated
   * @param propFunction The PropFunction enum value to determine which implemented function needs to be called
   * @param args The optional arguments found in the parens of the PropFunction as a string
   */
  static runPropFunction(featureValue: string, propFunction: PropFunction, args?: string): string {
    switch (propFunction) {
      case PropFunction.toMixedCase:
        var featureArray = featureValue.toLowerCase().split(' ');
        var finalArray = [];

        for (let word of featureArray) {
          finalArray.push(word[0].toUpperCase() + word.slice(1));
        }
        return finalArray.join(' ');

      case PropFunction.replace:
        var argArray: string[] = [];
        for (let arg of args.split(',')) {
          argArray.push(arg.trim().replace(/\'/g, ''));
        }

        if (argArray.length !== 2) {
          console.warn('The function \'.replace()\' must be given two arguments, the searched for pattern and the replacement ' +
            'for the pattern e.g. .replace(\' \', \'\')');
          return featureValue;
        } else {
          // Create a new regular expression object with the pattern we want to find (the first argument) and g to replace
          // globally, or all instances of the found pattern
          var regex = new RegExp(argArray[0], 'g');
          return featureValue.replace(regex, argArray[1]);
        }
    }
  }

  /**
   * Updates the feature styling and topleft popup with information when a mouseover occurs on the map.
   * @param e The event object passed when a feature mouseover occurs.
   * @param geoLayer A reference to the current geoLayer the feature is from.
   * @param geoLayerView The current geoLayerView the feature is from.
   * @param layerAttributes 
   */
  static updateFeature(e: any, geoLayer: any, geoLayerView: any, geoMapId: string, layerAttributes?: any): void {
    // First check if the geoLayerView of the current layer that's being hovered over has its enabledForHover property set to
    // false. If it does, skip the entire update of the div string and just return.
    if (geoLayerView.properties.enabledForHover && geoLayerView.properties.enabledForHover.toUpperCase() === 'FALSE') {
      return;
    }

    var layer = e.target;

    if (geoLayerView.properties.highlightEnabled && geoLayerView.properties.highlightEnabled === 'true') {
      if (geoLayer.geometryType.toUpperCase().includes('LINESTRING')) {
        var styleObj: any;
        var highlightColor: string;
        if (layer.options.style instanceof Function) {
          styleObj = {
            color: layer.options.color,
            opacity: layer.options.opacity,
            fillOpacity: layer.options.fillOpacity,
            fillColor: layer.options.fillColor,
            weight: layer.options.weight
          }
          MapUtil.originalStyle = styleObj;
          highlightColor = MapUtil.highlightColor(styleObj);
        } else {
          MapUtil.originalStyle = layer.options.style;
          highlightColor = MapUtil.highlightColor(layer.options.style);
        }

        layer.setStyle({
          color: highlightColor,
          weight: layer.options.weight + 2
        });
      } else if (geoLayer.geometryType.toUpperCase().includes('POLYGON') &&
        geoLayerView.geoLayerSymbol.classificationType.toUpperCase().includes('SINGLESYMBOL')) {
        MapUtil.originalStyle = layer.options.style;
        layer.setStyle({
          fillColor: 'yellow',
          fillOpacity: '0.1'
        });
      } else if (geoLayer.geometryType.toUpperCase().includes('POLYGON') &&
        geoLayerView.geoLayerSymbol.classificationType.toUpperCase().includes('CATEGORIZED')) {
        MapUtil.originalStyle = layer.options.style(e.sourceTarget.feature);
        layer.setStyle({
          color: 'yellow',
          fillOpacity: '0.1'
        });
      }
    }

    // Update the main title name up top by using the geoLayerView name
    let div = document.getElementById(geoMapId + '-title-card');
    var featureProperties: any;
    if (layerAttributes) {
      // Filter feature properties to be displayed.
      featureProperties = this.filterProperties(e.target.feature.properties, layerAttributes);
    } else {
      featureProperties = e.target.feature.properties;
    }

    let instruction = "Click on a feature for more information";
    let divContents = '<h4 id="geoLayerView">' + geoLayerView.name + '</h4>' + '<p id="point-info"></p>';
    // The longest specified length in characters for a line in a popup.
    var lineMaxLength = 40;
    // Boolean to describe if we've converted any epoch times in the features. Used to add what the + sign means in the popup.
    var converted = false;
    // Boolean to help determine if the current property needs to be converted.
    var convertedEpochTime: boolean;

    // Go through each property in the feature properties of the layer
    for (let prop in featureProperties) {
      // The current feature that needs to be displayed
      var feature = featureProperties[prop];
      convertedEpochTime = false;
      // Take the max length of the line and subtract the property name length. The leftover is the available remaining length
      // the feature can be before it's cut off to prevent the mouseover popup from getting too wide.
      var longestAllowableName = lineMaxLength - prop.length;

      if (typeof feature === 'number') {
        // If the feature is a number, check to see if either date or time is in the key, then check the number to see if it's
        // very large. If it is, we probably have a date and can convert to an ISO string.
        if (/date|time/i.test(prop) && feature > 1000000000) {
          // The feature has been converted, so change to true
          convertedEpochTime = true;
          converted = true;
          // Write the original feature and property first.
          divContents += '<b>' + prop + '</b>' + ': ' + feature + '<br>';
          // Convert the feature to the desired format
          feature = MapUtil.convertEpochToFormattedDate(feature);
        }
      }
      // Make sure the feature length is not too long. If it is, truncate it.
      if (feature !== null && feature.length > longestAllowableName) {
        feature = feature.substring(0, longestAllowableName) + '...';
      }
      // If the conversion occurred above, feature has been changed and needs to be added to the popup. If it hasn't, feature
      // is the same as it was when read in, and can just be added to the popup.
      if (convertedEpochTime) {
        divContents += '<b>+' + prop + '</b>: ' + feature + '<br>';
      } else {
        divContents += '<b>' + prop + '</b>: ' + feature + '<br>';
      }

    }
    // Add in the explanation of what the prepended + sign means above.
    if (converted) {
      divContents += '<br> <b>+</b> auto-generated values<br>';
    }

    if (instruction != "") {
      divContents += ('<hr class="upper-left-map-info-divider"/>' + '<p><i>' + instruction + '</i></p>');
    }
    // Once all properties are added to divContents, display them.
    div.innerHTML = divContents;
  }

  /**
   * Confirms that the given style option is correct, and if not, given a default so the map can still be displayed
   * @param styleProperty
   * @param style 
   */
  static verify(styleProperty: any, style: Style): any {
    // The property exists, so return it to be used in the style
    // TODO: jpkeahey 2020.06.15 - Maybe check to see if it's a correct property?
    if (styleProperty) {
      return styleProperty;
    }
    // The property does not exist, so return a default value.
    else {
      switch (style) {
        case Style.color: return 'gray';
        case Style.fillOpacity: return '0.2';
        case Style.fillColor: return 'gray';
        case Style.opacity: return '1.0';
        case Style.size: return 6;
        case Style.shape: return 'circle';
        case Style.weight: return 3;
      }
    }
  }

}
