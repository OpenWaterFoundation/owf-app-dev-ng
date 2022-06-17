import { Observable }                from 'rxjs/internal/Observable';
import { BehaviorSubject,
          forkJoin,
          Subject }                  from 'rxjs';

import { TS,
          TSIdent, 
          TSUtil}                    from '@OpenWaterFoundation/common/ts';

import { OwfCommonService }          from '@OpenWaterFoundation/common/services';
import * as IM                       from '@OpenWaterFoundation/common/services';
import { DateTime,
          TimeInterval }             from '@OpenWaterFoundation/common/util/time';
import { PropList }                  from '@OpenWaterFoundation/common/util/io';
import { TelemetryStation,
          TelemetryStationDataType } from '@OpenWaterFoundation/common/dmi';


// @dynamic
export class ColoradoHydroBaseRestDatastore {

  /**
  The web service API version, critical for forming the request URL and parsing the results.
  */
  private apiVersion = 2; // Default.

  /**
   * API key that is used to grant additional query privileges, such as for large queries.
   */
  private apiKey = "";
    
  /**
  Indicates whether global data store properties have been initialized, set by initialize().
  */
  private initialized = false;

  // Global lists to store cached data.
  // See the read* methods.
  /*
  * Climate station data type 'measType' list, unique values.
  * Use getClimateStationMeasTypeList() because use lazy loading.
  */
  private climateStationMeasTypeList: string[] = null;
  private climateStationDataSourceList: string[] = null;

  /*
  * List of climate station 'measType' that are the same as telemetry station parameter.
  * Telemetry stations use all upper case parameters (e.g., 'EVAP') whereas climate station uses mixed case (e.g., 'Evap').
  * The values are upper case.
  */
  private climateStationMeasTypeSameAsTelemetryStationParamUpperList: string[] = null;

  // private List<ReferenceTablesCounty> countyList = null;

  // private List<ReferenceTablesCurrentInUseCodes> currentInUseCodeList = null;

  // private List<ReferenceTablesDesignatedBasin> designatedBasinList = null;

  // private List<ReferenceTablesDiversionNotUsedCodes> diversionNotUsedCodeList = null;

  // private List<ReferenceTablesDivRecObservationCodes> divRecObservationCodeList = null;

  // private List<ReferenceTablesDivRecTypes> divRecTypeList = null;

  // private List<ReferenceTablesGroundwaterPublication> groundwaterPublicationList = null;

  // private List<ReferenceTablesManagementDistrict> managementDistrictList = null;

  // private List<ReferenceTablesPermitActionName> permitActionNameList = null;

  /*
  * Surface water station data type 'measType' list, unique values.
  * Use getSurfaceWaterStationMeasTypeList() because use lazy loading.
  */
  private surfaceWaterStationMeasTypeList: string[] = null;

  private telemetryParamsList: any[] = null;
  /**
   * 
   */
  private paramsInitialized: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private paramsInitialized$ = this.paramsInitialized.asObservable();

  // private List<ReferenceTablesWaterDistrict> waterDistrictList = null;

  // private List<ReferenceTablesWaterDivision> waterDivisionList = null;

  /** The root web service URI, to which more specific resource addresses will be
   * appended (e.g., "http://data.rcc-acis.org". */
  private __serviceRootURI: string = null;


  /**
   * 
   * @param commonService 
   * @param serviceRootURI 
   */
  constructor(private commonService: OwfCommonService, serviceRootURI: string) {

    // this.setName (name);
    // this.setDescription (description);
    this.setServiceRootURI (serviceRootURI);
    this.setApiKey(commonService.getApiKey());
    // Determine the web service version.
    this.determineAPIVersion();
    // OK to initialize since no properties other than the main properties impact anything.
    this.initialize();
    // Set up local objects to be cached.
    this.readGlobalData();
  }


  /**
  Also check for overlap between climate station and telemetry station data types,
  which is used in some cases to differentiate uppercase 'EVAP' for telemetry station parameter and
  mixed case 'Evap' climate station data type.
  This should be called from the readClimateStationMeasType and readTelemetryParams methods.
  */
  private checkClimateAndTelemetryStationTypes(): void {
    if ( (this.climateStationMeasTypeList !== null) && (this.climateStationMeasTypeList.length > 0)  &&
      (this.telemetryParamsList != null) && (this.telemetryParamsList.length > 0) ) {
      // Have data to check for overlapping data.
      this.climateStationMeasTypeSameAsTelemetryStationParamUpperList = [];
      for ( let measType of this.climateStationMeasTypeList ) {
        var measTypeUpper = measType.toUpperCase();
        for ( var param of this.telemetryParamsList ) {
          if ( measTypeUpper.toUpperCase() === param.parameter.toUpperCase()) {
            this.climateStationMeasTypeSameAsTelemetryStationParamUpperList.push(measTypeUpper);
          }
        }
      }
    }
  }

  /**
   * 
   * @param rootUrl 
   * @param path 
   * @returns 
   */
  private convertPath(rootUrl: string, path: string): string {

    // service.obtainPropertiesFromLine(path, something);

    if (path.startsWith('/')) {
      return rootUrl + path.substring(1);
    } else {
      return rootUrl + path;
    }
  }

  /**
   * Determine the web service API version. This will set 
   * __apiVersion to be the integer of the API service version number 
   * found at the end of the service request URI. 
   * For example: 
   * https://dnrweb.state.co.us/DWR/DwrApiService/api/v2 
   * will return 2.
   */
  private determineAPIVersion(): void {   
    var routine = "ColoradoHydroBaseRestDataStore.determineAPIVersion";
    var uriString = this.getServiceRootURI();
    var indexOf = uriString.lastIndexOf("/");
    var version = parseInt(uriString.substring(indexOf + 2, uriString.length));
    // Message.printStatus(2, routine, "DWR REST services API version = " + version);
    this.apiVersion = version;
  }

  /**
   * Returns the apiKey for the datastore.
   * @return apiKey - String that is the apiKey for a given user to access the Datastore.
   */
  private getApiKey(): string {
    return this.apiKey;
  }

  /**
   * Format the "apiKey" query parameter.
   * If the key is not available, an empty string is returned.
   * @return String that can be concatenated onto a URL request that appends the users api key,
   * will always have & at the front.
   */
  private getApiKeyStringDefault(): string {
    // Force the string to return with & at front.
    return this.getApiKeyString("?");
  }

  /**
   * Format the "apiKey" query parameter.
   * If not available, an empty string is returned.
   * @param url the current url, which will be checked to determine whether
   * to use ? or & for the beginning of the query parameter string.
   * @return String that can be concatenated onto a URL request that appends the users api key.
   */
  private getApiKeyString( url: string ): string {
    var queryChar = "&";
    if ( url.indexOf('?') < 0 ) {
      // The API key is the first query parameter.
      queryChar = "?";
    }
    var apiKey: string = this.getApiKey();
    if ( (apiKey === null) || apiKey.length === 0 ) {
      return "";
    }
    else {
      return queryChar + "apiKey=" + apiKey;
    }
  }

  /**
   * 
   * @param fullTSID 
   * @returns 
   */
  public getData(fullTSID: IM.TSID): Observable<TS> {

    var dataSubject = new Subject<TS>();

    this.paramsInitialized$.subscribe((initialized: boolean) => {
      if (initialized === true) {
        dataSubject.next(this.readTimeSeries(fullTSID.location, null, null, true, null));
      }
    });
    throw new Error('End of getData(). This needs to return dataSubject.asObservable()');
    return dataSubject.asObservable();
  }

  /**
   * Return the requested data type without the group.
   * For example 'Surface Water Station - Streamflow-Avg' would return 'Streamflow-Avg'.
   * @return data type without group
   */
  public getDataTypeWithoutGroup ( dataType: string ): string {
    // Parse the group.
      var pos = dataType.indexOf(" -");
      var group = "";
      if ( pos > 0 ) {
        // Have a group.
        group = dataType.substring(0,pos).trim();
          dataType = dataType.substring(pos+2).trim();
      }
      else {
        // No group.
          dataType = dataType.trim();
      }
      return dataType;
  }

  /**
  Return the service root URI for the data store.
  @return the service root URI for the data store.
  */
  public getServiceRootURI(): string {
    return this.__serviceRootURI;
  }

  /**
   * Initialize internal data store data. This method should be called from all methods
   * that are likely to be called from external code. Currently nothing is done but
   * could check the web service version, etc.
   */
  private initialize(): void {
    if (this.initialized) {
        // Already initialized.
        return;
    }
    // Otherwise initialize the global data for the data store.
    this.initialized = true;
  }

  /**
   * Indicate whether a time series data type corresponds to a telemetry station.
   * @param dataType - the datatype portion of the TSID ex. 'DISCHRG'
   * @return true if data type is for a telemetry station, false otherwise
   */
  public isTelemetryStationTimeSeriesDataType ( dataType: string ): boolean {

    //String routine = getClass().getSimpleName() + ".isTelemetryStationTimeSeriesData";
    //Message.printStatus(2, routine, "Checking whether \"" + dataType + "\" is telemetry station." );
    if ( dataType === null ) {
      return false;
    }
    // Remove the group from the front of the name.
    dataType = this.getDataTypeWithoutGroup(dataType);
    var dataTypeUpper: string = dataType.toUpperCase();
    //Message.printStatus(2, routine, "Data type without group: \"" + dataType + "\"." );

    if ( dataType === "*" ) {
      // Allow wildcard because telemetry stations are the only location type to use the wildcard.
      return true;
    }
    for ( let param of this.telemetryParamsList) {
      if (dataType.toLowerCase() === param.parameter.toLowerCase()) {
        //Message.printStatus(2, routine, "Data type ignoring case matches telemetry station parameters." );
        // The data type matches a telemetry station ignoring case.
        // If the requested data type overlaps a telemetry station parameter and climate station 'measType',
        // an upper case match indicates a telemetry station parameter.
        if (this.climateStationMeasTypeSameAsTelemetryStationParamUpperList !== null) {
          var found = false; // If ignorecase match below.
          for (let sameMeasTypeUpper of this.climateStationMeasTypeSameAsTelemetryStationParamUpperList) {
            //Message.printStatus(2, routine, "Checking overlapping measType \"" + sameMeasTypeUpper + "\"" );
            if (dataTypeUpper.toUpperCase() === sameMeasTypeUpper.toUpperCase()) {
              found = true;
              if (dataType.toUpperCase() === sameMeasTypeUpper.toUpperCase()) {
                // Requested datatype is uppercase so assume it is telemetry station.
                //Message.printStatus(2, routine, "Requested overlapping data type is telemetry station.");
                return true;
              }
            }
          }
          // Upper case did not match so climate station data type such as 'Evap'.
          if (found) {
            //Message.printStatus(2, routine, "Requested overlapping data type is NOT telemetry station.");
            return false;
          }
        }
        // Does not overlap with climate station 'measType' and is therefore a telemetry station.
        return true;
      }
    }
    return false;
  }

  /**
   * Determine whether a time series value is missing.
   * @param value the time series data value
   * @param checkMinus999 if true, then -999 is considered to be missing.
   * @return true if the data value is null or a missing numerical value:  NaN or -999 if checkMinus999=true.
   */
  private isTimeSeriesValueMissing ( value: number, checkMinus999: boolean ): boolean {
    if ( value === null ) {
      return true;
    }
    else if ( isNaN(value) ) {
      return true;
    }
    if ( checkMinus999 ) {
      var value2 = value;
      // Pad the -999 value to account for roundoff.
      if ( (value2 < -998.9999)  && (value2 > -999.00001) ) {
        return true;
      }
    }
    return false;
  }

