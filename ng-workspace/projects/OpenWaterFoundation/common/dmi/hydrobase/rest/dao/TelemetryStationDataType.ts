// TelemetryStationDataType - data object for telemetry station data types

import { DateTime }    from "@OpenWaterFoundation/common/util/time";
import * as IM         from '@OpenWaterFoundation/common/services';

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
 * https://dwr.state.co.us/Rest/GET/Help/Api/GET-api-v2-telemetrystations-telemetrystationdatatypes
 */
export class TelemetryStationDataType {


  constructor(private telemetryStationDateType: IM.TelStationDataType) {
		this.initAllDateTimeAttributes();
  }


	/**
	 * Appends zeros as a string to a date string so that it is in a format that the
	 * Java converted code can handle. For the modified attribute.
	 * @param dateString 
	 */
	 formatToRecognized(dateString: string): string {
		if (dateString.includes('.')) {
			return dateString.substring(0, dateString.lastIndexOf('.'));
		}
		if (dateString.includes('-')) {
			return dateString.substring(0, dateString.lastIndexOf('-'));
		}
		return dateString;
	}
	
	/**
	 * Getters and setters for defined variables
	 */
	getAbbrev(): string {
		return this.telemetryStationDateType.abbrev;
	}
	getContrArea(): number {
		return this.telemetryStationDateType.contrArea;
	}
	
	getCounty(): string {
		return this.telemetryStationDateType.county;
	}
	getDataSource(): string {
		return this.telemetryStationDateType.dataSource;
	}
	
	getDataSourceAbbrev(): string {
		return this.telemetryStationDateType.dataSourceAbbrev;
	}
	getDivision(): number {
		return this.telemetryStationDateType.division;
	}
	
	getDrainArea(): number {
		return this.telemetryStationDateType.drainArea;
	}
	getGnisId(): string {
		return this.telemetryStationDateType.gnisId;
	}
	
	getHuc10(): string {
		return this.telemetryStationDateType.huc10;
	}
	getLatdecdeg(): number {
		return this.telemetryStationDateType.latdecdeg;
	}
	
	getLocationAccuracy(): string {
		return this.telemetryStationDateType.locationAccuracy;
	}
	getLongdecdeg(): number {
		return this.telemetryStationDateType.longdecdeg;
	}
	
	getModified(): DateTime {
		return this.telemetryStationDateType.modified;
	}
	getParameter(): string {
		return this.telemetryStationDateType.parameter;
	}
	
	getParameterPorEnd(): DateTime {
		return this.telemetryStationDateType.parameterPorEnd;
	}

	getParameterPorStart(): DateTime {
		return this.telemetryStationDateType.parameterPorStart;
	}
	
	getParameterUnit(): string {
		return this.telemetryStationDateType.parameterUnit;
	}
	getStationName(): string {
		return this.telemetryStationDateType.stationName;
	}

	getStationStatus(): string {
		return this.telemetryStationDateType.stationStatus;
	}
	getStationType(): string {
		return this.telemetryStationDateType.stationType;
	}
	
	getStreamMile(): number {
		return this.telemetryStationDateType.streamMile;
	}
	getStructureType(): string {
		return this.telemetryStationDateType.structureType;
	}
	
	getTimeStep(): string {
		return this.telemetryStationDateType.timeStep;
	}
	getThirdParty(): boolean {
		return this.telemetryStationDateType.thirdParty;
	}
	getUsgsStationId(): string {
		return this.telemetryStationDateType.usgsStationId;
	}
	
	getUtmX(): number {
		return this.telemetryStationDateType.utmX;
	}
	getUtmY(): number {
		return this.telemetryStationDateType.utmY;
	}
	
	getWaterDistrict(): number {
		return this.telemetryStationDateType.waterDistrict;
	}
	getWaterSource(): string {
		return this.telemetryStationDateType.waterSource;
	}
	
	getWdid(): string {
		return this.telemetryStationDateType.wdid;
	}

	initAllDateTimeAttributes(): void {
    if (typeof this.telemetryStationDateType.modified === 'string') {
      this.telemetryStationDateType.modified = this.formatToRecognized(this.telemetryStationDateType.modified);
      this.telemetryStationDateType.modified = DateTime.parse(this.telemetryStationDateType.modified);
    }

		if (typeof this.telemetryStationDateType.parameterPorStart === 'string') {
			this.telemetryStationDateType.parameterPorStart = DateTime.parse(this.telemetryStationDateType.parameterPorStart);
		}

		if (typeof this.telemetryStationDateType.parameterPorEnd === 'string') {
			this.telemetryStationDateType.parameterPorEnd = DateTime.parse(this.telemetryStationDateType.parameterPorEnd);
		}
  }
	
	/**
	 * To string method for testing purposes:
	 * Variables defined in order of how they are returned in a json format from
	 * web services
	 */
	toString(): string {
		return "TelemetryStationDataType: { division: " + this.telemetryStationDateType.division +
    ", waterDistrict: " + this.telemetryStationDateType.waterDistrict + 
		", county: " + this.telemetryStationDateType.county +
    ", stationName: " + this.telemetryStationDateType.stationName +
    ", dataSourceAbbrev: " + this.telemetryStationDateType.dataSourceAbbrev + 
		", dataSource: " + this.telemetryStationDateType.dataSource +
    ", abbrev: " + this.telemetryStationDateType.abbrev +
    ", wdid: " + this.telemetryStationDateType.wdid +
    ", usgsStationId: " + this.telemetryStationDateType.usgsStationId +
    ", stationStatus: " + this.telemetryStationDateType.stationStatus +
    ", stationType: " + this.telemetryStationDateType.stationType +
    ", waterSource: " + this.telemetryStationDateType.waterSource +
    ", gnisId: " + this.telemetryStationDateType.gnisId + 
		", streamMile: " + this.telemetryStationDateType.streamMile +
    ", structureType: " + this.telemetryStationDateType.structureType +
    ", parameter: " + this.telemetryStationDateType.parameter + 
		", parameterUnit: " + this.telemetryStationDateType.parameterUnit +
    ", contrArea: " + this.telemetryStationDateType.contrArea +
    ", drainArea: " + this.telemetryStationDateType.drainArea + 
		", huc10: " + this.telemetryStationDateType.huc10 +
    ", utmX: " + this.telemetryStationDateType.utmX +
    ", utmY: " + this.telemetryStationDateType.utmY +
    ", latdecdeg: " + this.telemetryStationDateType.latdecdeg +
    ", longdecdeg: " + this.telemetryStationDateType.longdecdeg +
    ", locationAccuracy: " + this.telemetryStationDateType.locationAccuracy +
    ", modified: " + this.telemetryStationDateType.modified + " }\n";
	}

}