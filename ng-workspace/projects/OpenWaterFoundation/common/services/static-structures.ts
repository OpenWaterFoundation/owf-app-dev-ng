/**
 * This class holds static types that can be used throughout the Common library and/or
 * consuming applications.
 */

// @dynamic
export class StaticStructures {

  /** A read only object for dynamically using operators between two integers. */
  readonly operators = {
    '>': function (a: any, b: any) { return a > b; },
    '>=': function (a: any, b: any) { return a >= b; },
    '<': function (a: any, b: any) { return a < b; },
    '<=': function (a: any, b: any) { return a <= b; }
  }

  /** The list of supported image widget files. */
  private static readonly SUPPORTEDIMAGEFILES = [
    'jpg',
    'png'
  ];

  /** The list of supported text widget files. */
  private static readonly SUPPORTEDTEXTFILES = [
    'HTML',
    'Markdown'
  ];

  /** The currently supported Widget types for the Dashboard. */
  private static readonly SUPPORTEDWIDGETTYPES = [
    'chart',
    'diagnostics',
    'image',
    'map',
    'selector',
    'statusIndicator',
    'text',
    'title'
  ];

  /** Getter for all supported image files. */
  static get supportedImageFiles(): string[] { return this.SUPPORTEDIMAGEFILES; }

   /** Getter for all supported text files. */
  static get supportedTextFiles(): string[] { return this.SUPPORTEDTEXTFILES; }

   /** Getter for all supported widget types. */
  static get supportedWidgetTypes(): string[] { return this.SUPPORTEDWIDGETTYPES; }
}