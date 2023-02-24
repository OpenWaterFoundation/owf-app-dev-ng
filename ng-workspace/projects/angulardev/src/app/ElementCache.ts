

/**
 * Class that caches elements so that a network query is not necessary every time a
 * user clicks between multiple pages in the app.
 */
export class ElementCache {
  /**
   * The instance of this ElementCache object.
   */
  private static instance: ElementCache;
  /**
   * The object to hold each string (for now), with the elementID as the key.
   */
  private elements: {} = {};

  /**
   * A private constructor is declared so any instance of the class cannot be created elsewhere, getInstance must be called.
   */
  private constructor() { }


  /**
   * Only one instance of this WindowManager can be used at one time, making it a singleton Class.
   */
  static getInstance(): ElementCache {
    if (!ElementCache.instance) { ElementCache.instance = new ElementCache(); }
    return ElementCache.instance;
  }

  /**
   * @returns A boolean describing whether the @var elements object contains the given elementID as a key.
   * @param elementID A unique string as the key in the @var elements object.
   */
  elementExists(elementID: string): boolean {
    return elementID in this.elements;
  }

  /**
   * @returns The string connected to the elementID in the @var elements object.
   * @param elementID A unique string as the key in the @var elements object.
   */
  getElement(elementID: string): string {
    return this.elements[elementID];
  }

  /**
   * Sets a new elementID and string to be cached.
   * @param elementID A unique string as the key in the @var elements object.
   * @param elementString A string of the element to be cached.
   */
  setNewElement(elementID: string, elementString: string): void {
    this.elements[elementID] = elementString;
  }

  
}