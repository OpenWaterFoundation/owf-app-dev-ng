// TelemetryStation - data object for telemetry station

import { DateTime }    from "@OpenWaterFoundation/common/util/time";
import * as IM         from '@OpenWaterFoundation/common/services';
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
 * https://dwr.state.co.us/Rest/GET/Help/Api/GET-api-v2-telemetrystations-telemetrystation
 * @author jurentie
 *
 */
/*
 * Ignore any properties defined after defining this class.
 * If properties are added that are necessary to data processing these can be added,
 * but for now ignore anything that is new so as to not break the code.
 */
export class TelemetryStation {


	constructor(private telemetryStation: IM.TelStation) {}
	
	/**
	 * Getters of all Telemetry Station variables.
	 */
	getAbbrev() {
		return this.telemetryStation.abbrev;
	}

	getContrArea() {
		return this.telemetryStation.contrArea;
	}

	getCounty() {
		return this.telemetryStation.county;
	}

	getDataSource() {
		return this.telemetryStation.dataSource;
	}

	getDataSourceAbbrev() {
		return this.telemetryStation.dataSourceAbbrev;
	}

	getDivision() {
		return this.telemetryStation.division;
	}

	getDrainArea() {
		return this.telemetryStation.drainArea;
	}

	getFlagA() {
		return this.telemetryStation.flagA;
	}

	getFlagB() {
		return this.telemetryStation.flagB;
	}

	getGnisId() {
		return this.telemetryStation.gnisId;
	}

	getHuc10() {
		return this.telemetryStation.huc10;
	}

	getLatitude() {
		return this.telemetryStation.latitude;
	}

	getLocationAccuracy() {
		return this.telemetryStation.locationAccuracy;
	}

	getLongitude() {
		return this.telemetryStation.longitude;
	}

	getMeasDateTime(): DateTime {
		return this.telemetryStation.measDateTime;
	}

	getMeasValue() {
		return this.telemetryStation.measValue;
	}

	getModified(): DateTime {
		return this.telemetryStation.modified;
	}

	getMoreInformation() {
		return this.telemetryStation.moreInformation;
	}

	getParameter() {
		return this.telemetryStation.parameter;
	}

	getStage() {
		return this.telemetryStation.stage;
	}

	getStationName() {
		return this.telemetryStation.stationName;
	}

	getStationPorEnd(): DateTime {
		return this.telemetryStation.stationPorEnd;
	}

	getStationPorStart(): DateTime {
		return this.telemetryStation.stationPorStart;
	}

	getStationStatus() {
		return this.telemetryStation.stationStatus;
	}

	getStationType() {
		return this.telemetryStation.stationType;
	}

	getStreamMile() {
		return this.telemetryStation.streamMile;
	}

	getStructureType() {
		return this.telemetryStation.structureType;
	}

	getThirdParty() {
		return this.telemetryStation.thirdParty;
	}

	getUnits() {
		return this.telemetryStation.units;
	}

	getUsgsStationId() {
		return this.telemetryStation.usgsStationId;
	}

	getUtmX() {
		return this.telemetryStation.utmX;
	}

	getUtmY() {
		return this.telemetryStation.utmY;
	}

	getWaterDistrict() {
		return this.telemetryStation.waterDistrict;
	}

	getWaterSource() {
		return this.telemetryStation.waterSource;
	}

	getWdid() {
		return this.telemetryStation.wdid;
	}

	/**
	 * To string method for testing purposes:
	 * Variables defined in order of how they are returned in a json format from
	 * web services
	 */
	toString(){
		return "TelemetryStation: {\n" +
		"  div: " + this.telemetryStation.division + ",\n" +
		"  wd: " + this.telemetryStation.waterDistrict + ",\n" +
		"  county: " + this.telemetryStation.county + ",\n" +
		"  stationName: " + this.telemetryStation.stationName + ",\n" +
		"  dataSource: " + this.telemetryStation.dataSource + ",\n" +
		"  abbrev: " + this.telemetryStation.abbrev + ",\n" +
		"  usgsStationId: " + this.telemetryStation.usgsStationId + ",\n" +
		"  stationStatus: " + this.telemetryStation.stationStatus + ",\n" +
		"  stationType: " + this.telemetryStation.stationType + ",\n" +
		"  strcutureType: " + this.telemetryStation.structureType + ",\n" +
		"  measDateTime: " + this.telemetryStation.measDateTime + ",\n" +
		"  parameter: " + this.telemetryStation.parameter + ",\n" +
		"  stage: " + this.telemetryStation.stage + ",\n" +
		"  measValue: " + this.telemetryStation.measValue + ",\n" + 
		"  units: " + this.telemetryStation.units + ",\n" +
		"  flagA" + this.telemetryStation.flagA + ",\n" +
		"  flagB: " + this.telemetryStation.flagB + ",\n" +
		"  contrArea: " + this.telemetryStation.contrArea + ",\n" +
		"  drainArea: " + this.telemetryStation.drainArea + ",\n" +
		"  huc10: " + this.telemetryStation.huc10 + ",\n" +
		"  utmX: " + this.telemetryStation.utmX + ",\n" +
		"  utmY: " + this.telemetryStation.utmY + ",\n" +
		"  latitude: " + this.telemetryStation.latitude + ",\n" +
		"  longitude: " + this.telemetryStation.longitude + ",\n" +
		"  locationAccuracy: " + this.telemetryStation.locationAccuracy + ",\n" +
		"  wdid: " + this.telemetryStation.wdid + ",\n" +
		"  modified: " + this.telemetryStation.modified + ",\n" +
		"  moreInformation: " + this.telemetryStation.moreInformation + ",\n" +
		"}\n";
	}

}