  /**
  Read a single time series matching the requested criteria.
  @param tsidentString the time series identifier string as per TSTool conventions.
  The location type may be specified (e.g., abbrev:PLAKERCO).
  The data type should be the 'measType' or similar returned from web services;
  however, in some cases custom handling is required because it is not easy or possible to map
  because a record contains multiple values.
  @param readStart the starting date/time to read, or null to read all data.
  @param readEnd the ending date/time to read, or null to read all data.
  @param readData if true, read the data; if false, construct the time series and populate properties but do not read the data
  @param props Additional properties to control reading, such as filling structure time series with diversion comments.
  Recognized properties include:
  <ul>
  <li> FillgDivRecordsCarryForward - indicate whether to fill diversion records with fill carry forward</li>
  <li> FillgDivRecordsCarryForwardFlag - flag used for filled carry forward values (default is "c")</li>
  <li> FillUsingDivComments - indicate whether to fill diversion record time series with
  additional zero values using diversion comments (default is False).</li>
  <li> FillUsingDivCommentsFlag - flag for data values filled with diversion comments
  (default if null is "Auto" to use "not in use" flag).</li>
  </ul>
  @return the time series read from the HydroBase web services,
  or minimally-initialized time series if unable to read.
  */
  readTimeSeries( tsidentString: string, readStart: DateTime, readEnd: DateTime,
    readData: boolean, props: PropList ): TS {   
    var routine = "ColoradoHydroBaseRestDatastore.readTimeSeries";
    var dl = 1; // Debug level.

    // JacksonToolkit jacksonToolkit = JacksonToolkit.getInstance();
    
    // Make sure data store is initialized.
    this.initialize();
    this.determineAPIVersion();
    var ts: TS = null;
    
    if ( props == null ) {
      // Create an empty proplist to streamline processing.
      props = new PropList("");
    }
    
    // 1. Parse the time series identifier (TSID) that was passed in.
    var ident = new TSIdent();
    var tsident:TSIdent = ident.parseIdentifierNoFlag(tsidentString);
    var locType: string = tsident.getLocationType();
    var locid: string = tsident.getLocation();
    var dataSource: string = tsident.getSource();
    var dataTypeReq: string = tsident.getType(); // TSID data type
    var dataTypeReqUpper: string = dataTypeReq.toUpperCase();
    //String data_source = tsident.getSource();
    
    // if ( Message.isDebugOn ) {
    //   Message.printDebug(dl, routine, "Requested data type: " + dataTypeReq);
    // }
    
    var tsUnits: string = null;

    // 2. Create time series to receive the data.
    ts = TSUtil.newTimeSeries(tsidentString, true);
    var intervalBase: number = ts.getDataIntervalBase();
    
    // 3. TS Configuration:
    ts.setIdentifier(tsidentString);
    ts.setMissing(NaN); // Don't need setMissingRange() for now.
    
    // if ( isClimateStationTimeSeriesDataType(dataTypeReq) && isClimateStationTimeSeriesDataSource(dataSource) ) {
    //   // Climate station time series.

    //   var dataType: string = getDataTypeWithoutGroupAndStatistic(dataTypeReq);
    //   if ( dataTypeReqUpper.indexOf("FROSTDATE") >= 0 ) {
    //     // Request is for a frost date time series:
    //     // - need to use general "FrostDate" rather than more specific TSTool "FrostDateL32S", etc.
    //     dataType = "FrostDate";
    //   }

    //   // Round the times and also remove time zone since not returned from web services.
    //   // - TODO smalers 2022-03-16 don't need to round because dates in time series will have
    //   //   precision of the time series interval, remove code when tested out.
    //   /*
    //   if ( readStart != null ) {
    //     // Round to 15-minute so that allocated time series will align with data.
    //     readStart = new DateTime(readStart);
    //     readStart.round(-1, TimeInterval.MINUTE, 15);
    //     readStart.setTimeZone("");
    //   }
    //   if ( readEnd != null ) {
    //     // Round to 15-minute so that allocated time series will align with data.
    //     readEnd = new DateTime(readEnd);
    //     readEnd.round(1, TimeInterval.MINUTE, 15);
    //     readEnd.setTimeZone("");
    //   }
    //   */
      
    //   // Get the climate station.
    //   var stationRequest = "";
    //   var locParam = "&siteId=" + locid;
    //   stationRequest = this.getServiceRootURI() + "/climatedata/climatestations?format=json" + locParam + getApiKeyStringDefault();
    //   if ( Message.isDebugOn ) {
    //     Message.printDebug ( dl, routine, "stationRequest: " + stationRequest );
    //   }
    //   JsonNode results0 = jacksonToolkit.getJsonNodeFromWebServices(stationRequest);
    //   JsonNode stationResult = null;
    //   if ( results0 == null ) {
    //     Message.printWarning(3, routine, "No data returned for:  " + stationRequest);
    //     return ts;
    //   }
    //   else {
    //     stationResult = results0.get(0);
    //   }
      
    //   ClimateStation station = (ClimateStation)jacksonToolkit.treeToValue(stationResult, ClimateStation.class);
    //   Message.printStatus(2, routine, "Retrieve surface water stations from DWR REST API request url: " + stationRequest);

    //   // Get the climate station data type.
    //   String stationDataTypeRequest = "";
    //   stationDataTypeRequest = getServiceRootURI() + "/climatedata/climatestationsdatatypes?format=json" + locParam +
    //     "&measType=" + dataType + getApiKeyStringDefault();
    //   if ( Message.isDebugOn ) {
    //     Message.printDebug(dl, routine, "stationDataTypesRequest: " + stationDataTypeRequest);
    //   }
    //   results0 = jacksonToolkit.getJsonNodeFromWebServices(stationDataTypeRequest);
    //   JsonNode stationDataTypeResult = null;
    //   if ( results0 == null ) {
    //     Message.printWarning(3, routine, "No data returned for:  " + stationDataTypeRequest);
    //     return ts;
    //   }
    //   else {
    //     stationDataTypeResult = results0.get(0);
    //   }
    //   ClimateStationDataType stationDataType = (ClimateStationDataType)jacksonToolkit.treeToValue(stationDataTypeResult, ClimateStationDataType.class);
    //   Message.printStatus(2, routine, "Retrieve climate station data types from DWR REST API request url: " + stationDataTypeRequest);
      
    //   // Set the description:
    //   // - use the station name since nothing suitable on data type/parameter
    //   ts.setDescription(station.getStationName());
      
    //   // Set data units depending on the data type:
    //   // - also set a boolean to allow checking the records because some time series don't seem to have units in metadata
    //   // - climate data interval statistics do not change the units (unlike streamflow monthly volume)
    //   if ( (stationDataType.getMeasUnit() != null) && !stationDataType.getMeasUnit().isEmpty() ) {
    //     ts.setDataUnitsOriginal(stationDataType.getMeasUnit());
    //     ts.setDataUnits(stationDataType.getMeasUnit());
    //   }
    //   boolean dataUnitsSet = false;
    //   boolean dataUnitsOriginalSet = false;
    //   if ( !ts.getDataUnitsOriginal().isEmpty() ) {
    //     dataUnitsOriginalSet = true;
    //   }
    //   if ( !ts.getDataUnits().isEmpty() ) {
    //     dataUnitsSet = true;
    //   }
      
    //   // Set the available start and end date to the time series parameter period.
    //   ts.setDate1Original(stationDataType.getPorStart());
    //   ts.setDate2Original(stationDataType.getPorEnd());
    //   Message.printStatus(2,routine,"Date1Original=" + ts.getDate1Original() + " Date2Original=" + ts.getDate2Original());

    //   setTimeSeriesPropertiesForClimateStation(ts, station, stationDataType);
    //   setCommentsForClimateStation(ts, station);

    //   // If not reading the data, return the time series with only header information.
    //   if ( !readData ) {
    //     return ts;
    //   }

    //   // Read the time series records.
    //   StringBuilder tsRequest = new StringBuilder();

    //   // Retrieve surface water station time series data based on interval
    //   // - make sure the precision of the requested dates is day for web services
    //   DateTime readStart2 = null;
    //   DateTime readEnd2 = null;
    //   if ( readStart != null ) {
    //     readStart2 = new DateTime(readStart);
    //     readStart2.setPrecision(DateTime.PRECISION_DAY);
    //   }
    //   if ( readEnd != null ) {
    //     readEnd2 = new DateTime(readEnd);
    //     readEnd2.setPrecision(DateTime.PRECISION_DAY);
    //   }
    //   // Date/time format is day format regardless of interval, but set to full month and year to ensure all data is returned.
    //   if ( intervalBase == DateTime.PRECISION_DAY ) {
    //     tsRequest.append(getServiceRootURI() + "/climatedata/climatestationtsday?format=json&dateFormat=dateOnly" + locParam + "&measType=" + dataType);
    //     // No need to change the requested date/time - use what was passed in.
    //   }
    //   else if ( intervalBase == DateTime.PRECISION_MONTH ) {
    //     tsRequest.append(getServiceRootURI() + "/climatedata/climatestationtsmonth?format=json&dateFormat=dateOnly" + locParam + "&measType=" + dataType);
    //     // Specify a full months using day precision.
    //     if ( readStart2 != null ) {
    //       if ( (readStart != null) && (readStart.getPrecision() < DateTime.PRECISION_DAY) ) {
    //         // Original date/time precision was less than day so set to the beginning of the month.
    //         readStart2.setDay(1);
    //       }
    //     }
    //     if ( readEnd2 != null ) {
    //       if ( (readEnd != null) && (readEnd.getPrecision() < DateTime.PRECISION_DAY) ) {
    //         // Original date/time precision was less than day so set to the beginning of the month.
    //         readEnd2.setDay(TimeUtil.numDaysInMonth(readEnd2));
    //       }
    //     }
    //   }
    //   else if ( intervalBase == DateTime.PRECISION_YEAR ) {
    //     // 'stationNum' is only used with frost dates until the State updates the API.
    //     // No 'measType' is needed since service is specific to frost dates.
    //     locParam = "&stationNum=" + stationDataType.getStationNum();
    //     tsRequest.append(getServiceRootURI() + "/climatedata/climatestationfrostdates?format=json&dateFormat=dateOnly" + locParam );
    //     // The frost date service currently only allows stationNum so get the value from the station.
    //     // Specify a full months using day precision.
    //     if ( readStart2 != null ) {
    //       if ( (readStart != null) && (readStart.getPrecision() < DateTime.PRECISION_DAY) ) {
    //         // Original date/time precision was less than day so set to the beginning of the month.
    //         readStart2.setDay(1);
    //         readStart2.setMonth(1);
    //       }
    //     }
    //     if ( readEnd2 != null ) {
    //       if ( (readEnd != null) && (readEnd.getPrecision() < DateTime.PRECISION_DAY) ) {
    //         // Original date/time precision was less than day so set to the beginning of the month.
    //         readEnd2.setDay(31);
    //         readEnd2.setMonth(12);
    //       }
    //     }
    //   }
    //   String minMeasDateParam = "";
    //   String maxMeasDateParam = "";
    //   if ( readStart2 != null ) {
    //     if ( intervalBase == DateTime.PRECISION_DAY ) {
    //       minMeasDateParam = "&min-MeasDate=" + URLEncoder.encode(String.format("%02d/%02d/%04d", readStart2.getMonth(), readStart2.getDay(), readStart2.getYear()), "UTF-8");
    //     }
    //     else if ( intervalBase == DateTime.PRECISION_MONTH ) {
    //       minMeasDateParam = "&min-calYear=" + readStart2.getYear();
    //     }
    //     else if ( intervalBase == DateTime.PRECISION_YEAR ) {
    //       minMeasDateParam = "&min-calYear=" + readStart2.getYear();
    //     }
    //   }
    //   if ( readEnd2 != null ) {
    //     if ( intervalBase == DateTime.PRECISION_DAY ) {
    //       maxMeasDateParam = "&max-MeasDate=" + URLEncoder.encode(String.format("%02d/%02d/%04d", readEnd2.getMonth(), readEnd2.getDay(), readEnd2.getYear()), "UTF-8");
    //     }
    //     else if ( intervalBase == DateTime.PRECISION_MONTH ) {
    //       maxMeasDateParam = "&max-calYear=" + readEnd2.getYear();
    //     }
    //     else if ( intervalBase == DateTime.PRECISION_YEAR ) {
    //       maxMeasDateParam = "&max-calYear=" + readEnd2.getYear();
    //     }
    //   }
    //   tsRequest.append(minMeasDateParam);
    //   tsRequest.append(maxMeasDateParam);
    //   // Add URL without key, to help with troubleshooting.
    //   ts.setProperty("dataUrl", tsRequest.toString().replace("format=json", "format=jsonprettyprint"));
    //   tsRequest.append(getApiKeyStringDefault());
    //   Message.printStatus(2, routine, "Retrieve climate station time series from DWR REST API request url: " + tsRequest);
      
    //   JsonNode results = jacksonToolkit.getJsonNodeFromWebServices(tsRequest.toString());
    //   if ( (results == null) || (results.size() == 0) ){
    //     return ts;
    //   }

    //   // Set the actual data period to the requested period if specified,
    //   // or the actual period if the requested period was not specified.
    //   if ( readStart2 == null ) {
    //     if ( intervalBase == DateTime.PRECISION_DAY ) {
    //       ClimateStationTSDay staTS = (ClimateStationTSDay)jacksonToolkit.treeToValue(results.get(0), ClimateStationTSDay.class);
    //       DateTime firstDate = staTS.getMeasDate();
    //       ts.setDate1(firstDate);
    //     }
    //     else if ( intervalBase == DateTime.PRECISION_MONTH ) {
    //       ClimateStationTSMonth staTS = (ClimateStationTSMonth)jacksonToolkit.treeToValue(results.get(0), ClimateStationTSMonth.class);
    //       DateTime firstDate = new DateTime(DateTime.PRECISION_MONTH);
    //       firstDate.setMonth(staTS.getCalMonthNum());
    //       firstDate.setYear(staTS.getCalYear());
    //       ts.setDate1(firstDate);
    //     }
    //     else if ( intervalBase == DateTime.PRECISION_YEAR ) {
    //       ClimateStationFrostDates staTS = (ClimateStationFrostDates)jacksonToolkit.treeToValue(results.get(0), ClimateStationFrostDates.class);
    //       DateTime firstDate = new DateTime(DateTime.PRECISION_YEAR);
    //       firstDate.setYear(staTS.getCalYear());
    //       ts.setDate1(firstDate);
    //     }
    //   }
    //   else {
    //     ts.setDate1(readStart2);
    //   }
    //   if ( readEnd2 == null ) {
    //     if ( intervalBase == DateTime.PRECISION_DAY ) {
    //       ClimateStationTSDay staTS = (ClimateStationTSDay)jacksonToolkit.treeToValue(results.get(results.size() - 1), ClimateStationTSDay.class);
    //       DateTime firstDate = staTS.getMeasDate();
    //       ts.setDate2(firstDate);
    //     }
    //     else if ( intervalBase == DateTime.PRECISION_MONTH ) {
    //       ClimateStationTSMonth staTS = (ClimateStationTSMonth)jacksonToolkit.treeToValue(results.get(results.size() - 1), ClimateStationTSMonth.class);
    //       DateTime firstDate = new DateTime(DateTime.PRECISION_MONTH);
    //       firstDate.setMonth(staTS.getCalMonthNum());
    //       firstDate.setYear(staTS.getCalYear());
    //       ts.setDate2(firstDate);
    //     }
    //     else if ( intervalBase == DateTime.PRECISION_YEAR ) {
    //       ClimateStationFrostDates staTS = (ClimateStationFrostDates)jacksonToolkit.treeToValue(results.get(results.size() - 1), ClimateStationFrostDates.class);
    //       DateTime firstDate = new DateTime(DateTime.PRECISION_YEAR);
    //       firstDate.setYear(staTS.getCalYear());
    //       ts.setDate2(firstDate);
    //     }
    //   }
    //   else {
    //     ts.setDate2(readEnd2);
    //   }

    //   // Allocate data space.
    //   ts.allocateDataSpace();
    //   Message.printStatus(2, routine, "Allocated memory for " + ts.getDate1() + " to " + ts.getDate2() );
      
    //   // Set the properties.
    //   ts.addToGenesis("Read data from web services: " + tsRequest );
      
    //   // Read the data
    //   // Pass data into the TS object.
    //   String measUnit = null;
    //   if ( intervalBase == TimeInterval.DAY ) {
    //     // Can declare DateTime outside of loop because time series stores in an array.
    //     DateTime date = new DateTime(DateTime.PRECISION_DAY);
    //     for ( int i = 0; i < results.size(); i++ ) {
    //       ClimateStationTSDay tsDay = (ClimateStationTSDay)jacksonToolkit.treeToValue(results.get(i), ClimateStationTSDay.class);
    //       // If units were not set in the station data type, set here.
    //       measUnit = tsDay.getMeasUnit();
    //       if ( !dataUnitsSet && (measUnit != null) && !measUnit.isEmpty() ) {
    //         // Make sure the units are consistent.
    //         ts.setDataUnits(measUnit);
    //         dataUnitsSet = true;
    //       }
    //       if ( !dataUnitsOriginalSet && (measUnit != null) && !measUnit.isEmpty() ) {
    //         // Make sure the units are consistent.
    //         ts.setDataUnitsOriginal(measUnit);
    //         dataUnitsOriginalSet = true;
    //       }
          
    //       // Set the date directly from the time series.
    //       date = tsDay.getMeasDate();
            
    //       // Get the data.
    //       Double value = tsDay.getValue();
    //       if ( !isTimeSeriesValueMissing(value, true) ) {
    //         ts.setDataValue(date, value);
    //       }
    //     }
    //   }
    //   else if ( intervalBase == TimeInterval.MONTH ) {
    //     // Can declare DateTime outside of loop because time series stores in an array.
    //     DateTime date = new DateTime(DateTime.PRECISION_MONTH);
    //     Double value = null;
    //     boolean doAvg = false;
    //     boolean doMax = false;
    //     boolean doMin = false;
    //     boolean doTotal = false;
    //     if ( dataTypeReqUpper.indexOf("-AVG") > 0 ) {
    //       doAvg = true;
    //     }
    //     else if ( dataTypeReqUpper.indexOf("-MAX") > 0 ) {
    //       doMax = true;
    //     }
    //     else if ( dataTypeReqUpper.indexOf("-MIN") > 0 ) {
    //       doMin = true;
    //     }
    //     else if ( dataTypeReqUpper.indexOf("-TOT") > 0 ) {
    //       doTotal = true;
    //     }
    //     for ( int i = 0; i < results.size(); i++ ) {
    //       ClimateStationTSMonth tsMonth = (ClimateStationTSMonth)jacksonToolkit.treeToValue(results.get(i), ClimateStationTSMonth.class);
    //       // If units were not set in the station data type, set here.
    //       measUnit = tsMonth.getMeasUnit();
    //       if ( !dataUnitsSet && (measUnit != null) && !measUnit.isEmpty() ) {
    //         // Make sure the units are consistent.
    //         ts.setDataUnits(measUnit);
    //         dataUnitsSet = true;
    //       }
    //       if ( !dataUnitsOriginalSet && (measUnit != null) && !measUnit.isEmpty() ) {
    //         // Make sure the units are consistent.
    //         ts.setDataUnitsOriginal(measUnit);
    //         dataUnitsOriginalSet = true;
    //       }
          
    //       // Set the date directly from the time series.
    //       date.setMonth ( tsMonth.getCalMonthNum() );
    //       date.setYear ( tsMonth.getCalYear() );
            
    //       // Get the data.
    //       if ( doAvg ) {
    //         value = tsMonth.getAvgValue();
    //       }
    //       else if ( doMax ) {
    //         value = tsMonth.getMaxValue();
    //       }
    //       else if ( doMin ) {
    //         value = tsMonth.getMinValue();
    //       }
    //       else if ( doTotal ) {
    //         value = tsMonth.getTotalValue();
    //       }
    //       if ( !isTimeSeriesValueMissing(value, true) ) {
    //         ts.setDataValue(date, value);
    //       }
    //     }
    //   }
    //   else if ( intervalBase == TimeInterval.YEAR ) {
    //     // Can declare DateTime outside of loop because time series stores in an array.
    //     DateTime date = new DateTime(DateTime.PRECISION_YEAR);
    //     DateTime value = null;
    //     boolean doL28s = false;
    //     boolean doL32s = false;
    //     boolean doF28f = false;
    //     boolean doF32f = false;
    //     measUnit = "day";
    //     if ( dataTypeReqUpper.indexOf("L28S") > 0 ) {
    //       doL28s = true;
    //     }
    //     else if ( dataTypeReqUpper.indexOf("L32S") > 0 ) {
    //       doL32s = true;
    //     }
    //     else if ( dataTypeReqUpper.indexOf("F28F") > 0 ) {
    //       doF28f = true;
    //     }
    //     else if ( dataTypeReqUpper.indexOf("F32F") > 0 ) {
    //       doF32f = true;
    //     }
    //     for ( int i = 0; i < results.size(); i++ ) {
    //       ClimateStationFrostDates tsYear = (ClimateStationFrostDates)jacksonToolkit.treeToValue(results.get(i), ClimateStationFrostDates.class);
    //       // If units were not set in the station data type, set here.
    //       if ( !dataUnitsSet && (measUnit != null) && !measUnit.isEmpty() ) {
    //         // Make sure the units are consistent.
    //         ts.setDataUnits(measUnit);
    //         dataUnitsSet = true;
    //       }
    //       if ( !dataUnitsOriginalSet && (measUnit != null) && !measUnit.isEmpty() ) {
    //         // Make sure the units are consistent.
    //         ts.setDataUnitsOriginal(measUnit);
    //         dataUnitsOriginalSet = true;
    //       }
          
    //       // Set the date directly from the time series.
    //       date.setYear ( tsYear.getCalYear() );
            
    //       // Get the data.
    //       if ( doL28s ) {
    //         value = tsYear.getL28s();
    //       }
    //       else if ( doL32s ) {
    //         value = tsYear.getL32s();
    //       }
    //       else if ( doF32f ) {
    //         value = tsYear.getF32f();
    //       }
    //       else if ( doF28f ) {
    //         value = tsYear.getF28f();
    //       }
    //       if ( value != null ) {
    //         ts.setDataValue ( date, (double)TimeUtil.dayOfYear(	new DateTime(value)));
    //       }
    //     }
    //   }
    // }
    // else if ( dataTypeReq.equalsIgnoreCase("DivComment") ) {
    //   // Structure diversion comment, different than typical diversion record.
      
    //   // Get Structure:
    //   // - TODO smalers 2019-08-26 need a method for this.
    //   String wdid = locid;
    //   String structRequest = getServiceRootURI() + "/structures?format=json&wdid=" + wdid + getApiKeyStringDefault();
    //   JsonNode structResult = jacksonToolkit.getJsonNodeFromWebServices(structRequest).get(0);
    //   // Log structure request for debugging properties.
    //   //System.out.println(structRequest);
    //   Message.printStatus(2, routine, "Retrieve structure data from DWR REST API request url: " + structRequest);
    //   // Use jackson to convert structResult into a Structure POJO for easy retrieval of data.
    //   Structure struct = (Structure)jacksonToolkit.treeToValue(structResult, Structure.class);
    //   if ( struct == null ) {
    //     // Structure identifier not found:
    //     // - return minimal time series
    //     return ts;
    //   }
      
    //   // Set structure name as TS Description.
    //   ts.setDescription(struct.getStructureName());

    //   // Get the diversion comments, using irrigation year for the year.
    //   boolean hasComments = waterclassHasComments(wdid);
    //   if ( hasComments ) {
    //     Message.printStatus(2, routine, "Structure has diversion comments - process to add more zeros.");
    //     List<DiversionComments> divComments = getDivComments(wdid, null, -1);
    //     if ( (divComments == null) || (divComments.size() == 0) ) {
    //       // No diversion comments.
    //       Message.printStatus(2, routine, "No diversion comments for " + ts.getIdentifierString() + ".  Not filling data.");
    //       return ts;
    //     }
    //     // Else continue.
    //     // Loop through the records to determine the minimum and maximum years:
    //     // - may be possible to read WaterClass and use the porStart and porEnd
    //     //   but dates are not as obvious as data record irrigation year
    //     int minYear = -999;
    //     int maxYear = -999;
    //     int irrYear;
    //     for ( DiversionComments comment : divComments ) {
    //       irrYear = comment.getIrrYear();
    //       if ( minYear < 0 ) {
    //         minYear = irrYear;
    //       }
    //       else if ( irrYear < minYear ) {
    //         minYear = irrYear;
    //       }
    //       if ( maxYear < 0 ) {
    //         maxYear = irrYear;
    //       }
    //       else if ( irrYear > maxYear ) {
    //         maxYear = irrYear;
    //       }
    //     }
        
    //     // Set the period properties.

    //     // Available period.
    //     DateTime start = new DateTime(DateTime.PRECISION_YEAR);
    //     start.setYear(minYear);
    //     ts.setDate1Original(start);
    //     DateTime end = new DateTime(DateTime.PRECISION_YEAR);
    //     end.setYear(maxYear);
    //     ts.setDate2Original(end);
        
    //     // Requested period.
    //     if ( readStart != null ) {
    //       start.setYear(readStart.getYear());
    //     }
    //     if ( readEnd != null ) {
    //       end.setYear(readEnd.getYear());
    //     }
    //     ts.setDate1(start);
    //     ts.setDate2(end);
        
    //     setCommentsForStructure(ts, struct);
    //     if ( readData ) {
    //       ts.allocateDataSpace();
    //       // Loop through the records and set the values.
    //       DateTime dt = new DateTime(DateTime.PRECISION_YEAR);
    //       String notUsed;
    //       for ( DiversionComments comment : divComments ) {
    //         notUsed = comment.getNotUsed();
    //         // Only process records that have a notUsed flag.
    //         if ( (notUsed != null) && !notUsed.isEmpty() ) {
    //           dt.setYear(comment.getIrrYear());
    //           // Value is set to zero diversion amount, flag can be used later to fill data with zeros:
    //           // -TODO smalers 2019-08-28 HydroBase 'usp_CDSS_DiversionComment_Sel_By_Structure_num' stored procedure has 'acres_irrig'
    //           ts.setDataValue(dt, 0.0, notUsed, -1);
    //           Message.printStatus(2, routine, "Setting diversion comment for " + dt.getYear() + " flag " + notUsed );
    //         }
    //       }
    //     }
    //   }
    // }
    // else if (
    //   dataTypeReq.equalsIgnoreCase("DivTotal") ||
    //   dataTypeReq.equalsIgnoreCase("RelTotal") ||
    //   dataTypeReqUpper.startsWith("WATERCLASS") ||
    //   dataTypeReqUpper.startsWith("'WATERCLASS")) {
    //   // Structure-related time series that are "diversion records":
    //   // - requests involve water class
      
    //   String wdid = locid;
      
    //   // Get Structure:
    //   // - TODO smalers 2019-08-26 need a method for this
    //   String structRequest = getServiceRootURI() + "/structures?format=json&wdid=" + wdid + getApiKeyStringDefault();
    //   JsonNode structResult = jacksonToolkit.getJsonNodeFromWebServices(structRequest).get(0);
    //   // Log structure request for debugging properties.
    //   //System.out.println(structRequest);
    //   Message.printStatus(2, routine, "Retrieve structure data from DWR REST API request url: " + structRequest);
    //   // Use jackson to convert structResult into a Structure POJO for easy retrieval of data.
    //   Structure struct = (Structure)jacksonToolkit.treeToValue(structResult, Structure.class);
    //   if ( struct == null ) {
    //     // Structure identifier not found:
    //     // - return minimal time series
    //     return ts;
    //   }
      
    //   // Set structure name as TS Description.
    //   ts.setDescription(struct.getStructureName());
      
    //   int waterClassNumForWdid = 0;
      
    //   DiversionWaterClass waterClassForWdid = null;
    //   try {
    //     if(dataTypeReq.equalsIgnoreCase("DivTotal")){
    //       // Diversion records - total through diversion.
    //       // locid is the WDID in this case.
    //       String waterClassReqString = null;
          
    //       // Retrieve water class num for given wdid.
    //       waterClassForWdid = readWaterClassNumForWdid(wdid,waterClassReqString,dataTypeReq);
    //       waterClassNumForWdid = waterClassForWdid.getWaterclassNum();
    //     }
    //     else if(dataTypeReq.equalsIgnoreCase("RelTotal")){
    //       // Release records - total through release.
    //       // locid is the WDID in this case.
    //       String waterClassReqString = null;
              
    //       // Retrieve water class num for given wdid
    //       waterClassForWdid = readWaterClassNumForWdid(wdid,waterClassReqString,dataTypeReq);
    //       waterClassNumForWdid = waterClassForWdid.getWaterclassNum();
    //     }
    //     else if(dataTypeReq.startsWith("WaterClass") || dataTypeReq.startsWith("'WaterClass")){
    //       // Water class, possibly surrounded by single quotes if it contains a period.
    //       // locid is the WDID in this case.
    //       String waterClassReqString = getWCIdentStringFromDataType(dataTypeReq);
          
    //       //System.out.println("water class: " + waterClassReqString);
                    
    //       // Retrieve water class num for given wdid.
    //       waterClassForWdid = readWaterClassNumForWdid(wdid,waterClassReqString,null);
    //       waterClassNumForWdid = waterClassForWdid.getWaterclassNum();
    //     }
    //   }
    //   catch ( Exception e ) {
    //     // Error getting back a single matching water class:
    //     // - return minimal time series
    //     return ts;
    //   }
      
    //   // Get first and last date.
    //   // First date.
    //   DateTime firstDate = waterClassForWdid.getPorStart();
    //   if ( firstDate != null ) {
    //     if ( intervalBase == TimeInterval.DAY ) {
    //       firstDate.setPrecision(DateTime.PRECISION_DAY); 
    //     }
    //     else if ( intervalBase == TimeInterval.MONTH ) { 
    //       firstDate.setPrecision(DateTime.PRECISION_MONTH); 
    //     }
    //     else if ( intervalBase == TimeInterval.YEAR ) { 
    //       firstDate.setPrecision(DateTime.PRECISION_YEAR); 
    //     }
    //   }
    //   ts.setDate1Original(firstDate);
      
    //   // Last date.
    //   DateTime lastDate = waterClassForWdid.getPorEnd();
    //   if ( lastDate != null ) {
    //     if ( intervalBase == TimeInterval.DAY ) {
    //       lastDate.setPrecision(DateTime.PRECISION_DAY); 
    //     }
    //     else if ( intervalBase == TimeInterval.MONTH ) { 
    //       lastDate.setPrecision(DateTime.PRECISION_MONTH); 
    //     }
    //     else if ( intervalBase == TimeInterval.YEAR ) { 
    //       lastDate.setPrecision(DateTime.PRECISION_YEAR); 
    //     }
    //   }
    //   ts.setDate2Original(lastDate);
        
    //   /* TODO smalers 2019-06-15 need to use web service URL here
    //   if(intervalBase == TimeInterval.DAY){
    //     ts.setInputName ( "HydroBase daily_amt.amt_*, daily_amt.obs_*");
    //   }
    //   if(intervalBase == TimeInterval.MONTH){
    //     ts.setInputName("HydroBase annual_amt.amt_*");
    //   }
    //   if(intervalBase == TimeInterval.YEAR){
    //     ts.setInputName ( "HydroBase annual_amt.ann_amt");
    //   }
    //   */
      
    //   // 4. Set Properties.
    //   //FIXME @jurentie 06/26/2018 - move add to genesis elsewhere.
    //   //ts.addToGenesis("read data from web services " + structRequest + " and " + divRecRequest + "."); // might need to add waterclasses URL string
    //   setTimeSeriesPropertiesForStructure(ts, struct, waterClassForWdid);
      
    //   // FIXME @jurentie 06/26/2018 Do not read all data if not within the bounds of the specified dates.
    //   // 5. Read data.
    //   if(!readData){
    //     setCommentsForStructure(ts, struct);
    //     return ts;
    //   }
    //   else {
    //     // Read the data.
        
    //     // Get the data from web services.
    //     String divRecRequest = null;
    //     if(intervalBase == TimeInterval.DAY){
    //       // Create request URL for web services API.
    //       divRecRequest = getServiceRootURI() + "/structures/divrec/divrecday?format=json&wdid=" + wdid + "&waterClassNum=" + waterClassNumForWdid;
    //       // Add dates to limit query, to day precision.
    //       if ( readStart != null ) {
    //         divRecRequest += "&min-dataMeasDate=" + URLEncoder.encode(String.format("%02d/%02d/%04d", readStart.getMonth(), readStart.getDay(), readStart.getYear()), "UTF-8");
    //       }
    //       if ( readEnd != null ) {
    //         divRecRequest += "&max-dataMeasDate=" + URLEncoder.encode(String.format("%02d/%02d/%04d", readEnd.getMonth(), readEnd.getDay(), readEnd.getYear()), "UTF-8");
    //       }
    //       Message.printStatus(2, routine, "Retrieve diversion by day data from DWR REST API request url: " + divRecRequest);
    //     }
    //     if(intervalBase == TimeInterval.MONTH){
    //       // Create request URL for web services API.
    //       divRecRequest = getServiceRootURI() + "/structures/divrec/divrecmonth?format=json&wdid=" + wdid + "&waterClassNum=" + waterClassNumForWdid;
    //       // Add dates to limit query, to day precision.
    //       if ( readStart != null ) {
    //         divRecRequest += "&min-dataMeasDate=" + URLEncoder.encode(String.format("%02d/%04d", readStart.getMonth(), readStart.getYear()), "UTF-8");
    //       }
    //       if ( readEnd != null ) {
    //         divRecRequest += "&max-dataMeasDate=" + URLEncoder.encode(String.format("%02d/%04d", readEnd.getMonth(), readEnd.getYear()), "UTF-8");
    //       }
    //       Message.printStatus(2, routine, "Retrieve diversion by month data from DWR REST API request url: " + divRecRequest);
    //     }
    //     if(intervalBase == TimeInterval.YEAR){
    //       // Create request URL for web services API.
    //       divRecRequest = getServiceRootURI() + "/structures/divrec/divrecyear?format=json&wdid=" + wdid + "&waterClassNum=" + waterClassNumForWdid;
    //       // Add dates to limit query, to day precision.
    //       if ( readStart != null ) {
    //         divRecRequest += "&min-dataMeasDate=" + URLEncoder.encode(String.format("%04d", readStart.getYear()), "UTF-8");
    //       }
    //       if ( readEnd != null ) {
    //         divRecRequest += "&max-dataMeasDate=" + URLEncoder.encode(String.format("%04d", readEnd.getYear()), "UTF-8");
    //       }
    //       Message.printStatus(2, routine, "Retrieve diversion by day year from DWR REST API request url: " + divRecRequest);
    //     }
    //     if ( Message.isDebugOn ) { 
    //       Message.printDebug(dl, routine, "DivRecRequest: " + divRecRequest);
    //     }
    //     // Save the URL without API key as a property to help with troubleshooting.
    //     ts.setProperty("dataUrl", divRecRequest.toString().replace("format=json", "format=jsonprettyprint"));
    //     divRecRequest += getApiKeyStringDefault();
    //     // Get JsonNode results give the request URL.
    //     JsonNode results = jacksonToolkit.getJsonNodeFromWebServices(divRecRequest);
    //     if ( (results == null) || (results.size() == 0) ){
    //       return ts;
    //     }

    //     // Set the original start and end date to the parameter period.
    //     if ( readStart == null ) {
    //       // Set the time series start to the first data record.
    //       if (intervalBase == TimeInterval.DAY ) {
    //         DiversionByDay divRecCurrDay = (DiversionByDay)jacksonToolkit.treeToValue(results.get(0), DiversionByDay.class);
    //         ts.setDate1(divRecCurrDay.getDataMeasDate());
    //       }
    //       if (intervalBase == TimeInterval.MONTH ) {
    //         DiversionByMonth divRecCurrMonth = (DiversionByMonth)jacksonToolkit.treeToValue(results.get(0), DiversionByMonth.class);
    //         ts.setDate1(divRecCurrMonth.getDataMeasDate());
    //       }
    //       if (intervalBase == TimeInterval.YEAR ) {
    //         DiversionByYear divRecCurrYear = (DiversionByYear)jacksonToolkit.treeToValue(results.get(0), DiversionByYear.class);
    //         ts.setDate1(divRecCurrYear.getDataMeasDate());
    //       }
    //     }
    //     else {
    //       ts.setDate1(readStart);
    //     }
    //     if ( readEnd == null ) {
    //       // Set the time series start to the last data record
    //       if (intervalBase == TimeInterval.DAY ) {
    //         DiversionByDay divRecCurrDay = (DiversionByDay)jacksonToolkit.treeToValue(results.get(results.size() - 1), DiversionByDay.class);
    //         ts.setDate2(divRecCurrDay.getDataMeasDate());
    //       }
    //       if (intervalBase == TimeInterval.MONTH ) {
    //         DiversionByMonth divRecCurrMonth = (DiversionByMonth)jacksonToolkit.treeToValue(results.get(results.size() - 1), DiversionByMonth.class);
    //         ts.setDate2(divRecCurrMonth.getDataMeasDate());
    //       }
    //       if (intervalBase == TimeInterval.YEAR ) {
    //         DiversionByYear divRecCurrYear = (DiversionByYear)jacksonToolkit.treeToValue(results.get(results.size() - 1), DiversionByYear.class);
    //         ts.setDate2(divRecCurrYear.getDataMeasDate());
    //       }
    //     }
    //     else {
    //       ts.setDate2(readEnd);
    //     }
        
    //     // Allocate data space.
    //     ts.allocateDataSpace();
        
    //     // Transfer data into TS object.
    //     String units;
    //     String obsCode;
    //     Double value;
    //     boolean valueIsMissing;
    //     if(intervalBase == TimeInterval.DAY){
    //       for(int i = 0; i < results.size(); i++){
            
    //         DiversionByDay divRecCurrDay = (DiversionByDay)jacksonToolkit.treeToValue(results.get(i), DiversionByDay.class);
            
    //         // 1. Check to see if units have been set and if not, set them.
    //         units = divRecCurrDay.getMeasUnits();
    //         if(tsUnits == null){
    //           tsUnits = units;
    //           ts.setDataUnits(tsUnits);
    //           ts.setDataUnitsOriginal(tsUnits);
    //         }
            
    //         // 2. Make sure units are the same.
    //         if(!units.equalsIgnoreCase(tsUnits)){
    //           // TODO ... automatically convert units.
    //           continue;
    //           // TODO ... decide whether and exception should be thrown?
    //         }
            
    //         // Set the date.
    //         DateTime date = new DateTime(DateTime.PRECISION_DAY);
    //         date.setYear(divRecCurrDay.getYear());
    //         date.setMonth(divRecCurrDay.getMonth());
    //         date.setDay(divRecCurrDay.getDay());
            
    //         // Get the data.
    //         value = divRecCurrDay.getDataValue();
    //         obsCode = divRecCurrDay.getObsCode();
    //         if ( obsCode != null ) {
    //           obsCode = obsCode.trim();
    //         }
    //         valueIsMissing = isTimeSeriesValueMissing(value, true);
    //         if ( !valueIsMissing || ((obsCode != null) && !obsCode.isEmpty()) ) {
    //           // Have a data value and/or observation code to set.
    //           if ( valueIsMissing ) {
    //             // Use the missing value for the time series.
    //             value = ts.getMissing();
    //           }
    //           if ( (obsCode != null) && !obsCode.isEmpty() ) {
    //             // Set the data value with the flag.
    //             ts.setDataValue(date, value, obsCode, -1);
    //           }
    //           else {
    //             // No observation code so just set the value.
    //             ts.setDataValue(date, value);
    //           }
    //         }
    //       }
    //     }
    //     if(intervalBase == TimeInterval.MONTH){
    //       for(int i = 0; i < results.size(); i++){
    //         DiversionByMonth divRecCurrMonth = (DiversionByMonth)jacksonToolkit.treeToValue(results.get(i), DiversionByMonth.class);
            
    //         // 1. Check to see if units have been set and if not, set them.
    //         units = divRecCurrMonth.getMeasUnits();
    //         if(tsUnits == null){
    //           tsUnits = units;
    //           ts.setDataUnits(tsUnits);
    //           ts.setDataUnitsOriginal(tsUnits);
    //         }
            
    //         // 2. Make sure units are the same.
    //         if(!units.equalsIgnoreCase(tsUnits)){
    //           // TODO ... automatically convert units.
    //           continue;
    //           // TODO ... decide whether and exception should be thrown?
    //         }
            
    //         // Set the date.
    //         DateTime date = new DateTime(DateTime.PRECISION_MONTH);
    //         date.setYear(divRecCurrMonth.getYear());
    //         date.setMonth(divRecCurrMonth.getMonth());
            
    //         // Get the data:
    //         // - monthly data also have observation code
    //         value = divRecCurrMonth.getDataValue();
    //         obsCode = divRecCurrMonth.getObsCode();
    //         if ( obsCode != null ) {
    //           obsCode = obsCode.trim();
    //         }
    //         valueIsMissing = isTimeSeriesValueMissing(value, true);
    //         if ( !valueIsMissing || ((obsCode != null) && !obsCode.isEmpty()) ) {
    //           // Have a data value and/or observation code to set.
    //           if ( valueIsMissing ) {
    //             // Use the missing value for the time series.
    //             value = ts.getMissing();
    //           }
    //           if ( (obsCode != null) && !obsCode.isEmpty() ) {
    //             // Set the data value with the flag.
    //             ts.setDataValue(date, value, obsCode, -1);
    //           }
    //           else {
    //             // No observation code so just set the value.
    //             ts.setDataValue(date, value);
    //           }
    //         }
    //       }
    //     }
    //     if(intervalBase == TimeInterval.YEAR){
    //       for(int i = 0; i < results.size(); i++){
    //         DiversionByYear divRecCurrYear = (DiversionByYear)jacksonToolkit.treeToValue(results.get(i), DiversionByYear.class);
            
    //         // 1. Check to see if units have been set and if not, set them.
    //         units = divRecCurrYear.getMeasUnits();
    //         if(tsUnits == null){
    //           tsUnits = units;
    //           ts.setDataUnits(tsUnits);
    //           ts.setDataUnitsOriginal(tsUnits);
    //         }
            
    //         // 2. Make sure units are the same.
    //         if(!units.equalsIgnoreCase(tsUnits)){
    //           // TODO ... automatically convert units.
    //           continue;
    //           // TODO ... decide whether and exception should be thrown?
    //         }
            
    //         // Set the date.
    //         DateTime date = new DateTime(DateTime.PRECISION_YEAR);
    //         date.setYear(divRecCurrYear.getYear());
            
    //         // Get the data.
    //         value = divRecCurrYear.getDataValue();
            
    //         if ( !isTimeSeriesValueMissing(value, true) ) {
    //           ts.setDataValue(date, value);
    //         }
    //       }
    //     }

    //     // Set comments based on period and units set when reading data.
    //     setCommentsForStructure(ts, struct);

    //     // Add observation code descriptions, which have been set with data.
    //     List<ReferenceTablesDivRecObservationCodes> obsCodes = getDivRecObservationCodes();
    //     for ( ReferenceTablesDivRecObservationCodes obsCode2 : obsCodes ) {
    //       // Years indicate years when description was used:
    //       // - if endIyr is null, then the code is still active
    //       String endYearString = "current";
    //       if ( obsCode2.getEndIyr() != null ) {
    //         endYearString = "" + obsCode2.getEndIyr();
    //       }
    //             ts.addDataFlagMetadata(new TSDataFlagMetadata(obsCode2.getObsCode(), "Observation code - " +
    //               obsCode2.getObsCodeLong() + ", " + obsCode2.getObsDescr() + " (" + obsCode2.getStartIyr() + "-" + endYearString + ")") );
    //     }
        
    //     /**
    //      * If any data is set within the irrigation year then fill the rest of the data
    //      * forward or fill empty data with 0.0.
    //      * The default is false, which is changed by command parameters.
    //      */
    //     if ( intervalBase == TimeInterval.DAY ) {
    //       String fillCarryForward = props.getValue("FillDivRecordsCarryForward");
    //       if ( (fillCarryForward == null) || fillCarryForward.equals("") ) {
    //         fillCarryForward = "true"; // Default is to fill, consistent with CDSS/HydroBase approach.
    //       }
    //       if(fillCarryForward.equalsIgnoreCase("true")){
    //         Message.printStatus(2, routine, "TSID=" + ts.getIdentifierString() + ", filling daily diversion records with carry forward because FillDivRecordsCarryForward=" + fillCarryForward );
    //         String fillCarryForwardFlag = props.getValue("FillDivRecordsCarryForwardFlag");
    //         if((fillCarryForwardFlag == null) || fillCarryForwardFlag.isEmpty()){
    //           fillCarryForwardFlag = "c"; // Default.
    //         }
    //         // The following will add the flag as another flag description.
    //         fillTSIrrigationYearCarryForward((DayTS)ts, fillCarryForwardFlag);
    //       }
    //       else {
    //         Message.printStatus(2, routine, "TSID=" + ts.getIdentifierString() + ", not filling daily diversion records with carry forward because FillDivRecordsCarryForward=" + fillCarryForward );
    //       }
    //     }
        
    //     boolean useHydroBaseDMILogic = true;
    //     if ( useHydroBaseDMILogic ) {
    //       // Use logic similar to HydroBaseDMI.readTimeSeries:
    //       // - parameters are same as ReadHydroBase command
    //       // - default is false (don't fill using comments)
    //       // - the properties are passed in from the Read command
    //       // - this applies to day, month, and year interval data
    //       boolean extendPeriod = true;
    //       String fillDivComments = props.getValue("FillUsingDivComments");
    //       if ( (fillDivComments != null) && fillDivComments.equalsIgnoreCase("true") ) {
    //         Message.printStatus(2, routine, "TSID=" + ts.getIdentifierString() +
    //           ", filling diversion records with diversion comments because FillUsingDivComments=" + fillDivComments );
    //         String fillFlag = props.getValue("FillUsingDivCommentsFlag");
    //         if ( (fillFlag == null) || fillFlag.isEmpty() ) {
    //           fillFlag = "Auto";
    //         }
    //         // If not specified use "Auto".
    //         // Fill flag description is automatically assigned to "notUsed" value.
    //         String fillFlagDesc = "Auto";
    //         fillTSUsingDiversionComments( ts, readStart, readEnd,
    //           fillFlag, fillFlagDesc, extendPeriod );
    //       }
    //       else {
    //         Message.printStatus(2, routine, "TSID=" + ts.getIdentifierString() + ", not filling diversion records with diversion comments because FillUsingDivComments=" + fillDivComments );
    //       }
    //     }
    //     else {
    //       // CURRENTLY DISABLED BY IF BOOLEAN.
    //       // Use logic that was roughly ported from HydroBase but does not seem correct:
    //       // - TODO smalers 2019-08-26 code is disabled so delete when the above checks out
        
        
    //     // Fill years with diversion comments. Currently defaults to not fill.

    //     TSIterator iterator = null;
    //     if(intervalBase == TimeInterval.DAY ||
    //       intervalBase == TimeInterval.MONTH || 
    //       intervalBase == TimeInterval.YEAR ) {
    //       String FillUsingDivComments = null;
    //       if((FillUsingDivComments == null) || FillUsingDivComments.equals("")){
    //         FillUsingDivComments = "true"; // Default is to fill in order to provide more information.
    //       }
    //       if(FillUsingDivComments.equalsIgnoreCase("true")){
    //         boolean hasComments = waterclassHasComments(wdid);
    //         if(hasComments){
    //           Message.printStatus(2, routine, "Structure has diversion comments - process to add more zeros.");
    //           List<DiversionComments> divComments = getDivComments(wdid, null, -1);
    //           if(divComments != null){
    //             TSData it;
    //             for(int i = 0; i < divComments.size(); i++){
    //               DiversionComments divComment = divComments.get(i);
    //               int irrYear = divComment.getIrrYear();
    //               if(irrYear >= ts.getDate1().getYear() && irrYear <= ts.getDate2().getYear()){
    //                 DateTime start;
    //                 DateTime end;
    //                 if(intervalBase == TimeInterval.DAY){
    //                   start = new DateTime(DateTime.PRECISION_DAY);
    //                   start.setYear(irrYear);
    //                   start.setMonth(11);
    //                   start.setDay(1);
    //                   end = new DateTime(DateTime.PRECISION_DAY);
    //                   end.setYear(irrYear + 1);
    //                   end.setMonth(10);
    //                   end.setDay(31);
    //                   iterator = ts.iterator(start,end);
    //                   // Get the existing data and if missing set as zero.
    //                   while(iterator.hasNext()){
    //                     it = iterator.next();
    //                     value = it.getDataValue();
    //                     if ( !isTimeSeriesValueMissing(value, true) ) {
    //                       ts.setDataValue(it.getDate(), 0, it.getDataFlag(), -1);
    //                     }
    //                   }
    //                 }
    //                 if(intervalBase == TimeInterval.MONTH){
    //                   start = new DateTime(DateTime.PRECISION_MONTH);
    //                   start.setYear(irrYear);
    //                   start.setMonth(11);
    //                   end = new DateTime(DateTime.PRECISION_MONTH);
    //                   end.setYear(irrYear);
    //                   end.setMonth(10);
    //                   iterator = ts.iterator(start,end);
    //                   // Get the existing data and if missing set as zero.
    //                   while(iterator.hasNext()){
    //                     it = iterator.next();
    //                     value = it.getDataValue();
    //                     if ( !isTimeSeriesValueMissing(value, true) ) {
    //                       ts.setDataValue(it.getDate(), 0, it.getDataFlag(), -1);
    //                     }
    //                   }
    //                 }
    //                 if(intervalBase == TimeInterval.YEAR){
    //                   start = new DateTime(DateTime.PRECISION_YEAR);
    //                   start.setYear(irrYear);
    //                   end = new DateTime(DateTime.PRECISION_YEAR);
    //                   end.setYear(irrYear);
    //                   iterator = ts.iterator(start,end);
    //                   // Get the existing data and if missing set as zero.
    //                   while(iterator.hasNext()){
    //                     it = iterator.next();
    //                     value = it.getDataValue();
    //                     if ( !isTimeSeriesValueMissing(value, true) ) {
    //                       ts.setDataValue(it.getDate(), 0, it.getDataFlag(), -1);
    //                     }
    //                   }
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //     }
    //   }
    // }
    // else if (
    //   dataTypeReq.equalsIgnoreCase("Stage") ||
    //   dataTypeReq.equalsIgnoreCase("Volume") ) {
    //   // Reservoir structure.
    //   String wdid = locid;
      
    //   // Get the structure.
    //   String structRequest = getServiceRootURI() + "/structures?format=json&wdid=" + wdid + getApiKeyStringDefault();
    //   if ( Message.isDebugOn ) {
    //     Message.printDebug ( dl, routine, "structRequest: " + structRequest );
    //   }
    //   JsonNode structResult = jacksonToolkit.getJsonNodeFromWebServices(structRequest).get(0);
    //   // Log structure request for debugging properties.
    //   //System.out.println(structRequest);
    //   Message.printStatus(2, routine, "Retrieve structure data from DWR REST API request url: " + structRequest);
    //   // Use jackson to convert structResult into a Structure POJO for easy retrieval of data>
    //   Structure struct = (Structure)jacksonToolkit.treeToValue(structResult, Structure.class);
    //   if(struct == null){
    //     return ts;
    //   }

    //   // Retrieve water class for divrectype "StageVolume".
    //   String waterClassReqString = null; // Since no water class.
    //   DiversionWaterClass waterClassForWdid = readWaterClassNumForWdid(wdid,waterClassReqString,"StageVolume");
      
    //   // Set structure name as TS Description
    //   ts.setDescription(struct.getStructureName());
      
    //   if ( waterClassForWdid == null ) {
    //     return ts;
    //   }
      
    //   // Get the first and last date.
    //   // First Date / Also set ts.setDataUnits() and ts.setDataUnitsOriginal().
    //   DateTime firstDate = new DateTime(waterClassForWdid.getPorStart());
    //   firstDate.setPrecision(DateTime.PRECISION_DAY);
    //   ts.setDate1Original(firstDate);
      
    //   // Last Date
    //   DateTime lastDate = new DateTime(waterClassForWdid.getPorEnd());
    //   lastDate.setPrecision(DateTime.PRECISION_DAY); 
    //   ts.setDate2Original(lastDate);
        
    //   // TODO smalers 2019-06-15 hard-code units since only specified in documentation.
    //   if ( dataTypeReq.equalsIgnoreCase("Stage") ) {
    //     ts.setDataUnitsOriginal("FT");
    //     ts.setDataUnits("FT");
    //   }
    //   else if ( dataTypeReq.equalsIgnoreCase("Volume") ) {
    //     ts.setDataUnitsOriginal("ACFT");
    //     ts.setDataUnits("ACFT");
    //   }
        
    //   /* TODO smalers 2019-06-15 maybe set the web service here?
    //   if(intervalBase == TimeInterval.DAY){
    //     ts.setInputName ( "HydroBase daily_amt.amt_*, daily_amt.obs_*");
    //   }
    //   if(intervalBase == TimeInterval.MONTH){
    //     ts.setInputName("HydroBase annual_amt.amt_*");
    //   }
    //   if(intervalBase == TimeInterval.YEAR){
    //     ts.setInputName ( "HydroBase annual_amt.ann_amt");
    //   }
    //   */
      
    //   //TSIterator iterator = ts.iterator();
      
    //   // 4. Set properties:
    //   //    - FIXME @jurentie 06/26/2018 - move add to genesis elsewhere.
    //   //ts.addToGenesis("read data from web services " + structRequest + " and " + divRecRequest + "."); // might need to add waterclasses URL string
    //   setTimeSeriesPropertiesForStructure(ts, struct, waterClassForWdid);
      
    //   setCommentsForStructure(ts, struct);
      
    //   if(!readData){
    //     return ts;
    //   }
    //   else {
    //     // Read the data.
        
    //     // Get the data from web services.
    //     String divRecRequest = null;
    //     // Create request URL for web services API.
    //     divRecRequest = getServiceRootURI() + "/structures/divrec/stagevolume/" + wdid + "?format=json";
    //     // Add dates to limit query, to day precision
    //     if ( readStart != null ) {
    //       divRecRequest += "&min-dataMeasDate=" + URLEncoder.encode(String.format("%02d/%02d/%04d", readStart.getMonth(), readStart.getDay(), readStart.getYear()), "UTF-8");
    //     }
    //     if ( readEnd != null ) {
    //       divRecRequest += "&max-dataMeasDate=" + URLEncoder.encode(String.format("%02d/%02d/%04d", readEnd.getMonth(), readEnd.getDay(), readEnd.getYear()), "UTF-8");
    //     }
    //     //System.out.println(divRecRequest);
    //     // Get JsonNode results give the request URL.
    //     // Save the URL without API key as property for troubleshooting.
    //     ts.setProperty("dataUrl", divRecRequest.toString().replace("format=json", "format=jsonprettyprint"));
    //     divRecRequest += getApiKeyStringDefault();
    //     if ( Message.isDebugOn ) {
    //       Message.printDebug ( dl, routine, "divRecRequest: " + divRecRequest );
    //     }
    //     JsonNode results = jacksonToolkit.getJsonNodeFromWebServices(divRecRequest);
        
    //     if ( (results == null) || (results.size() == 0) ) {
    //       return ts;
    //     }

    //     // Set start and end date.
    //     if(readStart == null){
    //       DiversionStageVolume divStageVol = (DiversionStageVolume)jacksonToolkit.treeToValue(results.get(0), DiversionStageVolume.class);
    //       ts.setDate1(divStageVol.getDataMeasDate());
    //     }
    //     else {
    //       ts.setDate1(readStart);
    //     }
    //     if ( readEnd == null) {
    //       DiversionStageVolume divStageVol = (DiversionStageVolume)jacksonToolkit.treeToValue(results.get(results.size() - 1), DiversionStageVolume.class);
    //       ts.setDate2(divStageVol.getDataMeasDate());
    //     }
    //     else {
    //       ts.setDate2(readEnd);
    //     }

    //     // Allocate data space.
    //     ts.allocateDataSpace();
          
    //     // Create date to iterate through the data.
    //     DateTime date = new DateTime(DateTime.PRECISION_DAY);
    //     for(int i = 0; i < results.size(); i++){
    //       DiversionStageVolume divStageVol = (DiversionStageVolume)jacksonToolkit.treeToValue(results.get(i), DiversionStageVolume.class);
            
    //       // Set the date.
    //       date.setYear(divStageVol.getYear());
    //       date.setMonth(divStageVol.getMonth());
    //       date.setDay(divStageVol.getDay());
            
    //       // Get the data.
    //       Double value = null;
    //       if(dataTypeReq.equalsIgnoreCase("Stage")){
    //         value = divStageVol.getStage();
    //       }
    //       else if(dataTypeReq.equalsIgnoreCase("Volume")){
    //         value = divStageVol.getVolume();
    //       }
          
    //       if ( !isTimeSeriesValueMissing(value, true) ) {
    //         ts.setDataValue(date, value);
    //       }
    //     }
    //   }
    // }
    // else if ( isSurfaceWaterStationTimeSeriesDataType(dataTypeReq) ) {
    //   // Surface water station time series.

    //   String dataType = dataTypeReq;
    //   if ( (dataTypeReq != null) && dataTypeReq.toUpperCase().startsWith("STREAMFLOW-") ) {
    //     // Surface water station data types can only have 'measType=Streamflow' and depending on interval have different statistic values.
    //     // TSTool uses Streamflow-Avg for the datatype, so have to strip off the end.
    //     dataType = "Streamflow";
    //   }

    //   // Round the times and also remove time zone since not returned from web services.
    //   // - TODO smalers 2022-03-16 don't need to round because dates in time series will have
    //   //   precision of the time series interval, remove code when tested out.
    //   /*
    //   if ( readStart != null ) {
    //     // Round to 15-minute so that allocated time series will align with data.
    //     readStart = new DateTime(readStart);
    //     readStart.round(-1, TimeInterval.MINUTE, 15);
    //     readStart.setTimeZone("");
    //   }
    //   if ( readEnd != null ) {
    //     // Round to 15-minute so that allocated time series will align with data.
    //     readEnd = new DateTime(readEnd);
    //     readEnd.round(1, TimeInterval.MINUTE, 15);
    //     readEnd.setTimeZone("");
    //   }
    //   */
      
    //   // Get the surface water station.
    //   String stationRequest = "";
    //   String locParam = "";
    //   if ( locType.equalsIgnoreCase("abbrev") ) {
    //     locParam = "&abbrev=" + locid;
    //   }
    //   else if ( locType.equalsIgnoreCase("usgs") ) {
    //     locParam = "&usgsSiteId=" + locid;
    //   }
    //   stationRequest = getServiceRootURI() + "/surfacewater/surfacewaterstations?format=json" + locParam + getApiKeyStringDefault();
    //   if ( Message.isDebugOn ) {
    //     Message.printDebug ( dl, routine, "stationRequest: " + stationRequest );
    //   }
    //   JsonNode results0 = jacksonToolkit.getJsonNodeFromWebServices(stationRequest);
    //   JsonNode stationResult = null;
    //   if ( results0 == null ) {
    //     Message.printWarning(3, routine, "No data returned for:  " + stationRequest);
    //     return ts;
    //   }
    //   else {
    //     stationResult = results0.get(0);
    //   }
      
    //   SurfaceWaterStation station = (SurfaceWaterStation)jacksonToolkit.treeToValue(stationResult, SurfaceWaterStation.class);
    //   Message.printStatus(2, routine, "Retrieve surface water stations from DWR REST API request url: " + stationRequest);

    //   // Get the surface water station data type.
    //   String stationDataTypeRequest = "";
    //   stationDataTypeRequest = getServiceRootURI() + "/surfacewater/surfacewaterstationdatatypes?format=json" + locParam +
    //     "&measType=" + dataType + getApiKeyStringDefault();
    //   if ( Message.isDebugOn ) {
    //     Message.printDebug(dl, routine, "stationDataTypesRequest: " + stationDataTypeRequest);
    //   }
    //   results0 = jacksonToolkit.getJsonNodeFromWebServices(stationDataTypeRequest);
    //   JsonNode stationDataTypeResult = null;
    //   if ( results0 == null ) {
    //     Message.printWarning(3, routine, "No data returned for:  " + stationDataTypeRequest);
    //     return ts;
    //   }
    //   else {
    //     stationDataTypeResult = results0.get(0);
    //   }
      
    //   SurfaceWaterStationDataType stationDataType = (SurfaceWaterStationDataType)jacksonToolkit.treeToValue(stationDataTypeResult, SurfaceWaterStationDataType.class);
    //   Message.printStatus(2, routine, "Retrieve surface water station data types from DWR REST API request url: " + stationDataTypeRequest);
      
    //   // Set the description:
    //   // - use the station name since nothing suitable on data type/parameter
    //   ts.setDescription(station.getStationName());
      
    //   // Set data units depending on the data type:
    //   // - also set a boolean to allow checking the records because some time series don't seem to have units in metadata
    //   if ( dataTypeReq.equalsIgnoreCase("Streamflow-Avg") ||
    //     dataTypeReq.equalsIgnoreCase("Streamflow-Min") ||
    //     dataTypeReq.equalsIgnoreCase("Streamflow-Max") ) {
    //     ts.setDataUnitsOriginal("cfs");
    //     ts.setDataUnits("cfs");
    //   }
    //   else if ( dataTypeReq.equalsIgnoreCase("Streamflow-Total") ) {
    //     ts.setDataUnitsOriginal("af");
    //     ts.setDataUnits("af");
    //   }
    //   boolean dataUnitsSet = false;
    //   boolean dataUnitsOriginalSet = false;
    //   if ( !ts.getDataUnitsOriginal().isEmpty() ) {
    //     dataUnitsOriginalSet = true;
    //   }
    //   if ( !ts.getDataUnits().isEmpty() ) {
    //     dataUnitsSet = true;
    //   }
      
    //   // Set the available start and end date to the time series parameter period.
    //   ts.setDate1Original(stationDataType.getPorStart());
    //   ts.setDate2Original(stationDataType.getPorEnd());
    //   Message.printStatus(2,routine,"Date1Original=" + ts.getDate1Original() + " Date2Original=" + ts.getDate2Original());

    //   setTimeSeriesPropertiesForSurfaceWaterStation(ts, station, stationDataType);
    //   setCommentsForSurfaceWaterStation(ts, station);

    //   // If not reading the data, return the time series with only header information.
    //   if ( !readData ) {
    //     return ts;
    //   }

    //   // Read the time series records.
    //   StringBuilder tsRequest = new StringBuilder();

    //   // Retrieve surface water station time series data based on interval
    //   // - make sure the precision of the requested dates is day for web services
    //   DateTime readStart2 = null;
    //   DateTime readEnd2 = null;
    //   if ( readStart != null ) {
    //     readStart2 = new DateTime(readStart);
    //     readStart2.setPrecision(DateTime.PRECISION_DAY);
    //   }
    //   if ( readEnd != null ) {
    //     readEnd2 = new DateTime(readEnd);
    //     readEnd2.setPrecision(DateTime.PRECISION_DAY);
    //   }
    //   // Date/time format is day format regardless of interval, but set to full month and year to ensure all data is returned.
    //   if ( intervalBase == DateTime.PRECISION_DAY ) {
    //     tsRequest.append(getServiceRootURI() + "/surfacewater/surfacewatertsday?format=json&dateFormat=dateOnly" + locParam + "&measType=" + dataType);
    //     // No need to change the requested date/time - use what was passed in.
    //   }
    //   else if ( intervalBase == DateTime.PRECISION_MONTH ) {
    //     tsRequest.append(getServiceRootURI() + "/surfacewater/surfacewatertsmonth?format=json&dateFormat=dateOnly" + locParam + "&measType=" + dataType);
    //     // Specify a full months using day precision.
    //     if ( readStart2 != null ) {
    //       readStart2.setDay(1);
    //     }
    //     if ( readEnd2 != null ) {
    //       readEnd2.setDay(TimeUtil.numDaysInMonth(readEnd2));
    //     }
    //   }
    //   else if ( intervalBase == DateTime.PRECISION_YEAR ) {
    //     tsRequest.append(getServiceRootURI() + "/surfacewater/surfacewatertswateryear?format=json&dateFormat=dateOnly" + locParam + "&measType=" + dataType);
    //     // Specify a full months using day precision.
    //     if ( readStart2 != null ) {
    //       readStart2.setDay(1);
    //       readStart2.setMonth(1);
    //     }
    //     if ( readEnd2 != null ) {
    //       readEnd2.setDay(31);
    //       readEnd2.setMonth(12);
    //     }
    //   }
    //   String minMeasDateParam = "";
    //   String maxMeasDateParam = "";
    //   if ( readStart2 != null ) {
    //     if ( intervalBase == DateTime.PRECISION_DAY ) {
    //       minMeasDateParam = "&min-MeasDate=" + URLEncoder.encode(String.format("%02d/%02d/%04d", readStart2.getMonth(), readStart2.getDay(), readStart2.getYear()), "UTF-8");
    //     }
    //     else if ( intervalBase == DateTime.PRECISION_MONTH ) {
    //       minMeasDateParam = "&min-calYear=" + readStart2.getYear();
    //     }
    //     else if ( intervalBase == DateTime.PRECISION_YEAR ) {
    //       minMeasDateParam = "&min-waterYear=" + readStart2.getYear();
    //     }
    //   }
    //   if ( readEnd2 != null ) {
    //     if ( intervalBase == DateTime.PRECISION_DAY ) {
    //       maxMeasDateParam = "&max-MeasDate=" + URLEncoder.encode(String.format("%02d/%02d/%04d", readEnd2.getMonth(), readEnd2.getDay(), readEnd2.getYear()), "UTF-8");
    //     }
    //     else if ( intervalBase == DateTime.PRECISION_MONTH ) {
    //       maxMeasDateParam = "&max-calYear=" + readEnd2.getYear();
    //     }
    //     else if ( intervalBase == DateTime.PRECISION_YEAR ) {
    //       maxMeasDateParam = "&max-waterYear=" + readEnd2.getYear();
    //     }
    //   }
    //   tsRequest.append(minMeasDateParam);
    //   tsRequest.append(maxMeasDateParam);
    //   // Add URL without key, to help with troubleshooting.
    //   ts.setProperty("dataUrl", tsRequest.toString().replace("format=json", "format=jsonprettyprint"));
    //   tsRequest.append(getApiKeyStringDefault());
    //   Message.printStatus(2, routine, "Retrieve surface water station time series from DWR REST API request url: " + tsRequest);
      
    //   JsonNode results = jacksonToolkit.getJsonNodeFromWebServices(tsRequest.toString());
    //   if ( (results == null) || (results.size() == 0) ){
    //     return ts;
    //   }

    //   // Set the actual data period to the requested period if specified,
    //   // or the actual period if the requested period was not specified.
    //   if ( readStart2 == null ) {
    //     if ( intervalBase == DateTime.PRECISION_DAY ) {
    //       SurfaceWaterTSDay staTS = (SurfaceWaterTSDay)jacksonToolkit.treeToValue(results.get(0), SurfaceWaterTSDay.class);
    //       DateTime firstDate = staTS.getMeasDate();
    //       ts.setDate1(firstDate);
    //     }
    //     else if ( intervalBase == DateTime.PRECISION_MONTH ) {
    //       SurfaceWaterTSMonth staTS = (SurfaceWaterTSMonth)jacksonToolkit.treeToValue(results.get(0), SurfaceWaterTSMonth.class);
    //       DateTime firstDate = new DateTime(DateTime.PRECISION_MONTH);
    //       firstDate.setMonth(staTS.getCalMonNum());
    //       firstDate.setYear(staTS.getCalYear());
    //       ts.setDate1(firstDate);
    //     }
    //     else if ( intervalBase == DateTime.PRECISION_YEAR ) {
    //       SurfaceWaterTSYear staTS = (SurfaceWaterTSYear)jacksonToolkit.treeToValue(results.get(0), SurfaceWaterTSYear.class);
    //       DateTime firstDate = new DateTime(DateTime.PRECISION_YEAR);
    //       firstDate.setYear(staTS.getWaterYear());
    //       ts.setDate1(firstDate);
    //     }
    //   }
    //   else {
    //     ts.setDate1(readStart2);
    //   }
    //   if ( readEnd2 == null ) {
    //     if ( intervalBase == DateTime.PRECISION_DAY ) {
    //       SurfaceWaterTSDay staTS = (SurfaceWaterTSDay)jacksonToolkit.treeToValue(results.get(results.size() - 1), SurfaceWaterTSDay.class);
    //       DateTime firstDate = staTS.getMeasDate();
    //       ts.setDate2(firstDate);
    //     }
    //     else if ( intervalBase == DateTime.PRECISION_MONTH ) {
    //       SurfaceWaterTSMonth staTS = (SurfaceWaterTSMonth)jacksonToolkit.treeToValue(results.get(results.size() - 1), SurfaceWaterTSMonth.class);
    //       DateTime firstDate = new DateTime(DateTime.PRECISION_MONTH);
    //       firstDate.setMonth(staTS.getCalMonNum());
    //       firstDate.setYear(staTS.getCalYear());
    //       ts.setDate2(firstDate);
    //     }
    //     else if ( intervalBase == DateTime.PRECISION_YEAR ) {
    //       SurfaceWaterTSYear staTS = (SurfaceWaterTSYear)jacksonToolkit.treeToValue(results.get(results.size() - 1), SurfaceWaterTSYear.class);
    //       DateTime firstDate = new DateTime(DateTime.PRECISION_YEAR);
    //       firstDate.setYear(staTS.getWaterYear());
    //       ts.setDate2(firstDate);
    //     }
    //   }
    //   else {
    //     ts.setDate2(readEnd2);
    //   }

    //   // Allocate data space.
    //   ts.allocateDataSpace();
    //   Message.printStatus(2, routine, "Allocated memory for " + ts.getDate1() + " to " + ts.getDate2() );
      
    //   // Set the properties.
    //   ts.addToGenesis("Read data from web services: " + tsRequest );
      
    //   // Read the data
    //   // Pass data into the TS object.
    //   String measUnit = null;
    //   if ( intervalBase == TimeInterval.DAY ) {
    //     // Can declare DateTime outside of loop because time series stores in an array.
    //     DateTime date = new DateTime(DateTime.PRECISION_DAY);
    //     for ( int i = 0; i < results.size(); i++ ) {
    //       SurfaceWaterTSDay tsDay = (SurfaceWaterTSDay)jacksonToolkit.treeToValue(results.get(i), SurfaceWaterTSDay.class);
    //       // If units were not set in the station data type, set here.
    //       measUnit = tsDay.getMeasUnit();
    //       if ( !dataUnitsSet && (measUnit != null) && !measUnit.isEmpty() ) {
    //         // Make sure the units are consistent.
    //         ts.setDataUnits(measUnit);
    //         dataUnitsSet = true;
    //       }
    //       if ( !dataUnitsOriginalSet && (measUnit != null) && !measUnit.isEmpty() ) {
    //         // Make sure the units are consistent.
    //         ts.setDataUnitsOriginal(measUnit);
    //         dataUnitsOriginalSet = true;
    //       }
          
    //       // Set the date directly from the time series.
    //       date = tsDay.getMeasDate();
            
    //       // Get the data.
    //       Double value = tsDay.getValue();
    //       if ( !isTimeSeriesValueMissing(value, true) ) {
    //         ts.setDataValue(date, value);
    //       }
    //     }
    //   }
    //   else if ( intervalBase == TimeInterval.MONTH ) {
    //     // Can declare DateTime outside of loop because time series stores in an array.
    //     DateTime date = new DateTime(DateTime.PRECISION_MONTH);
    //     Double value = null;
    //     boolean doAf = false;
    //     boolean doAvg = false;
    //     boolean doMax = false;
    //     boolean doMin = false;
    //     boolean doTotal = false;
    //     if ( dataTypeReqUpper.indexOf("AVG") > 0 ) {
    //       doAvg = true;
    //     }
    //     else if ( dataTypeReqUpper.indexOf("MAX") > 0 ) {
    //       doMax = true;
    //     }
    //     else if ( dataTypeReqUpper.indexOf("MIN") > 0 ) {
    //       doMin = true;
    //     }
    //     else if ( dataTypeReqUpper.indexOf("TOT") > 0 ) {
    //       doTotal = true;
    //       doAf = true;
    //     }
    //     for ( int i = 0; i < results.size(); i++ ) {
    //       SurfaceWaterTSMonth tsMonth = (SurfaceWaterTSMonth)jacksonToolkit.treeToValue(results.get(i), SurfaceWaterTSMonth.class);
    //       // If units were not set in the station data type, set here.
    //       if ( doAf ) {
    //         measUnit = "af";
    //       }
    //       else {
    //         measUnit = "cfs";
    //       }
    //       if ( !dataUnitsSet && (measUnit != null) && !measUnit.isEmpty() ) {
    //         // Make sure the units are consistent.
    //         ts.setDataUnits(measUnit);
    //         dataUnitsSet = true;
    //       }
    //       if ( !dataUnitsOriginalSet && (measUnit != null) && !measUnit.isEmpty() ) {
    //         // Make sure the units are consistent.
    //         ts.setDataUnitsOriginal(measUnit);
    //         dataUnitsOriginalSet = true;
    //       }
          
    //       // Set the date directly from the time series.
    //       date.setMonth ( tsMonth.getCalMonNum() );
    //       date.setYear ( tsMonth.getCalYear() );
            
    //       // Get the data.
    //       if ( doAvg ) {
    //         value = tsMonth.getAvgQCfs();
    //       }
    //       else if ( doMax ) {
    //         value = tsMonth.getMaxQCfs();
    //       }
    //       else if ( doMin ) {
    //         value = tsMonth.getMinQCfs();
    //       }
    //       else if ( doTotal ) {
    //         value = tsMonth.getTotalQAf();
    //       }
    //       if ( !isTimeSeriesValueMissing(value, true) ) {
    //         ts.setDataValue(date, value);
    //       }
    //     }
    //   }
    //   else if ( intervalBase == TimeInterval.YEAR ) {
    //     // Can declare DateTime outside of loop because time series stores in an array.
    //     DateTime date = new DateTime(DateTime.PRECISION_YEAR);
    //     Double value = null;
    //     boolean doAf = false;
    //     boolean doAvg = false;
    //     boolean doMax = false;
    //     boolean doMin = false;
    //     boolean doTotal = false;
    //     if ( dataTypeReqUpper.indexOf("AVG") > 0 ) {
    //       doAvg = true;
    //     }
    //     else if ( dataTypeReqUpper.indexOf("MAX") > 0 ) {
    //       doMax = true;
    //     }
    //     else if ( dataTypeReqUpper.indexOf("MIN") > 0 ) {
    //       doMin = true;
    //     }
    //     else if ( dataTypeReqUpper.indexOf("TOT") > 0 ) {
    //       doTotal = true;
    //       doAf = true;
    //     }
    //     for ( int i = 0; i < results.size(); i++ ) {
    //       SurfaceWaterTSYear tsYear = (SurfaceWaterTSYear)jacksonToolkit.treeToValue(results.get(i), SurfaceWaterTSYear.class);
    //       // If units were not set in the station data type, set here.
    //       if ( doAf ) {
    //         measUnit = "af";
    //       }
    //       else {
    //         measUnit = "cfs";
    //       }
    //       if ( !dataUnitsSet && (measUnit != null) && !measUnit.isEmpty() ) {
    //         // Make sure the units are consistent.
    //         ts.setDataUnits(measUnit);
    //         dataUnitsSet = true;
    //       }
    //       if ( !dataUnitsOriginalSet && (measUnit != null) && !measUnit.isEmpty() ) {
    //         // Make sure the units are consistent.
    //         ts.setDataUnitsOriginal(measUnit);
    //         dataUnitsOriginalSet = true;
    //       }
          
    //       // Set the date directly from the time series.
    //       date.setYear ( tsYear.getWaterYear() );
            
    //       // Get the data.
    //       if ( doAvg ) {
    //         value = tsYear.getAvgQCfs();
    //       }
    //       else if ( doMax ) {
    //         value = tsYear.getMaxQCfs();
    //       }
    //       else if ( doMin ) {
    //         value = tsYear.getMinQCfs();
    //       }
    //       else if ( doTotal ) {
    //         value = tsYear.getTotalQAf();
    //       }
    //       if ( !isTimeSeriesValueMissing(value, true) ) {
    //         ts.setDataValue(date, value);
    //       }
    //     }
    //   }
    // }
    if (this.isTelemetryStationTimeSeriesDataType(dataTypeReq)) {
      var telemetrySubject = new Subject<TS>();
      var abbrev: string = locid;
      var parameter: string = ts.getDataType();
      var allTelemetryStationReads: Observable<any>[] = [];

      // Round the times and also remove time zone since not returned from web services.
      if (readStart !== null) {
        // Round to 15-minute so that allocated time series will align with data.
        readStart = new DateTime(readStart);
        readStart.round(-1, TimeInterval.MINUTE, 15);
        readStart.setTimeZone("");
      }
      if (readEnd !== null) {
        // Round to 15-minute so that allocated time series will align with data.
        readEnd = new DateTime(readEnd);
        readEnd.round(1, TimeInterval.MINUTE, 15);
        readEnd.setTimeZone("");
      }
      
      // Get the telemetry station.
      var telemetryRequest: string = this.getServiceRootURI() +
      "/telemetrystations/telemetrystation?format=json&includeThirdParty=true&abbrev="
      + abbrev + this.getApiKeyStringDefault();

      // if (Message.isDebugOn ) {
      //   Message.printDebug(dl, routine, "telemetryRequest: " + telemetryRequest);
      // }
      allTelemetryStationReads.push(this.commonService.getJSONData(telemetryRequest));

      // Get the Telemetry station data type (TODO smalers 2019-06-16 might be able to not query station if have enough overlap).
      var telemetryStationDataTypeRequest: string = this.getServiceRootURI() +
      "/telemetrystations/telemetrystationdatatypes?format=json&includeThirdParty=true&abbrev=" +
      abbrev + "&parameter=" + parameter + this.getApiKeyStringDefault();

      allTelemetryStationReads.push(this.commonService.getJSONData(telemetryStationDataTypeRequest));

      // Read the time series records.
      var telRequest = '';

      // Retrieve telemetry station data based on date interval.
      if (intervalBase === DateTime.PRECISION_MINUTE){
        // Note that this is 15-minute, not instantaneous.
        telRequest += this.getServiceRootURI() +
        "/telemetrystations/telemetrytimeseriesraw?format=json&includeThirdParty=true&abbrev=" +
        abbrev + "&parameter=" + parameter;
      }
      else if (intervalBase === DateTime.PRECISION_HOUR){
        telRequest += this.getServiceRootURI() +
        "/telemetrystations/telemetrytimeserieshour?format=json&includeThirdParty=true&abbrev=" +
        abbrev + "&parameter=" + parameter;
      }
      else if (intervalBase === DateTime.PRECISION_DAY){
        telRequest += this.getServiceRootURI() +
        "/telemetrystations/telemetrytimeseriesday?format=json&includeThirdParty=true&abbrev=" +
        abbrev + "&parameter=" + parameter;
      }
      // Date/time format is the same regardless of interval.
      // if ( readStart !== null ) {
      //   telRequest += "&startDate=" + URLEncoder.encode(String.format("%02d/%02d/%04d_%02d:%02d", readStart.getMonth(), readStart.getDay(), readStart.getYear(), readStart.getHour(), readStart.getMinute() ), "UTF-8");
      // }
      // if ( readEnd !== null ) {
      //   telRequest += "&endDate=" + URLEncoder.encode(String.format("%02d/%02d/%04d_%02d:%02d", readEnd.getMonth(), readEnd.getDay(), readEnd.getYear(), readEnd.getHour(), readEnd.getMinute() ), "UTF-8");
      // }
      // Add URL without key, to help with troubleshooting.
      ts.setProperty("dataUrl", telRequest.replace("format=json", "format=jsonprettyprint"));
      telRequest += this.getApiKeyStringDefault();
      
      allTelemetryStationReads.push(this.commonService.getJSONData(telRequest));
      console.log('telemetryRequest:', telemetryRequest);
      console.log('telemetryStationDataTypeRequest:', telemetryStationDataTypeRequest);
      console.log('telRequest:', telRequest);

      // 
      forkJoin(allTelemetryStationReads).subscribe((allResults: any) => {

        var telemetryResult: TelemetryStation = null;
        var telemetryStationDataTypeResult = null;
        var telTS = null;

        if ( allResults[0] === null ) {
          console.warn(3, routine, "No data returned for:  " + telemetryRequest);
          telemetrySubject.next(ts);
        }
        else {
          telemetryResult = new TelemetryStation(allResults[0].ResultList[0]);
        }

        if ( allResults[1] === null ) {
          console.warn(3, routine, "No data returned for:  " + telemetryStationDataTypeRequest);
          telemetrySubject.next(ts);
        }
        else {
          telemetryStationDataTypeResult = new TelemetryStationDataType(allResults[1].ResultList[0]);
        }
        
        // Set the description:
        // - use the station name since nothing suitable on data type/parameter
        ts.setDescription(telemetryResult.getStationName());
        
        // Set data units:
        // - also set a boolean to allow checking the records because some time series don't seem to have units in metadata
        ts.setDataUnitsOriginal(telemetryStationDataTypeResult.getParameterUnit());
        ts.setDataUnits(telemetryStationDataTypeResult.getParameterUnit());
        var dataUnitsSet = false;
        var dataUnitsOriginalSet = false;
        if ( ts.getDataUnitsOriginal().length > 0 ) {
          dataUnitsOriginalSet = true;
        }
        if ( ts.getDataUnits().length > 0 ) {
          dataUnitsSet = true;
        }
        
        // Set the available start and end date to the time series parameter period.
        ts.setDate1Original(telemetryStationDataTypeResult.getParameterPorStart());
        ts.setDate2Original(telemetryStationDataTypeResult.getParameterPorEnd());
  
        // this.setTimeSeriesPropertiesForTelemetryStation(ts, telStation, telStationDataType);
        // setCommentsForTelemetryStation(ts, telStation);
  
        // // If not reading the data, return the time series with only header information.
        // if (!readData){
        //   return ts;
        // }

        telTS = allResults[2].ResultList;
        if ((!allResults) || (allResults[2] === null) || (allResults[2].length === 0)){
          return ts;
        }

        console.log('telemetryResult:', telemetryResult);
        console.log('telemetryStationDataTypeResult:', telemetryStationDataTypeResult);
        console.log('telTS:', telTS);
      });
      throw new Error('Stopping here.');

      

    //   // Set the actual data period to the requested period if specified,
    //   // or the actual period if the requested period was not specified.
    //   if ( readStart === null ) {
    //     TelemetryTimeSeries telTS = (TelemetryTimeSeries)jacksonToolkit.treeToValue(results[0], TelemetryTimeSeries.class);
    //     var firstDate: DateTime = null;
    //     if ( (intervalBase == DateTime.PRECISION_DAY) || (intervalBase == DateTime.PRECISION_HOUR) ) {
    //       firstDate = telTS.getMeasDate();
    //     }
    //     else {
    //       firstDate = telTS.getMeasDateTime();
    //     }
    //     ts.setDate1(firstDate);
    //   }
    //   else {
    //     ts.setDate1(readStart);
    //   }
    //   if ( readEnd == null ) {
    //     TelemetryTimeSeries telTS = (TelemetryTimeSeries)jacksonToolkit.treeToValue(results[results.size() - 1], TelemetryTimeSeries.class);
    //     var lastDate: DateTime = null;
    //     if ( (intervalBase == DateTime.PRECISION_DAY) || (intervalBase == DateTime.PRECISION_HOUR) ) {
    //       lastDate = telTS.getMeasDate();
    //     }
    //     else {
    //       lastDate = telTS.getMeasDateTime();
    //     }
    //     ts.setDate2(lastDate);
    //   }
    //   else {
    //     ts.setDate2(readEnd);
    //   }

    //   // Allocate data space.
    //   ts.allocateDataSpace();
    //   // Message.printStatus(2, routine, "Allocated memory for " + ts.getDate1() + " to " + ts.getDate2() );
      
    //   // FIXME @jurentie 06/20/2018 change name of telemetryRequest/telRequest.
    //   // Set the properties.
    //   // ts.addToGenesis("read data from web services " + telemetryRequest + " and " + telRequest + ".");
      
    //   // Read the data
    //   // Pass data into the TS object.
    //   var measUnit: string = null;
    //   if (intervalBase === TimeInterval.MINUTE){
    //     // Can declare DateTime outside of loop because time series stores in an array.
    //     var date = new DateTime(DateTime.PRECISION_MINUTE);
    //     for(var i = 0; i < results.size(); i++){
    //       TelemetryTimeSeries telTSMinute = (TelemetryTimeSeries)jacksonToolkit.treeToValue(results[i], TelemetryTimeSeries.class);
    //       // If units were not set in the telemetry data types, set here.
    //       measUnit = telTSMinute.getMeasUnit();
    //       if ( !dataUnitsSet && (measUnit != null) && measUnit.length > 0 ) {
    //         // Make sure the units are consistent.
    //         ts.setDataUnits(measUnit);
    //         dataUnitsSet = true;
    //       }
    //       if ( !dataUnitsOriginalSet && (measUnit != null) && measUnit.length > 0 ) {
    //         // Make sure the units are consistent.
    //         ts.setDataUnitsOriginal(measUnit);
    //         dataUnitsOriginalSet = true;
    //       }
          
    //       // Set the date.
    //       date.setYear(telTSMinute.getYear());
    //       date.setMonth(telTSMinute.getMonth());
    //       date.setDay(telTSMinute.getDay());
    //       date.setHour(telTSMinute.getHour());
    //       date.setMinute(telTSMinute.getMinute());
            
    //       // Get the data.
    //       var value: number = telTSMinute.getMeasValue();
    //       if ( !this.isTimeSeriesValueMissing(value, true) ) {
    //         ts.setDataValueTwo(date, value);
    //       }
    //     }
    //   }
    //   if (intervalBase == TimeInterval.HOUR){
    //     // Can declare DateTime outside of loop because time series stores in an array.
    //     var date = new DateTime(DateTime.PRECISION_HOUR);
    //     for (var i = 0; i < results.size(); i++){
    //       TelemetryTimeSeries telTSHour = (TelemetryTimeSeries)jacksonToolkit.treeToValue(results[i], TelemetryTimeSeries.class);
    //       // If units were not set in the telemetry data types, set here.
    //       measUnit = telTSHour.getMeasUnit();
    //       if ( !dataUnitsSet && (measUnit !== null) && measUnit.length > 0 ) {
    //         // Make sure the units are consistent.
    //         ts.setDataUnits(measUnit);
    //         dataUnitsSet = true;
    //       }
    //       if ( !dataUnitsOriginalSet && (measUnit != null) && measUnit.length > 0 ) {
    //         // Make sure the units are consistent.
    //         ts.setDataUnitsOriginal(measUnit);
    //         dataUnitsOriginalSet = true;
    //       }
          
    //       // Set the date.
    //       date.setYear(telTSHour.getYear());
    //       date.setMonth(telTSHour.getMonth());
    //       date.setDay(telTSHour.getDay());
    //       date.setHour(telTSHour.getHour());

    //       // Get the data.
    //       var value: number = telTSHour.getMeasValue();
    //       if ( !this.isTimeSeriesValueMissing(value, true) ) {
    //         ts.setDataValueTwo(date, value);
    //       }
    //     }
    //   }
    //   if (intervalBase == TimeInterval.DAY){
    //     // Can declare DateTime outside of loop because time series stores in an array.
    //     var date = new DateTime(DateTime.PRECISION_DAY);
    //     for(var i = 0; i < results.size(); i++){
    //       TelemetryTimeSeries telTSDay = (TelemetryTimeSeries)jacksonToolkit.treeToValue(results[i], TelemetryTimeSeries.class);
    //       // If units were not set in the telemetry data types, set here.
    //       measUnit = telTSDay.getMeasUnit();
    //       if ( !dataUnitsSet && (measUnit != null) && !measUnit.isEmpty() ) {
    //         // Make sure the units are consistent.
    //         ts.setDataUnits(measUnit);
    //         dataUnitsSet = true;
    //       }
    //       if ( !dataUnitsOriginalSet && (measUnit != null) && !measUnit.isEmpty() ) {
    //         // Make sure the units are consistent.
    //         ts.setDataUnitsOriginal(measUnit);
    //         dataUnitsOriginalSet = true;
    //       }
          
    //       // Set the date.
    //       date.setYear(telTSDay.getYear());
    //       date.setMonth(telTSDay.getMonth());
    //       date.setDay(telTSDay.getDay());

    //       // Get the data.
    //       var value: number = telTSDay.getMeasValue();
    //       if ( !this.isTimeSeriesValueMissing(value, true) ) {
    //         ts.setDataValueTwo(date, value);
    //       }
    //     }
    //   }
    }
    // ---------------------------------------------------------------------------------------------------------------------------------------------------------------
    // else if (
    //   dataTypeReq.equalsIgnoreCase("WaterLevelDepth") ||
    //   dataTypeReq.equalsIgnoreCase("WaterLevelElev") ) {
    //   // Well structure time series.
    //   String wellid = locid;
      
    //   // Get the well.
    //   String wellRequest = this.getServiceRootURI() + "/groundwater/waterlevels/wells?format=json&wellid=" + wellid + this.getApiKeyStringDefault();
    //   if ( Message.isDebugOn ) {
    //     Message.printDebug ( dl, routine, "wellRequest: " + wellRequest );
    //   }
    //   JsonNode wellResults = jacksonToolkit.getJsonNodeFromWebServices(wellRequest).get(0);
      
    //   //System.out.println(wellRequest);
    //   Message.printStatus(2, routine, "Get wells from DWR REST API request url: " + wellRequest);
      
    //   WaterLevelsWell well = (WaterLevelsWell)jacksonToolkit.treeToValue(wellResults, WaterLevelsWell.class);
    //   if(well == null){
    //     return ts;
    //   }
      
    //   // Set the description.
    //   ts.setDescription(well.getWellName());
      
    //   // Get first and last date.
    //   //TODO @jurentie 06/21/2018 no units in request results.
    //   // First date = porStart.
    //   DateTime firstDate = new DateTime(DateTime.PRECISION_DAY);
    //   firstDate.setYear(well.getPorStart().getYear());
    //   firstDate.setMonth(well.getPorStart().getMonth());
    //   firstDate.setDay(well.getPorStart().getDay());
    //   ts.setDate1Original(firstDate);
      
    //   // Last date = porEnd.
    //   DateTime lastDate = new DateTime(DateTime.PRECISION_DAY);
    //   lastDate.setYear(well.getPorEnd().getYear());
    //   lastDate.setMonth(well.getPorEnd().getMonth());
    //   lastDate.setDay(well.getPorEnd().getDay());
    //   ts.setDate2Original(lastDate);
      
    //   // Units are ft based on API documentation.
    //   ts.setDataUnitsOriginal("ft");
    //   ts.setDataUnits("ft");
        
    //   // Set the properties:
    //   // - FIXME @jurentie 06/26/2018 - move add to genesis elsewhere.
    //   //ts.addToGenesis("read data from web services " + wellRequest + " and " + wellMeasurementRequest + ".");
    //   setTimeSeriesPropertiesForWell(ts, well);
    //   setCommentsForWell(ts, well);
      
    //   // Read the data.
    //   if ( readData ) {
    //     String wellMeasurementRequest = this.getServiceRootURI() + "/groundwater/waterlevels/wellmeasurements/" + wellid + "?format=json";
    //     if ( Message.isDebugOn ) {
    //       Message.printDebug ( dl, routine, "wellMeasurementRequest: " + wellMeasurementRequest );
    //     }
    //     // Add dates to limit query.
    //     if ( readStart != null ) {
    //       wellMeasurementRequest += "&min-measurementDate=" + URLEncoder.encode(String.format("%02d/%02d/%04d", readStart.getMonth(), readStart.getDay(), readStart.getYear()), "UTF-8");
    //     }
    //     if ( readEnd != null ) {
    //       wellMeasurementRequest += "&max-measurementDate=" + URLEncoder.encode(String.format("%02d/%02d/%04d", readEnd.getMonth(), readEnd.getDay(), readEnd.getYear()), "UTF-8");
    //     }
    //     // Add property without key for troubleshooting.
    //     ts.setProperty("dataUrl", wellMeasurementRequest);
    //     wellMeasurementRequest += this.getApiKeyStringDefault();
    //     JsonNode results = jacksonToolkit.getJsonNodeFromWebServices(wellMeasurementRequest);
    //     //System.out.println(wellMeasurementRequest);
    //     Message.printStatus(2, routine, "Retrieve well measurements from DWR REST API request url: " + wellMeasurementRequest);
        
    //     if ( (results == null) || (results.size() == 0) ) {
    //       return ts;
    //     }

    //     // Set start and end date for data for the allocated space.
    //     if ( readStart == null ) {
    //       WaterLevelsWellMeasurement wellMeasFirst = (WaterLevelsWellMeasurement)jacksonToolkit.treeToValue(results.get(0), WaterLevelsWellMeasurement.class);
    //       ts.setDate1(wellMeasFirst.getMeasurementDate());
    //     }
    //     else {
    //       ts.setDate1(readStart);
    //     }
    //     if ( readEnd == null ) {
    //       WaterLevelsWellMeasurement wellMeasLast = (WaterLevelsWellMeasurement)jacksonToolkit.treeToValue(results.get(results.size() - 1), WaterLevelsWellMeasurement.class);
    //       ts.setDate2(wellMeasLast.getMeasurementDate());
    //     }
    //     else {
    //       ts.setDate2(readEnd);
    //     }	
    //     // Allocate data space based on the dates.
    //     ts.allocateDataSpace();
      
    //     // Can create the date outside the loop because time series data are stored in an array.
    //     DateTime date = new DateTime(DateTime.PRECISION_DAY);
    //     for(int i = 0; i < results.size(); i++){
    //       WaterLevelsWellMeasurement wellMeas = (WaterLevelsWellMeasurement)jacksonToolkit.treeToValue(results.get(i), WaterLevelsWellMeasurement.class);
          
    //       // Set the date.
    //       date.setYear(wellMeas.getMeasurementDate().getYear());
    //       date.setMonth(wellMeas.getMeasurementDate().getMonth());
    //       date.setDay(wellMeas.getMeasurementDate().getDay());

    //       // Get the data.
    //       // TODO @jurentie 06/26/2018 - depthToWater or depthWaterBelowLandSurface.
    //       Double value;
    //       if ( dataTypeReq.equalsIgnoreCase("WaterLevelDepth") ) {
    //         value = wellMeas.getDepthToWater();
    //       }
    //       else {
    //         value = wellMeas.getElevationOfWater();
    //       }
          
    //       if ( !isTimeSeriesValueMissing(value, true) ) {
    //         ts.setDataValue(date, value);
    //       }
    //     }
    //   }
    // }
    else {
      // Unrecognized time series identifier.
      var message = "Unrecognized time series for identifier: \"" + tsidentString + "\".";
      console.warn(3, routine, message);
      throw new Error(message);
    }
    
    // Return the time series:
    // - may have returned before here if missing data or not reading data
      return ts;
  }

