// TelemetryStationDataType - data object for telemetry station data types

import { DateTime }    from "@OpenWaterFoundation/common/util/time";
import { TimeToolkit } from "../dto/TimeToolkit";

/* NoticeStart
CDSS HydroBase REST Web Services Java Library
CDSS HydroBase REST Web Services Java Library is a part of Colorado's Decision Support Systems (CDSS)
Copyright (C) 2018-2022 Colorado Department of Natural Resources
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
 * This class stores a DWR web services telemetry station data type object.
 * https://dnrweb.state.co.us/DWR/DwrApiService/Help/Api/GET-api-v2-telemetrystations-telemetrystationdatatypes
 */
export class TelemetryStationDataType {
	
	/**
	 * Variables declared in alphabetical order.
	 * Documentation copied from web services.
	 */
	
	/**
	 * Abbreviation
	 */
	private abbrev: string;
	
	/**
	 * Contributing area
	 */
	private contrArea: number;
	
	/**
	 * County where the station is located
	 */
	private county: string;
	
	/**
	 * Primary source/provider of well measurement data
	 */
	private dataSource: string;
	
	/**
	 * Data source abbreviation
	 */
	private dataSourceAbbrev: string;
	
	/**
	 * DWR Water Division
	 */
	private division: number;
	
	/**
	 * Drainage Area
	 */
	private drainArea: number;
	
	/**
	 * National Hydrographic Dataset stream identifier
	 */
	private gnisId: string;
	
	/**
	 * HUC 10
	 */
	private huc10: string;
	
	/**
	 * Latitude value in decimal degrees
	 */
	private latdecdeg: number;
	
	/**
	 * Accuracy of location coordinates
	 */
	private locationAccuracy: string;
	
	/**
	 * Longitude in decimal degrees
	 */
	private longdecdeg: number;
	
	/**
	 * Last date time that this record was modified in the DWR database
	 */
	private modified: DateTime;
	
	/**
	 * Parameter
	 */
	private parameter: string;
	
	/**
	 * Period of record end.
	 */
	private parameterPorEnd: DateTime;
	
	/**
	 * Period of record start.
	 */
	private parameterPorStart: DateTime;
	
	/**
	 * Unit for given Parameter
	 */
	private parameterUnit: string;
	
	/**
	 * Station Name
	 */
	private stationName: string;
	
	/**
	 * Station Status
	 */
	private stationStatus: string;
	
	/**
	 * Station Type
	 */
	private stationType: string;
	
	/**
	 * Distance in miles to the confluence with the next downstream 
	 * water source (or distance to state line)
	 */
	private streamMile: number;
	
	/**
	 * Type of structure
	 */
	private structureType: string;
	
	/**
	 * Whether third party data.
	 */
	private thirdParty: boolean;
	
	/**
	 * USGS Station ID
	 */
	private usgsStationId: string;
	
	/**
	 * The x (Easting) component of the Universal Transverse Mercator system. 
	 * (Zone 12, NAD83 datum)
	 */
	private utmX: number;
	
	/**
	 * The y (Northing) component of the Universal Transverse Mercator system. 
	 * (Zone 12, NAD83 datum)
	 */
	private utmY: number;
	/**
	 * Added variable for use in other places in the code. 
	 * Not originally from web services
	 * @jurentie
	 */
	private timeStep: string;
	
	/**
	 * DWR Water District
	 */
	private waterDistrict: number;
	
	/**
	 * Name of the water source as specified in the court case
	 */
	private waterSource: string;
	
	/**
	 * DWR unique structure identifier
	 */
	private wdid: string;
	
	/**
	 * Getters and setters for defined variables
	 */
	public getAbbrev(): string {
		return this.abbrev;
	}
	public getContrArea(): number {
		return this.contrArea;
	}
	
	public getCounty(): string {
		return this.county;
	}
	public getDataSource(): string {
		return this.dataSource;
	}
	
	public getDataSourceAbbrev(): string {
		return this.dataSourceAbbrev;
	}
	public getDivision(): number {
		return this.division;
	}
	
	public getDrainArea(): number {
		return this.drainArea;
	}
	public getGnisId(): string {
		return this.gnisId;
	}
	
	public getHuc10(): string {
		return this.huc10;
	}
	public getLatdecdeg(): number {
		return this.latdecdeg;
	}
	
	public getLocationAccuracy(): string {
		return this.locationAccuracy;
	}
	public getLongdecdeg(): number {
		return this.longdecdeg;
	}
	
	public getModified(): DateTime {
		return this.modified;
	}
	public getParameter(): string {
		return this.parameter;
	}
	
	public getParameterPorEnd(): DateTime {
		return this.parameterPorEnd;
	}

	public getParameterPorStart(): DateTime {
		return this.parameterPorStart;
	}
	
	public getParameterUnit(): string {
		return this.parameterUnit;
	}
	public getStationName(): string {
		return this.stationName;
	}

	public getStationStatus(): string {
		return this.stationStatus;
	}
	public getStationType(): string {
		return this.stationType;
	}
	
