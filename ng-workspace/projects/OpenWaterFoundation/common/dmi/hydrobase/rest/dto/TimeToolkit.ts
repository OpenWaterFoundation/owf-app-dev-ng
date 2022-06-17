// TimeToolkit - this class assists in converting a string to either DateTime or LocalDateTime Object

import { DateTime } from "@OpenWaterFoundation/common/util/time";

import { add,
          format,
          isEqual,
          parseISO }       from 'date-fns';

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
 * This class assists in converting a string to either DateTime or LocalDateTime Object.
 * @author jurentie
 *
 */
export class TimeToolkit {
	
	/**
	 * TimeToolkit used for lazy initialization of a singleton class
	 */
	private static instance: TimeToolkit;
	
	public TimeToolkit(){}
	
	/**
	 * Lazy initialization of a singleton class instance
	 * @return instance of TimeToolkit class.
	 */
	public static getInstance(): TimeToolkit {
		if (!TimeToolkit.instance) { TimeToolkit.instance = new TimeToolkit(); }
		return TimeToolkit.instance;
	}
	
	//TODO @jurentie not handling time zone 09-08-2018
	/**
	 * Converts a string to DateTime object. 
	 * @param s - date in String format.
	 * @param zoned - if True there is a time zone extension on the end of the date string.
	 * If False there is no time zone extension.
	 * @return DateTime object 
	 */
	public toDateTime(s: string, zoned: boolean): DateTime {
		if (s === null || s === "" || s === "N/A") {
			return null;
		}

    var localDateTime = new Date(parseISO(s));

		var date = new DateTime(DateTime.PRECISION_SECOND);
		// date.setYear(ldt.getYear());
		// date.setMonth(ldt.getMonthValue());
		// date.setDay(ldt.getDayOfMonth());
		// date.setHour(ldt.getHour());
		// date.setMinute(ldt.getMinute());
		// date.setSecond(ldt.getSecond());
		return date;
	}
	
}