  /**
   * Read global data for caching purposes.
   * Calls the following methods:
   */
  private readGlobalData(): void {
    // TODO smalers 2022-03-17 tried lazy loading but UI is slow and gives bad user experience.
    // this.readClimateStationMeasTypes();
    // this.readCounties();
    // this.readCurrentInUseCodes();
    // this.readDiversionNotUsedCodes();
    // this.readDivRecObservationCodes();
    // this.readDivRecTypes();
    // this.readGroundwaterPublication();
    // this.readDesignatedBasins();
    // this.readManagementDistrict();
    // this.readPermitActionName();
    // TODO smalers 2022-03-17 tried lazy loading but UI is slow and gives bad user experience.
    // this.readSurfaceWaterStationMeasTypes();
    this.readTelemetryParams();
    // this.readWaterDistricts();
    // this.readWaterDivisions();
  }

  /**
   * Read telemetry station parameters from web services.
   * This is the list of available parameters that can be displayed in TSTool.
   */
  private readTelemetryParams(): void {
    var telemetryParamsRequest = this.getServiceRootURI() +
    "/referencetables/telemetryparams?format=json" + this.getApiKeyStringDefault();

    this.telemetryParamsList = [];

    this.commonService.getJSONData(telemetryParamsRequest).subscribe((results: any) => {
      var resultList: any[] = results.ResultList;

      for (let param of resultList) {
        this.telemetryParamsList.push(param)
      }
      this.paramsInitialized.next(true);
    });

    // JsonNode results = JacksonToolkit.getInstance().getJsonNodeFromWebServices(telemetryParamsRequest);
    // for (let i = 0; i < results.size(); i++){
    //   this.telemetryParamsList.push((ReferenceTablesTelemetryParams)JacksonToolkit.getInstance().treeToValue(results.get(i), ReferenceTablesTelemetryParams.class));
    // }

    // Also check for overlap between climate station and telemetry station data types,
    // which is used in some cases to differentiate uppercase 'EVAP' for telemetry station parameter and
    // mixed case 'Evap' climate station data type.
    this.checkClimateAndTelemetryStationTypes();
  }

