import { Prop } from './Prop';


export class PropList {

  /**
  Indicates that the configuration file format is unknown.
  */
  static	FORMAT_UNKNOWN = 0;

  /**
  Indicates that the configuration file format is that used by Makefiles.
  */
  static	FORMAT_MAKEFILE	= 1;

  /**
  Indicates that the configuration file format is that used by NWSRFS
  configuration files (apps_defaults).  A : is used instead of the = for assignment.
  */
  static	FORMAT_NWSRFS = 2;

  /**
  Indicates that configuration information is being stored in a custom database.
  */
  static	FORMAT_CUSTOM_DB = 3;

  /**
  Indicates that configuration information is being stored in standard RTi properties file.
  */
  static	FORMAT_PROPERTIES = 4;

  /**
  Name of this PropList.
  */
  private __listName: string;
  /**
  List of Prop.
  */
  private __list: Prop[];
  /**
  File to save in.
  */
  private __persistentName: string;
  /**
  Format of file to read.
  */
  private __persistentFormat: number;
  /**
  Last line read from the property file.
  */
  private __lastLineNumberRead: number;
  /**
  Indicates if quotes should be treated literally when setting Prop values.
  */
  private __literalQuotes = true;
  /**
  The "how set" value to use when properties are being set.
  */
  private __howSet = Prop.SET_UNKNOWN;

  constructor(input: any) {

    switch(input) {
      case "":
        this.initialize(input, "", PropList.FORMAT_UNKNOWN); break;
    }
  }


  /**
  Append a property to the list using a string key, the contents, and value.
  @param key String key for the property.
  @param contents Contents for the property.
  @param value String value for the property.
  */
  private append ( key: string, contents: any, value: string ): void {
    var prop: Prop = new Prop ( [key, contents, value, this.__howSet] );
    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( 100, "PropList.append", "Setting property \"" + key + "\" to: \"" + value + "\"" );
    // }
    this.__list.push ( prop );
  }

  /**
  Returns the list of Props.
  @return the list of Props.
  */
  getList(): Prop[] {
    return this.__list;
  }

  /**
  Indicate whether quotes in the contents should be handled literally.
  @return true if quotes are handled literally, false if they should be discarded
  when contents are converted to the string value.
  */
  getLiteralQuotes (): boolean {
    return this.__literalQuotes;
  }

  /**
  Return the format of the property list file.
  @return The format of the property list file.
  */
  getPersistentFormat ( ): number {
    return this.__persistentFormat;
  }

  // /**
  // Search the list using the string key.
  // @return The property corresponding to the string key, or null if not found.
  // @param key The string key used to look up the property.
  // */
  // getProp ( key: string ): Prop {
  //   var	pos = this.findProp ( key );
  //   if ( pos >= 0 ) {
  //     var prop: Prop = this.__list[pos];
  //     prop.refresh(this);
  //     return prop;
  //   }
  //   return null;
  // }

  // /**
  // The string value of the property corresponding to the string key, or null if not found.
  // @return The string value of the property corresponding to the string key.
  // @param key The string key used to look up the property.
  // */
  // getValue ( key: string ): string {
  //   var pos = this.findProp ( key );
  //   if ( pos >= 0 ) {
  //     // We have a match.  Get the value...
  //     var value: string = this.__list[pos].getValue(this);
  //     // if ( Message.isDebugOn ) {
  //     //   Message.printDebug(100,"PropList.getValue", "Found value of \"" + key + "\" to be \"" + value + "\"" );
  //     // }
  //     return value;
  //   }
  //   // if ( Message.isDebugOn ) {
  //   //   Message.printDebug ( 100, "PropList.getValue", "Did not find property \"" + key + "\"" );
  //   // }
  //   return null;
  // }


