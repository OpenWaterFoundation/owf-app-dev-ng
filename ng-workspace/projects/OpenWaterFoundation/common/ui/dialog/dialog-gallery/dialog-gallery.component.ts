import { Component,
          Inject,
          OnDestroy,
          OnInit }             from '@angular/core';

import { MatDialogRef,
          MAT_DIALOG_DATA }    from '@angular/material/dialog';
import { NgxGalleryOptions,
          NgxGalleryImage,
          NgxGalleryAnimation} from 'ngx-gallery-9';

import { faXmark }             from '@fortawesome/free-solid-svg-icons';

import { OwfCommonService }    from '@OpenWaterFoundation/common/services';
import { WindowManager }       from '@OpenWaterFoundation/common/ui/window-manager';


@Component({
  selector: 'app-dialog-gallery',
  templateUrl: './dialog-gallery.component.html',
  styleUrls: ['./dialog-gallery.component.css', '../main-dialog-style.css']
})
export class DialogGalleryComponent implements OnInit, OnDestroy {
  /** All features of a geoLayerView. */
  allFeatures: any;
  /** The object containing an event action's id as the key, and the entire event
   * object from the popup template file as the value. Used for kebab menu Image 
   * Galleries. */
  eventActions: any;
  /** The object containing the type of event as the key (e.g. click-eCP) and the
   * entire event object from the popup template file. */
  eventObject: any;
  /** The initial index of the picture in the @var galleryImages array when this
   * DialogGalleryComponent was opened. */
  private featureIndex: number;
  /** Array of NgxGalleryOption objects containing optional data for creating the Gallery. */
  galleryOptions: NgxGalleryOptions[] = [];
  /** Array of NgxGalleryImage objects for creating and showing images in the Gallery. */
  galleryImages: NgxGalleryImage[] = [];
  /** The geoLayerId that the feature belongs to from the map configuration file. */
  geoLayerId: string;
  /** The geoLayerView that the feature belongs to from the map configuration file. */
  geoLayerView: any;
  /** The reference to the Leaflet map object. */
  mainMap: any;
  /** The array containing the result objects from Papaparse, with the headers of
   * the CSV file as keys, and the appropriate CSV column as the value. Each object
   * in the array counts as one line from the CSV file. */
  papaResult: any;
  /** The layer MapLayerItem. Each
   * element in the object contains the geoLayerId as the key, and the LayerGroup
   * object as the value. */
  mapLayerItem: any;
  /** A unique string representing the windowId of this Dialog Component in the
   * WindowManager. */
  windowId: string;
  /** The windowManager instance, which creates, maintains, and removes multiple
   * open dialogs in an application. */
  windowManager: WindowManager = WindowManager.getInstance();
  /** All used icons in the DialogGalleryComponent. */
  faXmark = faXmark;


  /**
   * Creates and displays an Image Gallery with png, jpg, and similar files in a
   * Material Dialog.
   * @param commonService The reference to the app service injected object.
   * @param dialogRef The reference to the DialogTSGraphComponent. Used for creation
   * and sending of data.
   * @param matDialogData The object containing data passed from the Component that
   * created this Dialog.
   */
  constructor(
    private commonService: OwfCommonService,
    private dialogRef: MatDialogRef<DialogGalleryComponent>,
    @Inject(MAT_DIALOG_DATA) private matDialogData: any
  ) {

    this.allFeatures = this.matDialogData.data.allFeatures;
    this.eventActions = this.matDialogData.data.eventActions;
    this.eventObject = this.matDialogData.data.eventObject;
    this.featureIndex = this.matDialogData.data.featureIndex ? this.matDialogData.data.featureIndex - 1 : 0;
    this.geoLayerId = this.matDialogData.data.geoLayerId;
    this.geoLayerView = this.matDialogData.data.geoLayerView;
    this.papaResult = this.matDialogData.data.papaResult;
    this.mainMap = this.matDialogData.data.mainMap;
    this.mapLayerItem = this.matDialogData.data.mapLayerItem;
    this.windowId = this.geoLayerId + '-dialog-gallery';
  }


