// TelemetryStation - data object for telemetry station

import { DateTime }    from "@OpenWaterFoundation/common/util/time";
import { TimeToolkit } from "../dto/TimeToolkit";

/* NoticeStart
CDSS HydroBase REST Web Services Java Library
CDSS HydroBase REST Web Services Java Library is a part of Colorado's Decision Support Systems (CDSS)
Copyright (C) 2018-2019 Colorado Department of Natural Resources
CDSS HydroBase REST Web Services Java Library is free software:  you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    CDSS HydroBase REST Web Services Java Library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with CDSS HydroBase REST Web Services Java Library.  If not, see <https://www.gnu.org/licenses/>.
NoticeEnd */

/**
 * This class acts as a way to convert results from DWR web services
 * to a plain old java object, for means of processing the data 
 * returned.<br>
 * https://dnrweb.state.co.us/DWR/DwrApiService/Help/Api/GET-api-v2-telemetrystations-telemetrystation
 * @author jurentie
 *
 */
/*
 * Ignore any properties defined after defining this class.
 * If properties are added that are necessary to data processing these can be added,
 * but for now ignore anything that is new so as to not break the code.
 */
export class TelemetryStation {
	
	/**
	 * Variables declared in alphabetical order.
	 * Documentation copied from web services.
	 */
	
	/** 
	 * Abbreviation 
	 */
	private abbrev;

	/** 
	 * Contributing Area 
	 */
	private contrArea;

	/** 
	 * County where the well is located 
	 */
	private county;

	/** 
	 * Full data source description 
	 */
	private dataSource;

	/**
	 * Primary source/provider of well measurement data
	 */
	private dataSourceAbbrev;
	
	/** 
	 * DWR Water Division 
	 */
	private division;
	
	/** 
	 * Drainage Area 
	 */
	private drainArea;

	/** 
	 * Flag A 
	 */
	private flagA;

	/** 
	 * Flag B 
	 */
	private flagB;

	/**
	 * National Hydrographic Dataset stream identifier
	 */
	private gnisId;

	/** 
	 * HUC 10 
	 */
	private huc10;

	/** 
	 * Latitude (decimal degrees) 
	 */
	private latitude;

	/** 
	 * Accuracy of location coordinates 
	 */
	private locationAccuracy;

	/** 
	 * Longitude (decimal degrees) 
	 */
	private longitude;

	/** 
	 * Measurement Date Time 
	 */
	private measDateTime: DateTime;

	/** 
	 * Measurement Value 
	 */
	private measValue: DateTime;

	/**
	 * Last date time that this record was modified in the DWR database
	 */
	private modified: DateTime;

	/** 
	 * Hyperlink to additional details 
	 */
	private moreInformation;

	/** 
	 * Parameter 
	 */
	private parameter;

	/** 
	 * Recorded stage (feet) 
	 */
	private stage;

	/** 
	 * Station Name 
	 */
	private stationName;

	/**
	 * Station of record end.
	 */
	private stationPorEnd: DateTime;
	
	/**
	 * Station of record start.
	 */
	private stationPorStart: DateTime;
	
	/** 
	 * Station Status 
	 */
	private stationStatus;

	/** 
	 * Station Type 
	 */
	private stationType;

	/**
	 * Distance in miles to the confluence with the next downstream 
	 * water source (or distance to state line)
	 */
	private streamMile;

	/** 
	 * Type of structure 
	 */
	private structureType;

	/**
	 * Whether third party data.
	 */
	private thirdParty;
	
	/** 
	 * Units of measure 
	 */
	private units;

	/** 
	 * USGS Station ID 
	 */
	private usgsStationId;

	/** 
	 * The x (Easting) component of the Universal Transverse Mercator system 
	 * (Zone 12, NAD83 datum) 
	 */
	private utmX;
	
	/** 
	 * The y (Northing) component of the Universal Transverse Mercator system 
	 * (Zone 12, NAD83 datum) 
	 */
	private utmY;
	
	/** 
	 * DWR Water District 
	 */
	private waterDistrict;

	/** 
	 * Water Source 
	 */
	private waterSource;

	/** 
	 * DWR unique structure identifier
	 */
	private wdid;
	
	/**
	 * Getters and setters of defined variables.
	 */
	public getAbbrev() {
		return this.abbrev;
	}

	public getContrArea() {
		return this.contrArea;
	}

	public getCounty() {
		return this.county;
	}

	public getDataSource() {
		return this.dataSource;
	}

	public getDataSourceAbbrev() {
		return this.dataSourceAbbrev;
	}

	public getDivision() {
		return this.division;
	}

	public getDrainArea() {
		return this.drainArea;
	}

	public getFlagA() {
		return this.flagA;
	}

	public getFlagB() {
		return this.flagB;
	}

	public getGnisId() {
		return this.gnisId;
	}

	public getHuc10() {
		return this.huc10;
	}

	public getLatitude() {
		return this.latitude;
	}

	public getLocationAccuracy() {
		return this.locationAccuracy;
	}

	public getLongitude() {
		return this.longitude;
	}

	public getMeasDateTime(): DateTime {
		return this.measDateTime;
	}

	public getMeasValue() {
		return this.measValue;
	}

	public getModified(): DateTime {
		return this.modified;
	}

	public getMoreInformation() {
		return this.moreInformation;
	}

	public getParameter() {
		return this.parameter;
	}