  /**
  Find a property in the list.
  @return The index position of the property corresponding to the string key, or -1 if not found.
  @param key The string key used to look up the property.
  */
  findProp ( key: string ): number {
    var	size: number = this.__list.length;
    var prop_i: Prop;
    var propKey: string;
    for ( let i = 0; i < size; i++ ) {
      prop_i = this.__list[i];
      propKey = String(prop_i.getKey());
      if ( key.toUpperCase() === propKey.toUpperCase() ) {
        // Have a match.  Return the position...
        // if ( Message.isDebugOn ) {
        //   Message.printDebug ( 100, "PropList.findProp", "Found property \"" + key + "\" at index " + i);
        // }
        return i;
      }
    }
    return -1;
  }

  /**
  Initialize the object.
  @param listName Name for the PropList.
  @param persistentName Persistent name for the PropList (used only when reading from a file).
  @param persistentFormat Format for properties file.
  */
  private initialize ( listName: string, persistentName: string, persistentFormat: number ): void {
    if ( listName === null ) {
      this.__listName = "";
    }
    else {
      this.__listName = listName;
    }
    if ( persistentName === null ) {
      this.__persistentName = "";
    }
    else {
      this.__persistentName = persistentName;
    }
    this.__persistentFormat = persistentFormat;
    this.__list = [];
    this.__lastLineNumberRead = 0;
  }

  /**
  Return the prop at a position (zero-index), or null if the index is out of range.
  @return The property for the specified index position (referenced to zero).
  Return null if the index is invalid.
  @param i The index position used to look up the property.
  */
  propAt ( i: number ): Prop {
    if ( (i < 0) || (i > (this.__list.length - 1)) ) {
      return null;
    }
    return this.__list[ i ];
  }

  /**
  Set the property given a string key and string value. 
  If the property key exists, reset the property to the new information.
  @param key The property string key.
  @param value The string value of the property (will also be used for the contents).
  */
  set ( key: string, value: string ): void {
    this.setFull(key, value, true);
  }

  /**
  Set the property given a string key and string value.  If the key already exists
  it will be replaced if the replace parameter is true.  Otherwise, a duplicate property will be added to the list.
  @param key The property string key.
  @param value The string value of the property (will also be used for the contents.
  @param replace if true, if the key already exists in the PropList, its value
  will be replaced.  If false, a duplicate key will be added.
  */
  setFull ( key: string, value: string, replace: boolean ): void {
    var index: number = this.findProp ( key );
    
    if ( index < 0 || !replace) {
      // Not currently in the list so add it...
      this.append ( key, value, value );
    }
    else {
        // Already in the list so change it...
      var prop: Prop = this.__list[index];
      prop.setKey ( key );
      prop.setContents ( value );
      prop.setValue ( value );
      prop.setHowSet ( this.__howSet );
    }
  }

  /**
  Set the property given a string key and contents.  If the contents do not have
  a clean string value, use set ( new Prop(String,Object,String) ) instead.
  If the property key exists, reset the property to the new information.
  @param key The property string key.
  @param contents The contents of the property as an Object.  The value is
  determined by calling the object's toString() method.  If contents are null, then
  the String value is also set to null.
  */
  setUsingObject ( key: string, contents: any ): void
  {	// Ignore null keys...

    if ( key == null ) {
      return;
    }

    // Find if this is already a property in this list...

    var index: number = this.findProp ( key );
    var value: string = null;
    if ( contents != null ) {
      contents.toString();
    }
    if ( index < 0 ) {
      // Not currently in the list so add it...
      this.append ( key, contents, value );
    }
    else {
        // Already in the list so change it...
      var prop: Prop = this.__list[ index ];
      prop.setKey ( key );
      prop.setContents ( contents );
      prop.setValue ( value );
      prop.setHowSet ( this.__howSet );
    }
    value = null;
  }

  /**
  Return the size of the property list.
  @return The size of the property list.
  */
  size (): number {
    if ( this.__list === null ) {
      return 0;
    }
    else {
        return this.__list.length;
    }
  }

}