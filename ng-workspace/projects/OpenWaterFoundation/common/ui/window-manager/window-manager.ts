import { WindowItem }   from './window-item';
import { MatDialogRef } from '@angular/material/dialog';

/**
 * A helper singleton class for creating, managing and maintaining multiple opened Material Dialogs (WindowManagerItem object)
 * while viewing a map in the Infomapper. The fact that it is singleton is important, as it allows the building of a unique
 * name using a number to signify how many windows have been opened. The (at)dynamic line below needs to be declared before
 * classes that declares static methods.
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
   * A private constructor is declared so any instance of the class cannot be created elsewhere, getInstance must be called.
   */
  private constructor() { }


  /**
   * Only one instance of this WindowManager can be used at one time, making it a singleton Class.
   */
  static getInstance(): WindowManager {
    if (!WindowManager.instance) { WindowManager.instance = new WindowManager(); }
    return WindowManager.instance;
  }

  /**
   * 
   * @returns 
   */
  get queryParamKey(): string {
    return 'dialog' + (++this.dialogNumber);
  }

  /**
   * Adds a window with the windowID to the @var windows WindowManager object as the key, and the WindowItem object as the value.
   * @param windowID The unique string representing the window ID for the windowItem being created.
   * @param type The Window Type being created.
   * @param dialogRef An optional reference to the dialog object created.
   */
  addWindow(windowID: string, type: WindowType, dialogRef?: MatDialogRef<any>): any {

    console.log('Current windows before add:', this.getWindows());
    if (this.windowExists(windowID)) {
      return false;
    }

    var window = new WindowItem(windowID, type, dialogRef);
    this.windows[windowID] = window;

    console.log('Current windows after add:', this.getWindows());

    return true;
  }

  /**
   * @returns The windows object of the Window Manager.
   */
  getWindows(): any {
    return this.windows;
  }

  /**
   * Removes the window with the given @var windowID string from the WindowManager.
   */
  removeWindow(windowID: string): void {
    delete this.windows[windowID];
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