import { MatDialogRef }   from '@angular/material/dialog';
import { ParamMap,
          Params }        from '@angular/router';
import { DialogParams,
          GeoMapProject } from '@OpenWaterFoundation/common/services';

/**
 * A helper singleton class for creating, managing and maintaining multiple opened
 * Material Dialogs (WindowManagerItem object) while viewing a map in the Infomapper.
 * The fact that it is singleton is important, as it allows the building of a unique
 * name using a number to signify how many windows have been opened. The (at)dynamic
 * line below needs to be declared before classes that declares static methods.
 */
// @dynamic
export class WindowManager {

  /** The number of the window that's been opened, starting at 0. NOTE: Not currently
   * being used. */
  private dialogNumber = 0;
  /** The instance of this WindowManager object. */
  private static instance: WindowManager;
  /** The object to hold each WindowManagerItem, with the button's windowId as a
   * key. */
  private windows: {} = {};


  /**
   * A private constructor is declared so any instance of the class cannot be created
   * elsewhere, getInstance must be called.
   */
  private constructor() { }


  /**
   * Only one instance of this WindowManager can be used at one time, making it a
   * singleton Class.
   */
  static getInstance(): WindowManager {
    if (!WindowManager.instance) { WindowManager.instance = new WindowManager(); }
    return WindowManager.instance;
  }

  /**
   * 
   */
  get amountExistingQueryParams(): number {
    return Object.keys(this.windows).length;
  }

  /**
   * Adds a window with the windowId to the @var windows WindowManager object as
   * the key, and the WindowItem object as the value.
   * @param windowId The unique string representing the window ID for the windowItem
   * being created.
   * @param type The Window Type being created.
   * @param dialogRef An optional reference to the dialog object created.
   * @returns True if adding the new window succeeded, or false if it already existed
   * 
   */
  addWindow(windowId: string, type: WindowType, dialogRef?: MatDialogRef<any>): any {

    if (this.windowExists(windowId)) {
      return false;
    }

    var windowItem: WindowItem = {
      queryParamTypeKey: this.setQueryParamTypeKey(),
      queryParamIdKey: this.setQueryParamIdKey(),
      windowId: windowId,
      windowType: type,
      dialogRef: dialogRef ? dialogRef : undefined
    };

    this.windows[windowId] = windowItem;

    return true;
  }

  /**
   * 
   * @param queryParamMap 
   * @returns 
   */
  // windowsToOpen(queryParamMap: ParamMap, mapConfig: GeoMapProject): {
  //   type: WindowType,
  //   params: DialogParams
  // }[] {

  //   var windowsToOpen: {
  //     type: WindowType,
  //     params: DialogParams
  //   }[] = [];

  //   var windowType: string;

  //   if (this.amountExistingQueryParams === 0) {
  //     // queryParamMap.get('dialog' + i).split('-').pop();
  //     var numQueryParamKeys = queryParamMap.keys.length;

  //     for (let i = 0; i < numQueryParamKeys; ++i) {

  //       var queryParamTypeKey = 'dialog' + (i + 1);
  //       if (!queryParamTypeKey) { return []; }

  //       if (queryParamMap.get(queryParamTypeKey)) {
  //         windowsToOpen.push({
  //           type: queryParamMap.get(queryParamTypeKey).split('-').pop() as WindowType,
  //           params: {
  //             location: queryParamMap.get(queryParamTypeKey)
  //           }
  //         })
  //       }
  //     }
  //   }
  //   else if (this.amountExistingQueryParams > 0) {

  //   }
    
  // }

  /**
   * Currently unused.
   */
  getAllOpenQueryParams(): Params {

    var allOpenParams: Params = {};

    Object.values(this.windows).forEach((windowItem: WindowItem) => {
      allOpenParams[windowItem.queryParamTypeKey] = windowItem.location;
      allOpenParams[windowItem.queryParamIdKey] = windowItem.windowId;
    });

    return allOpenParams;
  }

  /**
   * @returns The windows object of the Window Manager.
   */
  getWindows(): any {
    return this.windows;
  }

  /**
   * Removes the window with the given @var windowId key from the windows object
   * and renumbers the remaining open dialogs.
   */
  removeWindow(windowId: string): void {
    delete this.windows[windowId];

    var splitIdKey: string[];

    Object.values(this.windows).forEach((windowItem: WindowItem, i) => {
      windowItem.queryParamTypeKey = 'dialog' + (i + 1);

      splitIdKey = windowItem.queryParamIdKey.split(/\d+/g);
      windowItem.queryParamIdKey = splitIdKey[0] + (i + 1) + splitIdKey[1];
    });
  }

  /**
   * Set in the addWindow method, but otherwise unused.
   * @returns 
   */
  setQueryParamIdKey(): string {
    return 'dialog' + (Object.keys(this.windows).length + 1) + 'Id';
  }

  /**
   * Set in the addWindow method, but otherwise unused.
   * @returns 
   */
  setQueryParamTypeKey(): string {
    return 'dialog' + (Object.keys(this.windows).length + 1);
  }

  /**
   * @returns A boolean true or false if the given windowId exists in the WindowManager.
   */
  windowExists(windowId: string): boolean {
    return (windowId in this.windows);
  }

}

/**
 * The supported Window Types (Dialog Types) for the WindowManager.
 */
export enum WindowType {
  D3 = 'D3',
  DOC = 'Documentation',
  HEAT = 'Heatmap',
  GAL = 'Gallery',
  GAP = 'Gapminder',
  PROJ = 'Project',
  TABLE = 'Table',
  TEXT = 'Text',
  TSGRAPH = 'TSGraph'
}

/**
 * Properties for the 
 */
export interface WindowItem {
  queryParamIdKey: string;
  queryParamTypeKey: string;
  windowId: string;
  windowType: WindowType;
  location?: string;
  dialogRef?: MatDialogRef<any>;
}