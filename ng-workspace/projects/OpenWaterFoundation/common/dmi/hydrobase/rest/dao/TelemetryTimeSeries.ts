// TelemetryTimeSeries - data object for telemetry station time series record

import { TelTimeSeries } from "@OpenWaterFoundation/common/services";
import { DateTime }      from "@OpenWaterFoundation/common/util/time";

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
 * This class stores data for telemetry station time series record.
 * This class works for telemeteryTimeSeriesRaw, telemetryTimeSeriesHour, and telemeteryTimeSeriesDay<br>
 * https://dnrweb.state.co.us/DWR/DwrApiService/Help/Api/GET-api-v2-telemetrystations-telemetrystationdatatypes<br>
 * https://dnrweb.state.co.us/DWR/DwrApiService/Help/Api/GET-api-v2-telemetrystations-telemetrytimeseriesraw<br>
 * https://dnrweb.state.co.us/DWR/DwrApiService/Help/Api/GET-api-v2-telemetrystations-telemetrytimeserieshour<br>
 * https://dnrweb.state.co.us/DWR/DwrApiService/Help/Api/GET-api-v2-telemetrystations-telemetrytimeseriesday<br>
 */
export class TelemetryTimeSeries {


  constructor(private telemetryTimeSeries: TelTimeSeries) {
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
		return dateString;
	}

	/**
	 * Getters and setters for defined variables.
	 */
	getAbbrev(): string {
		return this.telemetryTimeSeries.abbrev;
	}
	
	getDay(): number {
		if(this.telemetryTimeSeries.measDateTime){
			return this.telemetryTimeSeries.measDateTime.getDay();
		}
		else{
			return this.telemetryTimeSeries.measDate.getDay();
		}
	}
	
	getFlagA(): string {
		return this.telemetryTimeSeries.flagA;
	}
	
	getFlagB(): string {
		return this.telemetryTimeSeries.flagB;
	}
	
	getHour(): number {
		if(this.telemetryTimeSeries.measDateTime){
			return this.telemetryTimeSeries.measDateTime.getHour();
		}
		else{
			return this.telemetryTimeSeries.measDate.getHour();
		}
	}
	
	getMeasCount(): number {
		return this.telemetryTimeSeries.measCount;
	}
	
	getMeasDate(): DateTime {
		return this.telemetryTimeSeries.measDate;
	}
	
	getMeasDateTime(): DateTime {
		return this.telemetryTimeSeries.measDateTime;
	}

	getMeasUnit(): string {
		return this.telemetryTimeSeries.measUnit;
	}
	
	getMeasValue(): number {
		return this.telemetryTimeSeries.measValue;
	}
	
	getMinute(): number {
		if (this.telemetryTimeSeries.measDateTime) {
			return this.telemetryTimeSeries.measDateTime.getMinute();
		}
		else {
			return this.telemetryTimeSeries.measDate.getMinute();
		}
	}
	
	getModified(): DateTime {
		return this.telemetryTimeSeries.modified;
	}
	
	getMonth(): number {
		if (this.telemetryTimeSeries.measDateTime) {
			return this.telemetryTimeSeries.measDateTime.getMonth();
		}
		else{
			return this.telemetryTimeSeries.measDate.getMonth();
		}
	}
	
	getParameter(): string {
		return this.telemetryTimeSeries.parameter;
	}
	
	getYear(): number {
		if (this.telemetryTimeSeries.measDateTime) {
			return this.telemetryTimeSeries.measDateTime.getYear();
		}
		else{
			return this.telemetryTimeSeries.measDate.getYear();
		}
	}

  initAllDateTimeAttributes(): void {
    if (typeof this.telemetryTimeSeries.measDate === 'string') {
      this.telemetryTimeSeries.measDate = DateTime.parse(this.telemetryTimeSeries.measDate);
    } else if (typeof this.telemetryTimeSeries.measDateTime === 'string') {
      this.telemetryTimeSeries.measDateTime = DateTime.parse(this.telemetryTimeSeries.measDateTime);
    }

    if (typeof this.telemetryTimeSeries.modified === 'string') {
			this.telemetryTimeSeries.modified = this.formatToRecognized(this.telemetryTimeSeries.modified);
      this.telemetryTimeSeries.modified = DateTime.parse(this.telemetryTimeSeries.modified);
    }
  }
	
	/**
	 * To string method for testing purposes:
	 * Variables defined in order of how they are returned in a json format from * web services.
	 */
	toString(): string {
		return "TelemetryTimeSeries: {\n" +
		"  abbrev: " + this.telemetryTimeSeries.abbrev + ",\n" +
    "  parameter: " + this.telemetryTimeSeries.parameter + ",\n" +
		"  measDate: " + this.telemetryTimeSeries.measDate + ",\n" +
		"  measDateTime: " + this.telemetryTimeSeries.measDateTime + ",\n" +
    "  measValue: " + this.telemetryTimeSeries.measValue + ",\n" +
    "  measUnit: " + this.telemetryTimeSeries.measUnit + ",\n" +
    "  flagA: " + this.telemetryTimeSeries.flagA + ",\n" +
    "  flagB: " + this.telemetryTimeSeries.flagB + ",\n" +
    "  measCount: " + this.telemetryTimeSeries.measCount + ",\n" +
    "  modified: " + this.telemetryTimeSeries.modified + ",\n" +
    "}\n";
	}

}