  /**
   * Set the apiKey 
   * @param apiKey String that is the api key.
   */
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey ? apiKey : '';
  }

  /**
   * Set the service root URI for the data store.
   * @param serviceRootURI the service root URI for the data store.
   */
  public setServiceRootURI ( serviceRootURI: string ): void {
    this.__serviceRootURI = serviceRootURI;
  }

  /**
   * Set the properties of the time series if the datatype is telemetry station.
   * @param ts - The time series to add data to. Also used for retrieving data used in setting the properties.<br>
   * {@link RTi.TS.TS}
   * @param tel - The TelemetryStation object containing data used in setting the properties.<br>
   * {@link cdss.dmi.hydrobase.rest.dao.TelemetryStation}
   * @param telDataType the TelementryStationDataType to set properties.<br>
   * {@link cdss.dmi.hydrobase.rest.dao.TelemetryStationDataType}
   */
  // setTimeSeriesPropertiesForTelemetryStation (ts: TS, tel: TelemetryStation, telDataType: TelemetryStationDataType): void
  // {   // Use the same names as the database view columns, same order as view:
  //   // - all of the following are immutable objects other than DateTime
  //   // Get the precision for period.
  //   var precision = -1;
  //   var dt: DateTime = ts.getDate1();
  //   if ( dt !== null ) {
  //     precision = dt.getPrecision();
  //   }
  //   ts.setProperty("telemetrystation.div", tel.getDivision());
  //   ts.setProperty("telemetrystation.wd", tel.getWaterDistrict());
  //   ts.setProperty("telemetrystation.county", tel.getCounty());
  //   ts.setProperty("telemetrystation.stationName", tel.getStationName());
  //   ts.setProperty("telemetrystation.dataSourceAbbrev", tel.getDataSourceAbbrev());
  //   ts.setProperty("telemetrystation.dataSource", tel.getDataSource());
  //   ts.setProperty("telemetrystation.waterSource", tel.getWaterSource());
  //   ts.setProperty("telemetrystation.gnisId", tel.getGnisId());
  //   ts.setProperty("telemetrystation.streamMile", tel.getStreamMile());
  //   ts.setProperty("telemetrystation.abbrev", tel.getAbbrev());
  //   ts.setProperty("telemetrystation.usgsStationId", tel.getUsgsStationId());
  //   ts.setProperty("telemetrystation.stationStatus", tel.getStationStatus());
  //   ts.setProperty("telemetrystation.stationType", tel.getStationType());
  //   ts.setProperty("telemetrystation.structureType", tel.getStructureType());
  //   ts.setProperty("telemetrystation.measDateTime", (tel.getMeasDateTime() == null) ? null : new DateTime(tel.getMeasDateTime()));
  //   ts.setProperty("telemetrystation.parameter", tel.getParameter());
  //   ts.setProperty("telemetrystation.stage", tel.getStage());
  //   // Don't include measValue because it is confusing if the last measurement is not the same parameter:
  //   // - similarly for units
  //   //ts.setProperty("measValue", tel.getMeasValue());
  //   //ts.setProperty("units", tel.getUnits());
  //   ts.setProperty("telemetrystation.units", tel.getUnits());
  //   ts.setProperty("telemetrystation.flagA", tel.getFlagA());
  //   ts.setProperty("telemetrystation.flagB", tel.getFlagB());
  //   ts.setProperty("telemetrystation.contrArea", tel.getContrArea());
  //   ts.setProperty("telemetrystation.drainArea", tel.getDrainArea());
  //   ts.setProperty("telemetrystation.huc10", tel.getHuc10());
  //   ts.setProperty("telemetrystation.utmX", tel.getUtmX());
  //   ts.setProperty("telemetrystation.utmY", tel.getUtmY());
  //   ts.setProperty("telemetrystation.latitude", tel.getLatitude());
  //   ts.setProperty("telemetrystation.longitude", tel.getLongitude());
  //   ts.setProperty("telemetrystation.locationAccuracy", tel.getLocationAccuracy());
  //   ts.setProperty("telemetrystation.wdid", tel.getWdid());
  //   ts.setProperty("telemetrystation.modified", (tel.getModified() == null) ? null : new DateTime(tel.getModified()));
  //   ts.setProperty("telemetrystation.moreInformation", tel.getMoreInformation());
  //   dt = tel.getStationPorStart();
  //   if ( dt != null ) {
  //     dt = new DateTime(dt);
  //     if ( precision >= 0 ) {
  //       dt.setPrecisionOne(precision);
  //     }
  //   }
  //   ts.setProperty("telemetrystation.porStart", dt);
  //   dt = tel.getStationPorEnd();
  //   if ( dt != null ) {
  //     dt = new DateTime(dt);
  //     if ( precision >= 0 ) {
  //       dt.setPrecisionOne(precision);
  //     }
  //   }
  //   ts.setProperty("telemetrystation.porEnd", dt);
  //   ts.setProperty("telemetrystation.thirdParty", tel.getThirdParty());
  //   if ( telDataType != null ) {
  //     // Include data type properties, but only those not redundant with telemetry station.
  //     ts.setProperty("telemetrystationdatatypes.parameter", telDataType.getParameter());
  //     ts.setProperty("telemetrystationdatatypes.parameterPorStart", telDataType.getParameterPorStart());
  //     ts.setProperty("telemetrystationdatatypes.parameterPorEnd", telDataType.getParameterPorEnd());
  //     ts.setProperty("telemetrystationdatatypes.parameterUnit", telDataType.getParameterUnit());
  //   }
  // }

}
