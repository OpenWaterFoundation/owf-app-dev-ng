// ----------------------------------------------------------------
// DATA CLASS: This class encapsulates all the data that is needed 
// for running Gapminder visualization. It also parses through the 
// csv data read in and converts it to JSON for Gapminder.
// ----------------------------------------------------------------
import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';
import * as $               from "jquery";
import * as d3              from 'd3';
import * as Papa            from 'papaparse';


export class Data {

	public configProps: any;
	public variables: any;
	public csv: any;
	public json: any;
	public annotations: any;
	public dimensions: any;
	public parseDate: any;

	constructor(configProps: any, public owfCommonService: OwfCommonService) {
		this.configProps = configProps;
		this.variables = configProps.VariableNames;
		this.csv;
		this.json;
		this.annotations;
		if(configProps.AnnotationsFileName && configProps.AnnotationsFileName != "") this.get_annotations();
		else this.annotations = null;
		this.dimensions = {
			"xMin": Infinity, 
			"xMax": -Infinity, 
			"yMin": Infinity, 
			"yMax": -Infinity, 
			"radiusMax":-Infinity, 
			"dateMin": new Date(8640000000000000), 
			"dateMax": new Date(-8640000000000000),
			"maxPopulatedDate": new Date(-8640000000000000)
		};
		this.convert_to_json();
	}

	get_annotations() {
		var _this = this;
		//ajax call to get annotation data from annotationsURL specified in Config file
		$.ajax({
			url: _this.owfCommonService.buildPath(IM.Path.gP, [_this.configProps.AnnotationsFileName]),
			async: false,
			dataType: 'json',
			error: function(error) {
				throw new Error('Error reading the Data file.');
			},
			success: function(data) {
				_this.annotations = data.Annotations;
			}
		})
	}