	public getStreamMile(): number {
		return this.streamMile;
	}
	public getStructureType(): string {
		return this.structureType;
	}
	
	public getTimeStep(): string {
		return this.timeStep;
	}
	public getThirdParty(): boolean {
		return this.thirdParty;
	}
	public getUsgsStationId(): string {
		return this.usgsStationId;
	}
	
	public getUtmX(): number {
		return this.utmX;
	}
	public getUtmY(): number {
		return this.utmY;
	}
	
	public getWaterDistrict(): number {
		return this.waterDistrict;
	}
	public getWaterSource(): string {
		return this.waterSource;
	}
	
	public getWdid(): string {
		return this.wdid;
	}
	public setAbbrev(abbrev: string): void {
		this.abbrev = abbrev;
	}
	
	public setContrArea(contrArea: number): void {
		this.contrArea = contrArea;
	}
	public setCounty(county: string): void {
		this.county = county;
	}
	
	public setDataSource(dataSource: string): void {
		this.dataSource = dataSource;
	}
	public setDataSourceAbbrev(dataSourceAbbrev: string): void {
		this.dataSourceAbbrev = dataSourceAbbrev;
	}
	
	public setDivision(division: number): void {
		this.division = division;
	}
	public setDrainArea(drainArea: number): void {
		this.drainArea = drainArea;
	}
	
	public setGnisId(gnisId: string): void {
		this.gnisId = gnisId;
	}
	public setHuc10(huc10: string): void {
		this.huc10 = huc10;
	}
	
	public setLatdecdeg(latdecdeg: number): void {
		this.latdecdeg = latdecdeg;
	}
	public setLocationAccuracy(locationAccuracy: string): void {
		this.locationAccuracy = locationAccuracy;
	}
	
	public setLongdecdeg(longdecdeg: number): void {
		this.longdecdeg = longdecdeg;
	}
	public setModified(modified: string): void {
		this.modified = TimeToolkit.getInstance().toDateTime(modified, false);
	}
	
	public setParameter(parameter: string): void {
		this.parameter = parameter;
	}
	public setStationName(stationName: string): void {
		this.stationName = stationName;
	}
	public setParameterPorEnd(parameterPorEnd: string): void {
		this.parameterPorEnd = TimeToolkit.getInstance().toDateTime(parameterPorEnd, false);
	}
	public setParameterPorStart(parameterPorStart: string): void {
		this.parameterPorStart = TimeToolkit.getInstance().toDateTime(parameterPorStart, false);
	}
	public setParameterUnit(parameterUnit: string): void {
		this.parameterUnit = parameterUnit;
	}
	
	public setStationStatus(stationStatus: string): void {
		this.stationStatus = stationStatus;
	}
	
	public setStationType(stationType: string): void {
		this.stationType = stationType;
	}
	public setStreamMile(streamMile: number): void {
		this.streamMile = streamMile;
	}
	
	public setStructureType(structureType: string): void {
		this.structureType = structureType;
	}
	public setThirdParty(thirdParty: boolean): void {
		this.thirdParty = thirdParty;
	}
	public setTimeStep(timeStep: string): void {
		this.timeStep = timeStep;
	}
	
	public setUsgsStationId(usgsStationId: string): void {
		this.usgsStationId = usgsStationId;
	}
	public setUtmX(utmX: number): void {
		this.utmX = utmX;
	}
	
	public setUtmY(utmY: number): void {
		this.utmY = utmY;
	}
	public setWaterDistrict(waterDistrict: number): void {
		this.waterDistrict = waterDistrict;
	}
	
	public setWaterSource(waterSource: string): void {
		this.waterSource = waterSource;
	}
	public setWdid(wdid: string): void {
		this.wdid = wdid;
	}
	
	/**
	 * To string method for testing purposes:
	 * Variables defined in order of how they are returned in a json format from
	 * web services
	 */
	toString(): string {
		return "TelemetryStationDataType: [ division: " + this.division +
    ", waterDistrict: " + this.waterDistrict + 
		", county: " + this.county +
    ", stationName: " + this.stationName +
    ", dataSourceAbbrev: " + this.dataSourceAbbrev + 
		", dataSource: " + this.dataSource +
    ", abbrev: " + this.abbrev +
    ", wdid: " + this.wdid +
    ", usgsStationId: " + this.usgsStationId +
    ", stationStatus: " + this.stationStatus +
    ", stationType: " + this.stationType +
    ", waterSource: " + this.waterSource +
    ", gnisId: " + this.gnisId + 
		", streamMile: " + this.streamMile +
    ", structureType: " + this.structureType +
    ", parameter: " + this.parameter + 
		", parameterUnit: " + this.parameterUnit +
    ", contrArea: " + this.contrArea +
    ", drainArea: " + this.drainArea + 
		", huc10: " + this.huc10 +
    ", utmX: " + this.utmX +
    ", utmY: " + this.utmY +
    ", latdecdeg: " + this.latdecdeg +
    ", longdecdeg: " + this.longdecdeg +
    ", locationAccuracy: " + this.locationAccuracy +
    ", modified: " + this.modified + " ]\n";
	}

}