	public getStage() {
		return this.stage;
	}

	public getStationName() {
		return this.stationName;
	}

	public getStationPorEnd(): DateTime {
		return this.stationPorEnd;
	}

	public getStationPorStart(): DateTime {
		return this.stationPorStart;
	}

	public getStationStatus() {
		return this.stationStatus;
	}

	public getStationType() {
		return this.stationType;
	}

	public getStreamMile() {
		return this.streamMile;
	}

	public getStructureType() {
		return this.structureType;
	}

	public getThirdParty() {
		return this.thirdParty;
	}

	public getUnits() {
		return this.units;
	}

	public getUsgsStationId() {
		return this.usgsStationId;
	}

	public getUtmX() {
		return this.utmX;
	}

	public getUtmY() {
		return this.utmY;
	}

	public getWaterDistrict() {
		return this.waterDistrict;
	}

	public getWaterSource() {
		return this.waterSource;
	}

	public getWdid() {
		return this.wdid;
	}

	public setAbbrev(abbrev) {
		this.abbrev = abbrev;
	}

	public setContrArea(contrArea) {
		this.contrArea = contrArea;
	}

	public setCounty(county) {
		this.county = county;
	}

	public setDataSource(dataSource) {
		this.dataSource = dataSource;
	}

	public setDataSourceAbbrev(dataSourceAbbrev) {
		this.dataSourceAbbrev = dataSourceAbbrev;
	}

	public setDivision(div) {
		this.division = div;
	}

	public setDrainArea(drainArea) {
		this.drainArea = drainArea;
	}

	public setFlagA(flagA) {
		this.flagA = flagA;
	}

	public setFlagB(flagB) {
		this.flagB = flagB;
	}

	public setGnisId(gnisId) {
		this.gnisId = gnisId;
	}
	
	public setHuc10(huc10) {
		this.huc10 = huc10;
	}

	public setLatitude(latitude) {
		this.latitude = latitude;
	}

	public setLocationAccuracy(locationAccuracy) {
		this.locationAccuracy = locationAccuracy;
	}

	public setLongitude(longitude) {
		this.longitude = longitude;
	}

	public setMeasDateTime(measDateTime) {
		this.measDateTime = TimeToolkit.getInstance().toDateTime(measDateTime, true);
	}

	public setMeasValue(measValue) {
		this.measValue = measValue;
	}

	public setModified(modified) {
		this.modified = TimeToolkit.getInstance().toDateTime(modified, true);
	}

	public setMoreInformation(moreInformation) {
		this.moreInformation = moreInformation;
	}

	public setParameter(parameter) {
		this.parameter = parameter;
	}

	public setStage(stage) {
		this.stage = stage;
	}

	public setStationName(stationName) {
		this.stationName = stationName;
	}

	public setStationPorEnd(stationPorEnd) {
		this.stationPorEnd = TimeToolkit.getInstance().toDateTime(stationPorEnd, false);
	}
	public setStationPorStart(stationPorStart) {
		this.stationPorStart = TimeToolkit.getInstance().toDateTime(stationPorStart, false);
	}

	public setStationStatus(stationStatus) {
		this.stationStatus = stationStatus;
	}

	public setStationType(stationType) {
		this.stationType = stationType;
	}

	public setStreamMile(streamMile) {
		this.streamMile = streamMile;
	}

	public setStructureType(structureType) {
		this.structureType = structureType;
	}

	public setThirdParty(thirdParty) {
		this.thirdParty = thirdParty;
	}

	public setUnits(units) {
		this.units = units;
	}

	public setUsgsStationId(usgsStationId) {
		this.usgsStationId = usgsStationId;
	}

	public setUtmX(utmX) {
		this.utmX = utmX;
	}

	public setUtmY(utmY) {
		this.utmY = utmY;
	}

	public setWaterDistrict(waterDistrict) {
		this.waterDistrict = waterDistrict;
	}

	public setWaterSource(waterSource) {
		this.waterSource = waterSource;
	}

	public setWdid(wdid) {
		this.wdid = wdid;
	}

	/**
	 * To string method for testing purposes:
	 * Variables defined in order of how they are returned in a json format from
	 * web services
	 */
	public toString(){
		return "TelemetryStation: [ div: " + this.division + ", wd: " + this.waterDistrict + ", county: " + this.county + ", stationName: " +
    this.stationName + ", dataSource: " + this.dataSource + ", abbrev: " + this.abbrev + ", usgsStationId: " +
    this.usgsStationId + ", stationStatus: " + this.stationStatus + ", stationType: " + this.stationType + 
    ", strcutureType: " + this.structureType + ", measDateTime: " + this.measDateTime + ", parameter: " + 
    this.parameter + ", stage: " + this.stage + ", measValue: " + this.measValue + ", units: " + this.units + ", flagA" + 
    this.flagA + ", flagB: " + this.flagB + ", contrArea: " + this.contrArea + ", drainArea: " + this.drainArea + 
    ", huc10: " + this.huc10 + ", utmX: " + this.utmX + ", utmY: " + this.utmY + ", latitude: " + this.latitude + 
    ", longitude: " + this.longitude + ", locationAccuracy: " + this.locationAccuracy + ", wdid: " + this.wdid + 
    ", modified: " + this.modified + ", moreInformation: " + this.moreInformation + " ]\n";
	}

}