  /**
   * Create the class variables galleryOptions and galleryImages that will be used
   * by this Dialog's template file for displaying the gallery.
   */
  private buildGallery(): void {
    // Populate the galleryOptions array with the necessary options for gallery creation.
    this.galleryOptions = [
      {
        arrowPrevIcon: "fa fa-arrow-circle-o-left fa-lg", 
        arrowNextIcon: "fa fa-arrow-circle-o-right fa-lg",
        height: '98%',
        imageActions: [
          {
            icon: 'fa fa-search-plus fa-2x',
            titleText: 'Zoom to Project',
            onClick: (event: Event, index: number) => {
              this.zoomToFeatures(index);
            }
          },
          // {
          //   icon: 'fa fa-dot-circle-o fa-2x',
          //   titleText: 'Select Project',
          //   onClick: (event: Event, index: number) => {
          //   }
          // }
        ],
        imageAnimation: NgxGalleryAnimation.Fade,
        imageDescription: true,
        // imagePercent: 80,
        previewCloseOnClick: true,
        previewDownload: true,
        previewKeyboardNavigation: true,
        startIndex: this.featureIndex,
        thumbnailsColumns: 4,
        thumbnailsMoveSize: 4,
        thumbnailMargin: 1,
        thumbnailsMargin: 1,
        // thumbnailsPercent: 20,
        width: '100%'
      },
      {
        breakpoint: 800,
        width: '100%'
      },
      {
        breakpoint: 400,
        preview: false
      }
    ];
    // Iterate over each line in the CSV file, and populate the galleryImages array
    // with the data from the line. Each element in the galleryImages array is a
    // NgxGalleryImage object.
    var count = 1;
    // Create a variable that will cut down on the length of trying to use the full
    // 'path' to the ID.
    var imageGalleryEventActionId = this.geoLayerView.properties.imageGalleryEventActionId;
    // KEBAB MENU
    if (imageGalleryEventActionId) {
      // If the imageGalleryEventActionId is a key in the eventActions, then it
      // confirms this layer will use the event object associated with that ID.
      if (imageGalleryEventActionId in this.eventActions) {
        // Iterate through the feature array so each image is added to the imageGallery
        // array in the same order they were created on the Leaflet map, keeping the
        // indexes from the map and the imageGallery arrays in tune.
        for (var feature of this.allFeatures.features) {
          // Go through each line from the CSV classification file.
          for (var line of this.papaResult) {
            // Use the value header from the CSV gallery template file to compare
            // with the feature, and if they're equal, add the NgxGalleryImage object
            // to the array.
            if (feature.properties[this.eventActions[imageGalleryEventActionId].imageGalleryAttribute].toString() === line.value) {
              this.galleryImages.push({
                small: this.formatImgPath(line.imagePath),
                medium: this.formatImgPath(line.imagePath),
                big: this.formatImgPath(line.imagePath),
                description: count.toString() + ': ' + line.description
              });
              ++count;
            }
          }
        }
      }
    }
    // EVENT DRIVEN
    else {
      // Iterate through the feature array so each image is added to the imageGallery
      // array in the same order they were created on the Leaflet map, keeping the
      // indexes from the map and the imageGallery arrays in tune.
      for (var feature of this.allFeatures.features) {
        // Go through each line from the CSV classification file.
        for (var line of this.papaResult) {
          // Use the value header from the CSV gallery template file to compare
          // with the feature, and if they're equal, add the NgxGalleryImage object
          // to the array.
          for (let action of this.eventObject['click-eCP'].actions) {
            if (action.action.toUpperCase() === 'DISPLAYIMAGEGALLERY') {
              if (feature.properties[action.imageGalleryAttribute].toString() === line.value) {
                this.galleryImages.push({
                  small: this.formatImgPath(line.imagePath),
                  medium: this.formatImgPath(line.imagePath),
                  big: this.formatImgPath(line.imagePath),
                  description: count.toString() + ': ' + line.description
                });
                ++count;
              }
            }
          }
        }
      }
    }
  }

  /**
   * @returns A concatenated absolute path to the image file, or a URL, depending
   * what was given in the image config file.
   * @param imagePath The string representing the path to the image file.
   */
  private formatImgPath(imagePath: string): string {
    if (imagePath.startsWith('http') || imagePath.startsWith('https') || imagePath.startsWith('www')) {
      return imagePath;
    } else {
      return this.commonService.getAppPath() + this.commonService.getMapConfigPath() + imagePath;
    }
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive. Called after the constructor.
   */
  ngOnInit(): void {
    // this.commonService.setMapConfigPath(this.mapConfigPath);
    this.buildGallery();
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
   * When the magnifying glass icon is clicked on, get the correct coordinate bounds
   * and zoom the map to them.
   * @param index The index of the image clicked on in the NgxGalleryImage array.
   */
  zoomToFeatures(index: number): void {
    // Attempt to create the layers array, with each feature object as an element.
    // Use the Leaflet getLayers() LayerGroup method to obtain an array of layers.
    var layers = this.mapLayerItem.leafletLayer.getLayers();

    // If the selected (or highlighted) layer exists, zoom to it on the map.
    if (layers) {
      var layer = layers[index];

      // NOTE: The Leaflet method fitBounds() is currently not being used, as the
      // method flyTo() uses a smoother transition between features. It is a little
      // laggy however, so the fitBounds was left for the future. If the selectedLayer
      // variable is created (if the Leaflet layer supports it e.g. Points, Markers,
      // Images) then zoom to the layer bounds on the map
      // var bounds: Bounds = {
      //   NEMaxLat: layer.feature.geometry.coordinates[1],
      //   NEMaxLong: layer.feature.geometry.coordinates[0],
      //   SWMinLat: layer.feature.geometry.coordinates[1],
      //   SWMinLong: layer.feature.geometry.coordinates[0]
      // }
      // Add and subtract by 0.07 so that the zoom does not go to the point at the
      // maximum possible zoom.
      // var zoomBounds = [[bounds.NEMaxLat - 0.07, bounds.NEMaxLong + 0.07],
      //                   [bounds.SWMinLat + 0.07, bounds.SWMinLong - 0.07]];
      // this.mainMap.fitBounds(zoomBounds, 13, {
      //   padding: [475, 0]
      // });

      var zoomBounds = [layer.feature.geometry.coordinates[1], layer.feature.geometry.coordinates[0]]
      this.mainMap.flyTo(zoomBounds, 13, {
        animate: true,
        duration: 1.5,
        // easeLinearity: 1,
        padding: [475, 0]
      });
    }
  }

}