	convert_to_json() {
		var _this = this;
		var _Papa = Papa;
		this.parseDate = d3.timeParse(_this.configProps.InputDateFormat);
		var URL: any;	
		if(_this.configProps.MultipleDatasets) {
			URL = expand_parameter_value(_this.configProps.DataFileName, {"Year": _this.configProps.DefaultDatasetChoice});
		} else {
			URL = _this.configProps.DataFileName;
		}

		$.ajax({
			url: URL,
			async: false,
			dataType: 'text',
			error: function(error) {
				throw new Error('Error reading data file.');
			},
			success: function(data) {
				_this.csv = data;
				var csv = _Papa.parse(
					data,
					{
						header:true,
						comments:true,
						dynamicTyping:true
					}).data,
					jsonObj = {
						"data":[]
					},
					tempJson = makeJsonObj(csv[0]);


				for(var i = 0; i < csv.length - 1; i++) {
					if(csv[i][_this.variables.Label] === tempJson[_this.variables.Label]) {
						initializeDimensions(csv[i]);
						updateJsonObj(tempJson, csv[i]);
					} else {
						jsonObj.data.push(tempJson);
						tempJson = makeJsonObj(csv[i]);
						initializeDimensions(csv[i]);
						updateJsonObj(tempJson, csv[i]);
					}
				}
				jsonObj.data.push(tempJson);
				_this.json = jsonObj;
			}
		})

		/**
		 * substr to substring
		 * @param parameter_value 
		 * @param properties 
		 * @returns 
		 */
		function expand_parameter_value(parameter_value: any, properties: any) {
      var search_pos = 0,
        delim_start = "${",
        delim_end = "}";
      var b = "";
      while (search_pos < parameter_value.length) {
        var found_pos_start = parameter_value.indexOf(delim_start),
          found_pos_end = parameter_value.indexOf(delim_end),
          prop_name = parameter_value.substr((found_pos_start + 2), ((found_pos_end - found_pos_start) - 2)),
          prop_val = properties[prop_name];

        if (found_pos_start === -1) {
          return b;
        }

        b = parameter_value.substr(0, found_pos_start) + prop_val + parameter_value.substr(found_pos_end + 1, parameter_value.length);
        search_pos = found_pos_start + prop_val.length;
        parameter_value = b;
      }
      return b;
    }

		/**
		 *Makes a JSON object in the correct format required for interpolating the data </p>
		 *ex: {"WaterUse_AFY":[],"GPCD":[],"Population":[],"Basin":"Metro","Provider":"Arapahoe County Water and Wastewater Authority"}
		 *
		 *@param {object} data - an object containing data from csv file
		 */
		function makeJsonObj(data: any) {
			var json = {}
			json[_this.variables.XAxis] = [];
			json[_this.variables.YAxis] = [];
			json[_this.variables.Sizing] = [];
			json[_this.variables.Grouping] = data[_this.variables.Grouping].toString();
			json[_this.variables.Label] = data[_this.variables.Label].toString();
			return json;
		}

		/**
		 *Returns an object containing 3 new 2 element arrays of [year, data] </p>
		 *ex: {DataXAxisName:[year, var1], DataYAxisName:[year, var2], DataMarkerSizingName:[year, var3]}
		 *
		 *@param {int} year - year for which to create the arrays
		 *@param {number} var1 - data for DataXAxisName
		 *@param {number} var2 - data for DataYAxisName
		 *@param {number} var3 - data for DataMarkerSizingName
		 */ 
		function createNewObject(date: Date, var1: any, var2: any, var3: any) {
			var date = new Date(_this.parseDate(date));
			var data = {
				 xVar:[date, parseFloat(initializeIfEmpty(var1))],
				 yVar:[date, parseFloat(initializeIfEmpty(var2))],
			 	 size:[date, parseFloat(initializeIfEmpty(var3))]
			 };
			return data;
		}

		/**
		 *Checks that data is always slightly larger than 0 for logarithmic scaling purposes
		 *
		 *@param {number} data - a number to be checked
		 */
		function checkData(data: any) {
			if(data === 0) {
				return 0.001;
			} else {
				return 0;
			}
		}

		function initializeIfEmpty(val: any) {
			if(val === "") {
				return 0;
			} else {
				return val;
			}
		}

		/**
		 * Pushes data returned from createNewObj() onto the JSON object.
		 * @param {object} json 
		 * @param {object} data 
		 */
		function updateJsonObj(json: any, data: any) {
			data = createNewObject(data[_this.variables.Date], data[_this.variables.XAxis], data[_this.variables.YAxis], data[_this.variables.Sizing]);
			json[_this.variables.XAxis].push(initializeIfEmpty(data.xVar));
			json[_this.variables.YAxis].push(initializeIfEmpty(data.yVar));
			json[_this.variables.Sizing].push(initializeIfEmpty(data.size));
		}

		function checkMin(number: any) {
			if(number < 0) {
				d3.select(".title")
					.append("text")
					.style("color", "red")
					.style("font-size", "12px")
					.text('Error: log axis with negative values');
				throw 'Error: log axis with negative values';
			}
			if(number < 1) {
				number = 1;
			}
			return number;
		}

		/**
		 *Initializes variables for min and max values while parsing through the csv data file </p>
		 *ex: xMin, xMax, yMin, yMax, and radiusMax
		 *
		 *@param {object} data - object containing data
		 */
		function initializeDimensions(data: any) {
			if(_this.configProps.XAxisScale.toUpperCase() === "LOG") {
				_this.dimensions.xMin = Math.min(_this.dimensions.xMin, checkMin(parseFloat(initializeIfEmpty(data[_this.variables.XAxis]))));
			} else {
				_this.dimensions.xMin = Math.min(_this.dimensions.xMin, parseFloat(initializeIfEmpty(data[_this.variables.XAxis])));
			}

			if(_this.configProps.YAxisScale.toUpperCase() === "LOG") {
				_this.dimensions.yMin = Math.min(_this.dimensions.yMin, checkMin(parseFloat(initializeIfEmpty(data[_this.variables.YAxis]))));
			} else {
				_this.dimensions.yMin = Math.min(_this.dimensions.yMin, parseFloat(initializeIfEmpty(data[_this.variables.YAxis])));
			}	
			_this.dimensions.xMax = Math.max(_this.dimensions.xMax, parseFloat(initializeIfEmpty(data[_this.variables.XAxis])));
			_this.dimensions.yMax = Math.max(_this.dimensions.yMax, parseFloat(initializeIfEmpty(data[_this.variables.YAxis])));
			_this.dimensions.radiusMax = Math.max(_this.dimensions.radiusMax, parseFloat(initializeIfEmpty(data[_this.variables.Sizing])));

			_this.dimensions.dateMin = new Date(Math.min(_this.dimensions.dateMin.getTime(),
			new Date(_this.parseDate(data[_this.variables.Date])).getTime()));
			_this.dimensions.dateMax = new Date(Math.max(_this.dimensions.dateMax.getTime(),
			new Date(_this.parseDate(data[_this.variables.Date])).getTime()));

			if(populated(data) === true) _this.dimensions.maxPopulatedDate = new Date(Math.max(_this.dimensions.maxPopulatedDate.getTime(), new Date(_this.parseDate(data[_this.variables.Date])).getTime()));
		}

		function populated(data: any) {
			if(data[_this.variables.XAxis] === "" && data[_this.variables.YAxis] === "" && data[_this.variables.Sizing] === "") {
				return false;
			}
			return true;
		}
	}
}