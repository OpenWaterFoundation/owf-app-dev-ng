import { MatDialogRef } from '@angular/material/dialog';
import { ParamMap, Params } from '@angular/router';

/**
 * A helper singleton class for creating, managing and maintaining multiple opened
 * Material Dialogs (WindowManagerItem object) while viewing a map in the Infomapper.
 * The fact that it is singleton is important, as it allows the building of a unique
 * name using a number to signify how many windows have been opened. The (at)dynamic
 * line below needs to be declared before classes that declares static methods.
 */
// @dynamic
export class WindowManager {
  /**
   * The number of the window that's been opened, starting at 0.
   * NOTE: Not currently being used.
   */
  private dialogNumber = 0;
  /**
   * The instance of this WindowManager object.
   */
  private static instance: WindowManager;

  /**
   * The object to hold each WindowManagerItem, with the button's windowID as a key.
   */
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

  get amountExistingQueryParams(): number {
    return Object.keys(this.windows).length;
  }

  /**
   * 
   * @returns 
   */
  get queryParamKey(): string {
    return 'dialog' + (++this.dialogNumber);
  }

  /**
   * Adds a window with the windowID to the @var windows WindowManager object as
   * the key, and the WindowItem object as the value.
   * @param windowID The unique string representing the window ID for the windowItem
   * being created.
   * @param type The Window Type being created.
   * @param dialogRef An optional reference to the dialog object created.
   * @returns True if adding the new window succeeded, or false if it already existed
   * 
   */
  addWindow(windowID: string, type: WindowType, location?: string, dialogRef?: MatDialogRef<any>): any {

    if (this.windowExists(windowID)) {
      return false;
    }

    var windowItem: WindowItem = {
      location: location,
      queryParamTypeKey: this.setQueryParamTypeKey(),
      queryParamIdKey: this.setQueryParamIdKey(),
      windowID: windowID,
      windowType: type,
      dialogRef: dialogRef ? dialogRef : undefined
    };

    this.windows[windowID] = windowItem;

    console.log('All windows after adding window:', this.getWindows());

    return true;
  }

  canOpenWindow(queryParamMap: ParamMap, i: number): WindowType {

    console.log('All windows:', this.windows);
    console.log('Window dialog Id key:', 'dialog' + i + 'Id');
    console.log('Does window exist:', queryParamMap.get('dialog' + i + 'Id'));

    if (this.windowExists(queryParamMap.get('dialog' + i + 'Id'))) {
      return;
    }

    const windowType = queryParamMap.get('dialog' + i).split('-').pop();
    console.log('Can open window with window type:', windowType);
  }

  /**
   * 
   */
  getAllOpenQueryParams(): Params {

    var allOpenParams: Params = {};

    console.log('Setting current open query params using the following windows object:', this.windows);

    Object.values(this.windows).forEach((windowItem: WindowItem) => {
      allOpenParams[windowItem.queryParamTypeKey] = windowItem.location;
      allOpenParams[windowItem.queryParamIdKey] = windowItem.windowID;
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
   * Removes the window with the given @var windowID key from the windows object
   * and renumbers the remaining open dialogs.
   */
  removeWindow(windowID: string): void {
    delete this.windows[windowID];

    var splitIdKey: string[];

    Object.values(this.windows).forEach((windowItem: WindowItem, i) => {
      windowItem.queryParamTypeKey = 'dialog' + (i + 1);

      splitIdKey = windowItem.queryParamIdKey.split(/\d+/g);
      windowItem.queryParamIdKey = splitIdKey[0] + (i + 1) + splitIdKey[1];
    });

    console.log('All windows after removing window:', this.getWindows());

    // Route update to new query parameters.
  }

  /**
   * 
   * @returns 
   */
  setQueryParamIdKey(): string {
    return 'dialog' + (Object.keys(this.windows).length + 1) + 'Id'
  }

  /**
   * 
   * @returns 
   */
  setQueryParamTypeKey(): string {
    return 'dialog' + (Object.keys(this.windows).length + 1);
  }

  /**
   * @returns A boolean true or false if the given windowID exists in the WindowManager.
   */
  windowExists(windowID: string): boolean {
    return (windowID in this.windows);
  }

}

/**
 * Enum representing the supported Window Types (Dialog Types) for the WindowManager.
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

export interface WindowItem {
  queryParamIdKey: string;
  queryParamTypeKey: string;
  windowID: string;
  windowType: WindowType;
  location?: string;
  dialogRef?: MatDialogRef<any>;
}