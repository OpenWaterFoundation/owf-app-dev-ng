import { Component,
          Inject,
          OnInit}                       from '@angular/core';
import { MatDialog,
          MatDialogConfig,
          MatDialogRef,
          MAT_DIALOG_DATA }              from '@angular/material/dialog';
import { WindowManager,
          WindowType }                   from '@OpenWaterFoundation/common/ui/window-manager';

import { take }                          from 'rxjs/operators';

import { OwfCommonService }              from '@OpenWaterFoundation/common/services';
import * as IM                           from '@OpenWaterFoundation/common/services';

import { DialogDataTableLightComponent } from '../dialog-data-table-light/dialog-data-table-light.component';
import { DialogDocComponent }            from '../dialog-doc/dialog-doc.component';
import { Properties }                    from './js/gapminder-util/properties';
import { Data }                          from './js/gapminder-util/data-class';
import { Parameters }                    from './js/gapminder-util/get-parameters';

import * as $                            from "jquery";
import * as d3                           from 'd3';
import * as Papa                         from 'papaparse';
import 'select2';


@Component({
  selector: 'app-dialog-gapminder',
  templateUrl: './dialog-gapminder.component.html',
  styleUrls: ['./dialog-gapminder.component.css', '../main-dialog-style.css']
})
export class DialogGapminderComponent implements OnInit {

  public annotations: any;
  public annotationText: any;
  public annotationsData: any;
  /** The path to this Gapminder visualization's configuration file. */
  public configPath: string;
  public currYear: any;
  public data: any;
  public dateArray: any;
  public dimensions: any;
  public displayAll: any;
  public dot: any;
  public firstClick: boolean;
  public formatDate: any;
  /** The geoLayer from the current layer. */
  public geoLayer: IM.GeoLayer;
  public handle: any;
  public handleText: any;
  public inputFileFormat: any;
  public json: any;
  public line: any;
  public mainSVG: any;
  public nameOptions: any[];
  /** Options used for the ng-select2 creation.
   * https://www.npmjs.com/package/ng-select2 */
  public options = {
    multiple: true,
    closeOnSelect: false,
    width: '100%'
  }
  public pathData: any;
  public pathJSON: any;
  public precisionInt: any;
  public precisionUnit: any;
  public properties: any;
  public radiusScale: any;
  public selectedGroup: any;
  public timeScale: any;
  public tip: any;
  public topYear: any;
  public tracer: any;
  public transition: any;
  /** Array containing the currently selected values in the select2 dropdown. */
  public selectValue: string[];
  public variables: any;
  public visSpeed: any;
  public xScale: any;
  public yScale: any;
  /** A unique string representing the windowID of this Dialog Component in the WindowManager. */
  public windowID: string;
  /** The windowManager instance, which creates, maintains, and removes multiple open dialogs in an application. */
  public windowManager: WindowManager = WindowManager.getInstance();


  /**
   * Component constructor.
   * @param dialogRef 
   * @param dataObject 
   */
  constructor(public owfCommonService: OwfCommonService,
              public dialog: MatDialog,
              public dialogRef: MatDialogRef<DialogGapminderComponent>,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.configPath = dataObject.data.configPath;
    this.geoLayer = dataObject.data.geoLayer;
    this.windowID = dataObject.data.windowID;
  }

  
  /**
   * Component entry point after the constructor.
   */
  ngOnInit(): void {
    this.gapminder();
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked, and removes this
   * dialog's window ID from the windowManager.
   */
  public onClose(): void {
    this.dialogRef.close();
    this.windowManager.removeWindow(this.windowID);
  }

  /**
   * Gapminder visualization set up and creation of the svg on the DOM, along with
   * event handling functions.
   */
  public gapminder() {
    // The smaller scoped component reference to be used in any anonymous functions
    // throughout this function.
    var _this = this;
    // Assigning object's properties to the local 'properties' variable.
    this.properties = new Properties(this.configPath).properties;
    // Object holding additional parameters if property provided in configuration, otherwise set to null.
    var additionalParametersDictionary: any = this.properties.AdditionalData ? getAdditionalParameters() : null;
    // Object holding variable names from configuration.
    this.variables = this.properties.VariableNames;
    // Object that encapsulates all the data needed for Gapminder, also parses through
    // csv data read in and convert to JSON for Gapminder.
    this.data = new Data(this.properties, this.owfCommonService);
    // Object holding JSON data for gapminder.
    this.json = this.data.json;
    // Object holding dimensions from data.
    this.dimensions = this.data.dimensions;
    // Object holding annotations data,
    // .GeneralAnnotations  - Displayed below visualization if annotations exist for the specified time frame.
    // .SpecificAnnotations - Displayed on visualization through popup on mouseover.
    this.annotationsData = this.data.annotations;
    /**
     * D3's built in time parser, indicates what the date string should look like.
     * Used to format to format the string into date object, i.e. '%Y'.
     */
    var parseDate = d3.timeParse(this.properties.InputDateFormat);
    // Used to format date object into a string..
    // Used as parameter for getAnnotations(inputFileFormat) function.
    this.inputFileFormat = d3.timeFormat(this.properties.InputDateFormat);
    // Format date object into a string.
    this.formatDate = d3.timeFormat(this.properties.OutputDateFormat);
    this.currYear = this.dimensions.dateMin;
    this.topYear = this.dimensions.dateMin;
    // Svg container width - responsible for defining the visualization's canvas
    // ( or the area where the graph and associated bits and pieces are placed).
    var width = 800;
    // Svg container height - responsible for defining the visualization's canvas
    // ( or the area where the graph and associated bits and pieces are placed).
    var height = 400;
    // SVG container margin - responsible for defining the visualization's canvas 
    // ( or the area where the graph and associated bits and pieces are placed).
    var margin = { top: 10, left: 30, bottom: 80, right: 82 };
    this.displayAll = true;
    this.tracer = (this.properties.TracerNames === "" || !this.properties.TracerNames) ? false : true;
    // Used in stopAnimation() function, stops the next transition.
    this.firstClick = true;
    /** The height of the legend in pixels. */
    var legendHeight: any;
    // Precision int for the respected time step,
    // TimeStep: 1Year. Returns '1'.
    this.precisionInt = parsePrecisionInt(this.properties.TimeStep);
    // Precision unit for the time step,
    // TimeStep: 1Year. Returns 'Year'.
    this.precisionUnit = parsePrecisionUnits(this.properties.TimeStep);

    this.dimensions.maxPopulatedDate.setHours(23, 59, 59);

    if (this.properties.MultipleDatasets) {
      $("#DatasetChoicesLabel").html(this.properties.DatasetChoicesLabel + ": ");
      $("#DatasetChoices").html(this.properties.DefaultDatasetChoice + " <span class='caret'></span>");
      // Add date options.
      d3.select("#datesList")
        .attr("class", "dropdown-menu")
        .selectAll("dropdown-menu")
        .data(this.properties.DatasetChoicesList)
        .enter().append("li")
        .append("a")
        .attr("href", "#")
        .attr("onclick", function (d) {
          return "selectYear(" + d + ")";
        })
        .text((d: any) => d)
    } else {
      $("#DatasetChoicesLabel").remove();
      $("#DatasetChoices").remove();
    }


    if (this.properties.DataTableType.toUpperCase() === "CLUSTERIZE") d3.select("#dataTable2").remove();
    if (this.properties.DataTableType.toUpperCase() === "JQUERY") d3.select("#dataTable1").remove();

    var div = d3.select("#Gapminder").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
    $(window).on("click", function (e) {
      if (e.button === 0) {
        div.remove();
        div = d3.select("#Gapminder").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);
      }
    });

    // d3.select("#selectAllButton")
    // .html("Select All " + this.variables.Label + "s")

    // If no annotation file or if no annotation shapes specified in annotation file, disable annotations on/off button.
    if (this.annotationsData === null) {
      (<HTMLInputElement>document.getElementById("annotationsButton")).disabled = true;
    } else {
      if (!this.annotationsData.SpecificAnnotations) {
        (<HTMLInputElement>document.getElementById("annotationsButton")).disabled = true;
      }
    }

    //----------------------------------------ROW 1: TITLE/SUBTITLE -----------------------------------------
    // Create a row (bootstrap) with div's for title and subtitle.
    // Add maintitle to DOM.
    d3.select("#maintitle")
      .append("text")
      // Title configured in Config file.
      .text(this.properties.MainTitleString)
      .style("font-size", "22px")
      .style("padding-left", "30px");

    // Display current year in upper right.
    d3.select("#maintitle")
      .append("div")
      .attr("id", "currentDateDiv")
      .style("float", "right")
      .style("padding-right", "15px")
      .style("padding-top", "8px")
      .style("font-size", "18px")
      .append("text")
      .text(this.formatDate(this.currYear));

    // Add subtitle to DOM.
    d3.select("#subtitle")
      .append("text")
      .attr("id", "subtitle-text")
      .text(this.properties.SubTitleString) // Subtitle configured in Config file.
      .style("font-size", "15px")
      .style("padding-left", "30px")
      .on("mouseover", () => {
        var subtitleContainer = document.getElementById("subtitle");
        if (subtitleContainer.scrollWidth > subtitleContainer.clientWidth) {
          d3.select("#subtitle")
            .attr("class", "mouseover");
          d3.select("#subtitle-text")
            .attr("class", "mouseover")
        }
      })
      .on("mouseout", () => {
        d3.select("#subtitle")
          .attr("class", "");
        d3.select("#subtitle-text")
          .attr("class", "")
      })

    /** SVG container for chart elements. */
    this.mainSVG = d3.select("#chart")
      .append("svg")
      .attr("class", "box")
      .attr("width", "100%")
      // Makes the visualization responsive.
      .attr("viewBox", '0, 0, 665, 400')
      // This is the height of only the actual chart, making room for elements above and below the chart.
      .attr("height", height); 

    // Set width to the width of the chart.
    width = $(".box").width(); 

    // Create a div/svg container for legend.
    var legend = d3.select("#legend")
      .style("height", ((height / 2) - 30) + "px");

    // Create a div for list.
    var sideTools = d3.select("#sideTools")

    //-----------------------------------ROW 3: YEAR SLIDER/BUTTON CONTROLS----------------------------------
    // Create a timescale for year slider
    this.timeScale = d3.scaleTime()
    .domain([this.dimensions.dateMin, this.dimensions.dateMax])
    .range([0, (width - 75)]);

    this.dateArray = buildDateArray();
    this.visSpeed = 20000 / (this.timeScale.range()[1] - this.timeScale.range()[0]);
    // If the last data in the array isn't the last possible date, add the last date to the end of the array
    if (this.dateArray[this.dateArray.length - 1].getTime() !== this.dimensions.dateMax.getTime()) {
      this.dateArray.push(this.dimensions.dateMax);
    }

    var dateLabel = d3.select(".box")
      .append("text")
      .text(this.formatDate(this.timeScale.ticks()[0]))
      .attr("fill-opacity", "0");
    var dateText = dateLabel.node().getBBox();

    /**
     * div and svg container for year slider and buttons.
     */
    var controlSVG = d3.select("#dateSlider")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "45px")

    var slider = controlSVG.append('g')
      .attr('class', "slider")
      .attr("transform", "translate(15,15)");

    var sliderTooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    var handleFormat = this.formatHandleText();

    // Add annotations circles before the date slider.
    if (this.annotationsData !== null) {
      var annotationDates = Object.keys(this.annotationsData.GeneralAnnotations);

      var annotationsDots = slider.append("g")
      .attr("class", "annotationDots")
      .selectAll(".annotationDots")
      .data(annotationDates)
      .enter().insert("circle", ".track-overlay")
      .attr("class", "handle")
      .attr("transform", "translate(0, 5)")
      .attr("cx", (d: any) => this.timeScale(parseDate(d)))
      .attr("r", 4)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", "2px")
      .attr("stroke-opacity", 0.5)
      .on("mouseover", function (d) {
        _this.annotations.html(
          "<p class='datatable' style='font-weight:bold;'> Date: " + d + "</p>" +
          "<p class='datatable' style='font-weight:bold; display:inline;'>" +
          _this.annotationsData.GeneralAnnotations[d].Title + ": " +
          "<p class='datatable'style='display:inline;'>" +
          _this.annotationsData.GeneralAnnotations[d].Description + "</p>"
        )
      })
    }

    slider.append("line")
    .attr("class", "track")
    .attr("x1", this.timeScale.range()[0])
    .attr("x2", this.timeScale.range()[1])
    .attr("transform", "translate(0, 5)")
    .attr("stroke-linecap", "round")
    .attr("stroke", "#000")
    .attr("stroke-opacity", 0.1)
    .attr("stroke-width", "18px")
    // .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .style("cursor", "pointer")
    .on("mousemove", function (event: any) {
      sliderTooltip.transition()
      .duration(200)
      .style("opacity", .9);
      // NOTE: For some reason, the mouse over event.x returns a number that is 237
      // higher than it should be, so it is subtracted for the tooltip to display correctly.
      var date = _this.timeScale.invert(Math.round(event.x - 237));
      if (date <= _this.dimensions.maxPopulatedDate) {
        sliderTooltip.html(handleFormat(date))
        .style("left", (event.pageX - 30) + "px")
        .style("top", (event.pageY - 35) + "px");
      } else {
        sliderTooltip.html(handleFormat(date) + " (no data)")
        .style("left", (event.pageX - 30) + "px")
        .style("top", (event.pageY - 35) + "px");
      }

    })
    .on("mouseout", function () {
      sliderTooltip.transition()
      .duration(200)
      .style("opacity", 0);
    })
    .call(d3.drag()
    .on("start.interrupt", () => slider.interrupt())
    .on("start drag", function(event) { draggedYear(_this.timeScale.invert(Math.round(event.x))); }));

    var g = slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 28 + ")");

    g.selectAll("text")
    .data(this.timeScale.ticks(getMaxXTicks(width, dateText.width)))
    .enter().append("text")
    .attr("x", function (d) {
      return _this.timeScale(d);
    })
    .attr("text-anchor", "middle")
    .style("cursor", "default")
    .text((d) => this.formatDate(d));

    this.handleText = slider.insert("text", ".track-overlay")
    .attr("font-size", "10px")
    .text(this.formatDate(this.currYear))
    .attr("text-anchor", "middle")
    .attr("transform", "translate(0, -8)");

    // The main circle that slides across the date slider track.
    this.handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 7)
    .attr("transform", "translate(0, 5)")
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("stroke-opacity", 0.8)
    .attr("stroke-width", "2px");

    //------------------------------------ROW 4: DATATABLE/ANNOTATIONS----------------------------------------
    // The following are the default variables to be displayed in the datatable
    // which consists of the name of the dot and the four variables this visualization 
    // displays.
    var tableContents = '<p><strong>' + this.variables.Label + '</strong>: </p>' +
      '<p><strong>' + this.variables.Date + '</strong>: </p>' +
      '<p><strong>' + this.variables.XAxis + '</strong>: </p>' +
      '<p><strong>' + this.variables.YAxis + '</strong>: </p>' +
      '<p><strong>' + this.variables.Sizing + '</strong>: </p>' +
      '<p><strong>' + this.variables.Grouping + '</strong>: </p>';
    // If there are additional parameters to show then add the content to the tablediv
    if (additionalParametersDictionary) {
      tableContents += "<br> Additional Parameters:<br>------------------";
      for (var i = 0; i < additionalParametersDictionary.length; i++) {
        tableContents += "<p><strong>" + additionalParametersDictionary[i] + "</strong>: </p>";
      }
    }
    // Create a row and div for the datatable.
    var tablediv = d3.select("#tablediv")
      .html(tableContents);

    d3.select("#tablediv")
      .style("height", "100%");

    // If Config file specifies annotations append a div for annotations in same row as datatable.
    if (this.annotationsData && !$.isEmptyObject(this.annotationsData.GeneralAnnotations)) {
      this.annotations = d3.select("#annotations");
    }

    // Create a tip object that will display information when hovering over an annotation window tip.
    this.tip = d3.select('body')
      .append('div')
      .attr('class', 'tip')
      .style('border', '1px solid black')
      .style('padding', '2px')
      .style('position', 'absolute')
      .style('display', 'none')
      .style('font-size', '12px')
      .style('background', 'white')
      .style('max-width', '200px')
      .on('mouseover', function(d, i) {
        _this.tip.transition().duration(0);
      })
      .on('mouseout', function(d, i) {
        _this.tip.style('display', 'none');
      });

    //-----------------------------------------------GAPMINDER-----------------------------------------------
    /**
     * Creates a scale to set the color of dots using a standard color scheme.
     */
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    var yText = d3.select(".box")
      .append("text")
      .text(d3.format(",.0f")(Math.round(this.dimensions.yMax))) // hard-coded, needs to change
      .attr("fill-opacity", 0);
    // Create svg element of largest x-axis label.
    var xText = d3.select(".box")
      .append("g")
      .append("text")
      .text(d3.format(",.0f")(Math.round(this.dimensions.xMax))) // hard-coded, needs to change
      .attr("fill-opacity", 0);
    // bbox gets height and width attributes of labels.
    var yTextBox = yText.node().getBBox();
    var xTextBox = xText.node().getBBox();

    // Creates a scale to set radius of dots.
    this.radiusScale = d3.scaleSqrt().domain([0, (this.dimensions.radiusMax * 2)]).range([3, 47]);

    // Assign xScale according to if Config file specifies Log or Linear
    var xAxis: any;
    if (this.properties.XAxisScale.toUpperCase() === "LOG") {
      var min = this.properties.XMin && this.properties.XMin !== "" ? this.properties.XMin : this.dimensions.xMin;
      var max = this.properties.XMax && this.properties.XMax !== "" ? this.properties.XMax : this.dimensions.xMax;

      // Configure the log x scale domain and range.
      this.xScale = d3.scaleLog()
      // CheckLogMin to make sure no negative numbers.
      .domain([this.checkMin(min), max])
      .range([yTextBox.width + margin.left + 15, (width - 25)]);

      // Configure the xAxis with the xScale.
      xAxis = d3.axisBottom(this.xScale)
       // Get logTicks for log & format numbers for log.
        .ticks(6, d3.format(",d"))
        .tickSizeInner(-(height))
        .tickSizeOuter(0)
        .tickPadding(10);
    } else {
      var min = this.properties.XMin && this.properties.XMin !== "" ? this.properties.XMin : this.dimensions.xMin;
      var max = this.properties.XMax && this.properties.XMax !== "" ? this.properties.XMax : this.dimensions.xMax;
      
      // Configure the linear x scale domain and range.
      this.xScale = d3.scaleLinear()
        .domain([min, max])
        .range([yTextBox.width + margin.left + 15, (width - 25)]);
      // Configure the xAxis using the xScale.
      xAxis = d3.axisBottom(this.xScale)
      // Get maxXTicks for linear.
      .ticks(getMaxXTicks(width, xTextBox.width) - 1)
      // Format numbers for linear.
      .tickFormat(d3.format(","))
      .tickSizeInner(-(height))
      .tickSizeOuter(0)
      .tickPadding(10);
    }
    // Assign xScale according to if Config file specifies Log or Linear.
    var yAxis: any;
    if (this.properties.YAxisScale.toUpperCase() === "LOG") {
      var min = this.properties.YMin && this.properties.YMin !== "" ? this.properties.YMin : this.dimensions.yMin;
      var max = this.properties.YMax && this.properties.YMax !== "" ? this.properties.YMax : this.dimensions.yMax;
      // Configure log y scale domain and range.
      this.yScale = d3.scaleLog()
        .domain([this.checkMin(min), max])
        .range([height - 40, 0]);
      // Configure yAxis using y scale
      yAxis = d3.axisLeft(this.yScale)
        .ticks(6, d3.format(",d")) // Get logTicks for log & format numbers for log.
        .tickSizeInner(-(width - margin.right) + 5)
        .tickSizeOuter(0)
        .tickPadding(10);
    } else {
      var min = this.properties.YMin && this.properties.YMin !== "" ? this.properties.YMin : this.dimensions.yMin;
      var max = this.properties.YMax && this.properties.YMax !== "" ? this.properties.YMax : this.dimensions.yMax;
      // Configure linear y scale domain and range.
      this.yScale = d3.scaleLinear()
        .domain([min, max])
        .range([height - 40, 0]);
      // Configure yAxis using y scale.
      yAxis = d3.axisLeft(this.yScale)
        // .ticks(getMaxYTicks(height, yTextBox.height)) // Get maxYticks for linear.
        .tickFormat(d3.format(",")) // Format numbers for linear.
        .tickSizeInner(-(width - margin.right) + 5)
        .tickSizeOuter(0)
        .tickPadding(10);
    }

    // Add the x-axis to svg, using xAxis.
    var xaxis = this.mainSVG.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height - 40) + ")")
    .call(xAxis);
    // Add the y-axis to svg, using yAxis.
    var yaxis = this.mainSVG.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .attr("transform", "translate(" + (yTextBox.width + margin.left + 15) + ",0)");
    // Style all inner ticks.
    d3.selectAll('g.tick')
    .select('line')
    .style("opacity", "0.2")
    .style("stroke-dasharray", "5,5")
    // Style the X and X axes.
    d3.selectAll('path.domain')
    .style("stroke-width", "2px")
    .style("shape-rendering", "crispEdges")
    .style("stroke-opacity", "0.7")
    // Add an x-axis label to below x-axis.
    var xlabel = this.mainSVG.append("text")
      .attr("class", "xLabel")
      .attr("text-anchor", "middle")
      .attr("x", (width / 2))
      .attr("y", height - 5)
      .text(this.properties.BottomXAxisTitleString)
      .attr("font-size", "14px");
    // Add a y-axis label to svg to left of y-axis.
    var ylabel = this.mainSVG.append("text")
      .attr("class", "yLabel")
      .attr("text-anchor", "middle")
      .attr("y", 0)
      .attr("x", -((height - 100) / 2))
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text(this.properties.LeftYAxisTitleString)
      .attr("font-size", "14px");

    var legendData = getGroupingNames(this.json);
    addLegend(legendData);
    function addLegend(data: any) {
      var selectMultiple = false;
      // Initialize position 0 for adding elements to legend div.
      var pos = 0;
      // Get list of names for legend based off how dots are colored/grouped on the visualization.
      // Set height using 20px per name.
      legendHeight = (data.length + 1) * 20;

      d3.select("#legend")
        .style("height", function () {
          if (legendHeight < ((height / 2) - 30)) {
            return (legendHeight) + "px";
          } else {
            return (height / 2) - 30 + "px";
          }
        });
      var legend = d3.select("#legend")
      // Append svg to legend div using legendHeight.
      legend = legend.append('svg')
        .attr("class", "legendBox")
        .attr("width", "100%")
        .attr("height", legendHeight)
      // Add legend title.
      legend.append('text')
        .text(_this.variables.Grouping)
        .style("font-size", "12px")
        .style("text-decoration", "underline")
        .attr("y", "10");
      // Add square for each name, color coordinated with colorScale.
      var square = legend.append("g")
        .attr("class", "square")
        .selectAll(".square")
        .data(data)
        .enter().append("rect")
        .attr("class", "square")
        .attr("height", "10px")
        .attr("width", "10px")
        .attr("y", function (d) { return pos += 20; })
        .style("fill", (d: any) => colorScale(d))
        .attr("cursor", "pointer")
        .on("mousedown", function (event, d) {
          if (event.ctrlKey) {
            if (_this.firstClick) {
              selectMultiple = false;
              _this.legendClick(d, selectMultiple);
              _this.firstClick = false;
            } else {
              selectMultiple = true;
              _this.legendClick(d, selectMultiple);
            }
          } else {
            selectMultiple = false;
            _this.legendClick(d, selectMultiple);
            _this.firstClick = false;
          }

        });

      // Reset position for legend div, accounting for text positioning vs. svg rect positioning
      pos = 7;
      // Add the text to the legend from list of names
      var legendText = legend.append("g")
        .attr("class", "legendText")
        .selectAll("legendText")
        .data(data)
        .enter().append("text")
        .attr("class", function (d) {
          return "D" + _this.checkForSymbol(d);
        })
        .text(function (d) {
          var s = " - " + d;
          if (s.length > 17) {
            // Truncate name if too long to fit inside svg.
            s = s.substring(0, 17); 
            s += "...";
          }
          return s;
        })
        .style("font-size", "12px")
        .attr("x", "15px")
        .attr("y", function (d) {
          return pos += 20;
        })
        .style("cursor", "pointer")
        .on("mousedown", function (event, d) {
          if (event.ctrlKey) {
            if (_this.firstClick) {
              selectMultiple = false;
              _this.legendClick(d, selectMultiple);
              _this.firstClick = false;
            } else {
              selectMultiple = true;
              _this.legendClick(d, selectMultiple);
            }
          } else {
            selectMultiple = false;
            _this.legendClick(d, selectMultiple);
            _this.firstClick = false;
          }

        });
    }

    this.nameOptions = getIndividualDots(this.json);

    /** Variable creates life for data line (tracer). */
    this.line = d3.line()
    .x((d: any) => this.xScale(this.getXVar(d)))
    .y((d: any) => this.yScale(this.getYVar(d)))

    //-------------------------Add different elements to DOM if specified in annotation file----------------------
    if (this.annotationsData !== null && !$.isEmptyObject(this.annotationsData.SpecificAnnotations)) {
      var annotationShapes = this.mainSVG.append("g")
        .attr("id", "annotationShapes");
      // Add line Annotations if they are specified in the annotation file.
      var lineAnnotations = retrieveAnnotations("Line");
      if (lineAnnotations) {
        var annotationLine = annotationShapes.selectAll(".line")
          .data(lineAnnotations.get('Line'))
          .enter().append("line")
          .attr("id", "annotationLine")
          .attr("class", "annotationShape")
          .attr('x1', function (d: any) {
            return _this.xScale(d.Properties.x1);
          })
          .attr('y1', function (d: any) {
            return _this.yScale(d.Properties.y1);
          })
          .attr('x2', function (d: any) {
            return _this.xScale(d.Properties.x2);
          })
          .attr('y2', function (d: any) {
            return _this.yScale(d.Properties.y2);
          })
          .attr('stroke-width', function (d: any) {
            return d.Properties.LineWidth + "px";
          })
          .attr('stroke', 'black')
          .style("cursor", "pointer")
          .on('mouseover', this.mouseoverAnnotation)
          .on('mouseout', (event: any, d: any) =>
            this.tip.transition().style('display', 'none'));
      }
      // Add a rectangle if specified in the annotation file
      var rectAnnotations = retrieveAnnotations("Rectangle");
      if (rectAnnotations) {
        var annotationRect = annotationShapes.selectAll(".rect")
          .data(rectAnnotations.get('Rectangle'))		
          .enter().append("rect")
          .attr("id", "annotationRect")
          .attr("class", "annotationShape")
          .attr('x', function (d: any) {
            return _this.xScale(d.Properties.x1);
          })
          .attr('y', function (d: any) {
            return _this.yScale(d.Properties.y1);
          })
          .attr('width', function (d: any) {
            var x1 = _this.xScale(d.Properties.x1);
            var x2 = _this.xScale(d.Properties.x2);
            return x2 - x1;
          })
          .attr('height', function (d: any) {
            var y1 = _this.yScale(d.Properties.y1);
            var y2 = _this.yScale(d.Properties.y2);
            return y2 - y1;
          })
          .attr('fill-opacity', 0)
          .attr('stroke-width', function (d: any) {
            return d.Properties.LineWidth + "px";
          })
          .attr('stroke', 'black')
          .on('mouseover', this.mouseoverAnnotation)
          .on('mouseout', (event: any, d: any) =>
            this.tip.transition().style('display', 'none'));
      }
      // Add a symbol if specified in the annotation file.
      // Add circles from annotation file.
      var symbolAnnotations = retrieveAnnotations("Symbol");
      if (symbolAnnotations) {
        var circleAnnotations = retrieveByShape("Circle");
        if (circleAnnotations) {
          var annotationCircle = this.mainSVG.append("g")
            .selectAll(".point")
            .data(circleAnnotations.get('Circle'))	
            .enter().append("path")
            .attr("id", "annotationCircle")
            .attr("class", "point annotationShape")
            .attr("d", d3.symbol().type(d3.symbolCircle).size(function (d) {
              return Math.pow(d.Properties.SymbolSize, 2);
            }))
            .attr("transform", function (d: any) {
              return "translate(" + _this.xScale(d.Properties.x) + "," + _this.yScale(d.Properties.y) + ")";
            })
            .attr("stroke-width", "2px")
            .attr('stroke', 'black')
            .attr('fill-opacity', 0)
            .on('mouseover', this.mouseoverAnnotation)
            .on('mouseout', (event: any, d: any) =>
              this.tip.transition().style('display', 'none'));
        }
        // Add Triangles from annotation file.
        var triangleAnnotations = retrieveByShape("Triangle");
        if (triangleAnnotations) {
          var annotationTriangle = this.mainSVG.append("g")
            .selectAll(".point")
            .data(triangleAnnotations.get('Triangle'))
            .enter().append("path")
            .attr("id", "annotationTriangle")
            .attr("class", "point annotationShape")
            .attr("d", d3.symbol().type(d3.symbolTriangle).size(function (d) {
              return Math.pow(d.Properties.SymbolSize, 2);
            }))
            .attr("transform", function (d: any) {
              return "translate(" + _this.xScale(d.Properties.x) + "," + _this.yScale(d.Properties.y) + ")";
            })
            .attr("stroke-width", "2px")
            .attr('stroke', 'black')
            .attr('fill-opacity', 0)
            .on('mouseover', this.mouseoverAnnotation)
            .on('mouseout', (event: any, d: any) =>
              this.tip.transition().style('display', 'none'));
        }
        // Add Crosses from annotation file.
        var crossAnnotations = retrieveByShape("Cross");
        if (crossAnnotations) {
          var annotationCross = this.mainSVG.append("g")
            .selectAll(".point")
            .data(crossAnnotations.get('Cross'))
            .enter().append("path")
            .attr("id", "annotationCross")
            .attr("class", "point annotationShape")
            .attr("d", d3.symbol().type(d3.symbolCross).size(function (d) {
              return Math.pow(d.Properties.SymbolSize, 2);
            }))
            .attr("transform", function (d: any) {
              return "translate(" + _this.xScale(d.Properties.x) + "," + _this.yScale(d.Properties.y) + ")rotate(45)";
            })
            .attr("stroke-width", "2px")
            .attr('stroke', 'black')
            .attr('fill-opacity', 0)
            .on('mouseover', this.mouseoverAnnotation)
            .on('mouseout', (event: any, d: any) =>
              this.tip.transition().style('display', 'none'));
        }
        // Add Text from annotation file.
        var textAnnotations = retrieveAnnotations("Text");
        if (textAnnotations) {
          this.annotationText = this.mainSVG.append("g")
            .selectAll(".text")
            .data(textAnnotations.get('Text'))	
            .enter().append("text")
            .attr("id", "annotationText")
            .attr("class", "annotationShape")
            .text(function (d: any) {
              return d.Properties.Text;
            })
            .attr("text-anchor", "middle")
            .attr("x", function (d: any) {
              return _this.xScale(d.Properties.x);
            })
            .attr("y", function (d: any) {
              return _this.yScale(d.Properties.y) + 5;
            })
            .attr("font-size", function (d: any) {
              return d.Properties.FontSize;
            })
            .on('mouseover', this.mouseoverAnnotation)
            .on('mouseout', (event: any, d: any) =>
              this.tip.transition().style('display', 'none'))
            .attr("cursor", "default");
        }
      }
    }
    // Turn annotations off if specified 'Off' in Config file.
    if (this.properties.AnnotationShapes.toUpperCase() === "OFF") {
      if ($("#annotationText").length) {
        this.annotationText.attr("fill-opacity", 0).on("mouseover", null);
      }
      d3.selectAll(".annotationShape").attr("stroke-opacity", 0).on("mouseover", null);
      document.getElementById("annotationsButton").innerHTML = "Turn Annotations On";
    }

    // Add tracers to the dots on the visualization.
    this.pathData = [];
    this.pathJSON = this.json.data;

    var nested = this.nest(this.interpolatePath(this.dimensions.dateMin), this.pathData);

    var path: any;
    function addTracerPath(data: any) {

      path = _this.mainSVG.append("g")
      .attr("id", "dataline")
      .selectAll(".path")
      .data(data)
      .enter().append("path")
      .attr("class", function (d: any) {
        // d.key changed to d[0]
        return "tracer T" + toID(d[0].toUpperCase());
      })
      // Updated: path elements by default are filled black, specify CSS fill
      // 'none' to avoid this on tracer.
      .attr("fill", "none")	
      .attr("id", function (d: any) {
        // d.values changes to d[1]
        return "T" + toID(d[1][0].color);
      })
      .style("stroke", function (d: any) {
        // d.values changes to d[1]
        return colorScale(d[1][0].color);
      })
      .style("stroke-width", "1.5px")
      .style("stroke-opacity", function (d: any) {
        if (_this.tracer) {
          return .75;
        } else {
          return 0;
        }
      })
      .attr("d", function (d: any) {
        // d[1] = values
        return _this.line(d[1]);
      })
      .style("pointer-events", "none");
    }

    // NOTE: Draws tracer lines, but is acting a little wonky.
    addTracerPath(nested);

    // Turn tracers off if specified 'Off' in Config file.
    if (!this.tracer) {
      document.getElementById("tracerButton").innerHTML = "Turn Tracer On";
    }

    function addDots() {
      var dot_g = _this.mainSVG.append("g")
        .attr("id", "dots")
      _this.dot = dot_g.selectAll(".dot")
        .data(_this.interpolateData(_this.dimensions.dateMin))
        .enter().append("circle")
        .attr("class", function (d: any) {
          return "dot D" + _this.checkForSymbol(d.color);
        })
        .attr("id", function (d: any, i: any) {
          return "D" + toID(d.name);
        })
        .on("mouseover", function(event: any, d: any) {

          if (d3.select(this).attr("display") === "true") {
            if (_this.displayAll) {
              d3.selectAll(".dot").style("fill-opacity", .25).attr("stroke-opacity", .25);
            } else {
              // d3.selectAll(".dot" + dotClassSelector(d.color)).style("fill-opacity", .75).attr("stroke-opacity", .5);
            }

            d3.select(this)
            .style("fill-opacity", 1)
            .attr('stroke-opacity', function () {
              if (d3.select(this).attr("checked") !== "true") { return 1; }
              else { return .5; }
            })
            .attr('stroke-width', "2");
            d3.select(this).raise();

            if (_this.tracer) {
              if (_this.displayAll) {
                d3.selectAll("path.tracer").style("stroke-opacity", .4);
              } else {
                d3.selectAll("path" + _this.pathIDSelector(d.color)).style("stroke-opacity", .4);
              }
              // Display only the tracer that is being hovered over
              d3.select("path" + pathClassSelector(d.name).toString().toUpperCase())
                .style("stroke-opacity", 1);
            }
          }

          // The following are the default variables to be displayed in the datatable
          // which consists of the name of the dot and the four variables this visualization 
          // displays.
          var tableContents = "<p><strong>" + _this.variables.Label + "</strong>: " + _this.key(d) + "</p>" +
            "<p><strong>" + _this.variables.Date + "</strong>: " + _this.formatDate(_this.getClosest(date(d))) + "</p>" +
            "<p><strong>" + _this.variables.XAxis + "</strong>: " + d3.format(".2f")(d.xVarRaw.toFixed(2)) + "</p>" +
            "<p><strong>" + _this.variables.YAxis + "</strong>: " + d3.format(".2f")(d.yVarRaw.toFixed(2)) + "</p>" +
            "<p><strong>" + _this.variables.Sizing + "</strong>: " + d3.format(".2f")(d.sizeRaw.toFixed(2)) + "</p>" +
            "<p><strong>" + _this.variables.Grouping + "</strong>: " + color(d) + "</p>";
            
          if (_this.properties.AdditionalData) {
            var additionalParameters = additionalParametersDictionary[_this.key(d)];
            var showColumns = _this.properties.AdditionalData.ShowColumns;
            // If there are additional parameters to show then add the content to the tablediv
            if (additionalParameters) {
              tableContents += "<br> Additional Parameters:<br>------------------";
              for (var index = 0; index < showColumns.length; index++) {
                tableContents += "<p><strong>" + showColumns[index] + "</strong>: " +
                additionalParameters[showColumns[index]] + "</p>";
              }
            }
          }

          // Display information in data table if Config file specifies datatable.
          tablediv.html(tableContents);

        }) // Callback function.
        .on('mouseout', mouseout) // Callback function..
        .on("mousedown", mousedown) // Callback function.
        // Color according to grouping variable
        .on("contextmenu", function (event: any, d: any) {
          if (_this.properties.TimeseriesEnabled) {
            event.preventDefault();
            div.style("opacity", 1);
            div.html("<p style='margin:0px;'><a style='color:black; font-weight:bold;' href='./highchart.html?csv=" +
              expandPropertyValue(_this.properties.FilePropertyName, { "Year": _this.properties.DefaultDatasetChoice }) +
              "&name=" + d.name + "&nameVar=" + _this.variables.Label + "&xVar=" + _this.variables.XAxis + "&yVar=" +
              _this.variables.YAxis + "&size=" + _this.variables.Sizing + "&datevariable=" + _this.variables.Label +
              "', target='_blank'> Timeseries</a></p>")
              .style("left", (event.pageX) - 300 + "px")
              .style("top", (event.pageY) - 65 + "px");
          }
        })
        .style("fill", function (d: any) { return colorScale(color(d)); })
        // Add black outline to circle.
        .style("stroke", "black")
        .attr("display", "true")
        .call(_this.position.bind(_this))
        // Sets smaller dots on top.
        .sort(_this.order.bind(_this))
        .call(function (d: any) {
          document.getElementById("loader").style.display = "none";
        })
    }

    var data = this.interpolateData(this.dimensions.dateMin);
    // Add the dots to the visualization.
    addDots();

    // Set animation speed after all elements have been added, or set a default
    // if the AnimationSpeed property is not given.
    if (this.properties.AnimationSpeed) {
      if (this.properties.AnimationSpeed < 0 || this.properties.AnimationSpeed > 100) {
        console.error('Animation speed must be a positive integer of 100 or less. Using the default speed 75.');
        this.setSpeed('75');
        (<HTMLInputElement>document.getElementById("speedSlider")).value = '75';
      } else {
        this.setSpeed(this.properties.AnimationSpeed);
        (<HTMLInputElement>document.getElementById("speedSlider")).value = this.properties.AnimationSpeed;
      }
    } else {
      this.setSpeed('75');
      (<HTMLInputElement>document.getElementById("speedSlider")).value = '75';
    }

    //--------------------------------------Callback functions for dots------------------------------------------
    /**
     *Callback function: Called when user clicks on a dot
     *Highlights selected dot with a yellow outline
     */
    function mousedown(event: any, d: any) {
      if (event.button === 0) {
        if (d3.select(this).attr("display") === "true") {
          if (d3.select(this).attr("checked") === "true") {
            d3.select(this)
              .style('stroke', 'black')
              .attr('stroke-width', '1px')
              .attr('stroke-opacity', 1)
              .attr("checked", "false");
          } else {
            d3.select(this)
              .style('stroke', 'yellow')
              .attr('stroke-width', function () {
                if (d3.select(this).attr("display") === "true") {
                  return 4;
                } else {
                  return 0;
                }
              })
              .attr('stroke-opacity', .5)
              .attr("checked", "true");
          }
        } else { }
      }

    }

    /**
     * Dot mouseout event handler. Removes bold dot outline from mouseover'd dot
     * and resets the opacity and stroke opacity of all other dots.
     * @param event The event object.
     * @param d The data point object.
     */
    function mouseout(event: any, d: any) {

      if (d3.select(this).attr("display") === "true") {
        if (_this.displayAll) {
          d3.selectAll(".dot")
          .style("fill-opacity", 1)
          .attr("stroke-opacity", function () {
            if (d3.select(this).attr("checked") !== "true") { return 1; }
            else { return .5; }
          });
        } else {
          d3.selectAll(".dot" + _this.dotClassSelector(d.color))
          .style("fill-opacity", 1)
          .attr("stroke-opacity", function () {
            if (d3.select(this).attr("checked") !== "true") { return 1; }
            else { return .5; }
          });
        }

        d3.select(this)
          .attr('stroke-width', function () {
            if (d3.select(this).attr("checked") !== "true") { return 1; }
            else { return 4; }
          });
          
        if (_this.tracer) {
          if (_this.displayAll) {
            d3.selectAll("path.tracer")
            .style("stroke-opacity", .75);
          } else {
            d3.selectAll("path" + _this.pathIDSelector(d.color))
            .style("stroke-opacity", .75);
          }
        }
      }
      d3.selectAll(".dot").sort(_this.order.bind(_this));
    }

    //-----------------------------------Other Callback Functions for various elements----------------------------------
    /**
     *Callback Function: Called when clicking and dragging the year slider
     *Pauses animation and calls display year to display data associated with selected date
     *
     *@param {number} year - date selected from year slider
     */
    function draggedYear(date: any) {
      sliderTooltip.style("opacity", 0);
      date.setHours(0, 0, 0);
      _this.stopAnimation();

      (<HTMLInputElement>document.getElementById("pause")).disabled = true;
      (<HTMLInputElement>document.getElementById("play")).disabled = false;
      if (date >= _this.dimensions.dateMin && date < _this.dimensions.maxPopulatedDate) {
        _this.displayYear(date);
        (<HTMLInputElement>document.getElementById("forward")).disabled = false;
        (<HTMLInputElement>document.getElementById("back")).disabled = false;
        (<HTMLInputElement>document.getElementById("play")).disabled = false;
      }
      else if (date > _this.dimensions.maxPopulatedDate) {
        _this.displayYear(_this.dimensions.maxPopulatedDate);
        (<HTMLInputElement>document.getElementById("forward")).disabled = true;
        (<HTMLInputElement>document.getElementById("play")).disabled = true;
      }
      else if (date < _this.dimensions.dateMin) {
        _this.displayYear(_this.dimensions.dateMin);
        (<HTMLInputElement>document.getElementById("back")).disabled = true;
      }
    }

    /**
     *Jquery event listener for when selecting a provider from the dropdown menu
     *Highlights the selected provider with a yellow outline
     *Utilizes [select2]{@link https://select2.github.io/} library
     */
    $('select').on('select2:select', function (evt: any) {
      var provider = evt.params.data.text;
      d3.select(_this.dotIDSelector(provider))
        .style('stroke', 'yellow')
        .attr('stroke-width', function () {
          if (d3.select(this).attr("display") === "true") {
            return 4;
          } else {
            return 0;
          }
        })
        .attr('stroke-opacity', .5)
        .attr("checked", "true");
    });

    /**
     *Jquery event listener for when de-selecting a provider from the dropdown menu
     *Removes the highlighted outline from the de-selected dot
     *Utilizes [select2]{@link https://select2.github.io/} library
     */
    $('select').on('select2:unselect', function (evt: any) {
      var provider = evt.params.data.text;
      d3.select(_this.dotIDSelector(provider))
        .style('stroke', null)
        .attr('stroke-width', 1)
        .attr('stroke-opacity', function () {
          if (d3.select(this).attr("display") === "true") {
            return 1;
          } else {
            return 0;
          }
        })
        .attr("checked", "false");
    })

    //-----------------------------Helper Functions-------------------------------
    /**
     * Returns an array of dates according to precision units specified in Config file.
     */
    function buildDateArray() {

      var Date1 = new Date(_this.dimensions.dateMin);
      var Date2 = new Date(_this.dimensions.dateMax);
      var returnThis = [];
      while (Date1 <= Date2) {
        var tempDate = new Date(Date1);
        returnThis.push(tempDate);
        _this.incrementDate(Date1);
      }
      return returnThis;
    }

    /**
     *Parses all numbers from a string. \n
     *Meant to retrieve the precision units from precision string
     *
     *@param str - the string containing precision configuration.
     */
    function parsePrecisionInt(str: any) {
      return parseInt(str.match(/\d+/g));
    }

    /**
     *Parses all letters from a string. \n
     *Meant to retrieve the precision string from the precision string including numbers.
     *
     *@param str - the string containing precision configuration.
     */
    function parsePrecisionUnits(str: any) {
      return str.match(/[a-zA-Z]+/g)[0];
    }

    /**
     *Calculate maximum number of ticks which will fit on the y-axis
     *
     *@param {number} areaDim - height of area for y-axis
     *@param {number} labelDim - height of largest label on y-axis
     */
    function getMaxYTicks(areaDim: any, labelDim: any) {
      var maxTicks = (areaDim) / (labelDim + 18);
      var maxTicksStr = d3.format(".0f")(maxTicks);
      return parseInt(maxTicksStr);
    }

    /**Calculate maximum number of ticks which will fit on the x-axis
     *
     *@param {number} areaDim - width of area for x-axis
     *@param {number} labelDim - width of largest label on x-axis
     */
    function getMaxXTicks(areaDim: any, labelDim: any) {
      var maxTicks = (areaDim - 120) / (labelDim + 25);
      var maxTicksStr = d3.format(".0f")(maxTicks);
      return parseInt(maxTicksStr);
    }

    /**
     *Calculates maximum number of ticks that can fit on a log axis
     *
     *@param areaDim - area for the given axis
     */
    function logTicks(areaDim: any) {
      if (areaDim < 650) {
        if (areaDim < 350) {
          if (areaDim < 150) {
            return 2;
          } else {
            return 3;
          }
        } else {
          return 6;
        }
      } else {
        return 6;
      }
    }

    /**
     *Returns an array of names according to the grouping variable specified in Config file
     *
     *@param json - json object with data 
     */
    function getGroupingNames(json: any) {

      var array = [];

      var group = d3.group(json.data, (d: any) => d[_this.variables.Grouping]);

      var mapIter = group.keys();

      for (var i = 0; i < group.size; i++) {
        array.push(mapIter.next().value);
      }

      return array.sort(naturalSort);
    }

    /*
     * Natural Sort algorithm for Javascript - Version 0.8.1 - Released under MIT license
     * Author: Jim Palmer (based on chunking idea from Dave Koelle)
     */
    function naturalSort(a: any, b: any) {
      var re = /(^([+\-]?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?(?=\D|\s|$))|^0x[\da-fA-F]+$|\d+)/g,
        sre = /^\s+|\s+$/g,   // trim pre-post whitespace
        snre = /\s+/g,        // normalize all whitespace to single ' ' character
        dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
        hre = /^0x[0-9a-f]+$/i;

        var ore = /^0/,
        i = function (s: any) {
          return (/*this.naturalSort.insensitive && */('' + s).toLowerCase() || '' + s).replace(sre, '');
        },
        // convert all to strings strip whitespace
        x = i(a),
        y = i(b);
        // chunk/tokenize
        var xN = x.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0'),
        yN = y.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0');
        // numeric, hex or date detection
        var xD: any, yD: any;
        if (x.match(hre) !== null) {
          xD = parseInt(x.match(hre).toString(), 16) || (xN.length !== 1 && Date.parse(x));
        }
        if (y.match(hre) !== null) {
          yD = parseInt(y.match(hre).toString(), 16) || xD && y.match(dre) && Date.parse(y) || null;
        }
        
        var normChunk = function (s: any, l: any) {
          // normalize spaces; find floats not starting with '0', string or 0 if not defined (Clint Priest)
          return (!s.match(ore) || l === 1) && parseFloat(s) || s.replace(snre, ' ').replace(sre, '') || 0;
        },
        oFxNcL: any, oFyNcL: any;
      // first try and sort Hex codes or Dates
      if (yD) {
        if (xD < yD) { return -1; }
        else if (xD > yD) { return 1; }
      }
      // natural sorting through split numeric strings and default strings
      for (var cLoc = 0, xNl = xN.length, yNl = yN.length, numS = Math.max(xNl, yNl); cLoc < numS; cLoc++) {
        oFxNcL = normChunk(xN[cLoc] || '', xNl);
        oFyNcL = normChunk(yN[cLoc] || '', yNl);
        // handle numeric vs string comparison - number < string - (Kyle Adams)
        if (isNaN(oFxNcL) !== isNaN(oFyNcL)) {
          return isNaN(oFxNcL) ? 1 : -1;
        }
        // if unicode use locale comparison
        if (/[^\x00-\x80]/.test(oFxNcL + oFyNcL) && oFxNcL.localeCompare) {
          var comp = oFxNcL.localeCompare(oFyNcL);
          return comp / Math.abs(comp);
        }
        if (oFxNcL < oFyNcL) { return -1; }
        else if (oFxNcL > oFyNcL) { return 1; }
      }
    }

    /**
     * Return an array of the data for tracer paths.
     */
    function specificPathData(data: any) {
      var returnThis = [];
      for (let i = 0; i < this.properties.tracerNames.length; i++) {
        for (let j = 0; j < data.length; j++) {
          if (this.properties.tracerNames[i] === data[j]['name']) {
            returnThis.push(data[j]);
            break;
          }
        }
      }
      return returnThis;
    }

    /**
     *Separates annotations file into different shape types
     *Returns an object of annotations given shape type or false if no annotations exist for 
     *the given parameter
     *
     *@param shape - string specifying which shape data you want returned example: (line, rect, symbol, text)
     */
    function retrieveAnnotations(shape: any) {

      var returnThis: any;

      // group this data with this key 
      var group = d3.group(_this.annotationsData.SpecificAnnotations, (d: any) => d.ShapeType)

      group.forEach(function (values: any, key: any, map: any) {
        if (key === shape) {
          returnThis = map;
        }
      })
      if (returnThis) {
        return returnThis;
      } else {
        return false;
      }
    }

    /**
     *Acts in the same way as retrieveAnnotations() but it returns an 
     *object containing the data of the specified shape from the annotation shape type 'symbol'
     *
     *@param {String} shape - string specifying which shape data you want returned example: (circle, triangle, cross)
     */
    function retrieveByShape(shape: any) {
      var returnThis: any;
      data = retrieveAnnotations("Symbol");

      var group = d3.group(data.get('Symbol'), (d: any) => d.Properties.SymbolStyle);

      group.forEach(function (values: any, key: any, map: any) {

        if (key === shape) {
          returnThis = map;
        }
      })
      if (returnThis) {
        return returnThis;
      } else {
        return false;
      }
    }

    /**
     *Returns an array of names for each dot on the visualization
     *
     *@param json - json object with data
     */
    function getIndividualDots(json: any) {
      var array = [];

      var group = d3.group(json.data, (d) => d[_this.variables.Label]);

      var mapIter = group.keys();

      for (var i = 0; i < group.size; i++) {
        array.push(mapIter.next().value);
      }

      return array.sort();
    }

    /**
     * Return the additional parameters, if any, provided from the additional parameter data file.
     * 
     */
    function getAdditionalParameters() {
      var additionalDataConfigurations = this.properties.AdditionalData,
        additionalDataFile = additionalDataConfigurations.AdditionalDataFile,
        displayColumns = additionalDataConfigurations.DisplayColumns,
        joinColumns = additionalDataConfigurations.JoinColumns;
      var additionalParametersJoinColumn = joinColumns.AdditionalParametersJoinColumn,
        dataJoinColumn = joinColumns.DataJoinColumn;
      var variableLabel = "";
      // Find out which 'this.variables' key matches the data join key
      $.each(this.variables, (k: any, v: any) => {
        if (v === dataJoinColumn) {
          variableLabel = k;
        }
      })
      var parameters = new Parameters(additionalDataFile, variableLabel);
      parameters = parameters.json;
      return parameters;
    }

    //-----------------------Helper functions that move elements forward or back in the svg canvas-------------------------
    /*
     *Moves selected elements to front of SVG canvas
     */
    d3.selection.prototype.moveToFront = function () {
      return this.each(function () {
        this.parentNode.appendChild(this);
      });
    };

    // window.onunload = function () {
    //   devTools.close();
    // };

    //-------------------------------------TEST FUNCTION----------------------------------//
    function selectYear(date: any) {
      document.getElementById("loader").style.display = "block";
      d3.select("#contents").style("opacity", "0");

      d3.timeout(function () {
        updateGapminder(date);
      }, 50);
    }

    function updateGapminder(date: any) {
      this.properties.DefaultDatasetChoice = date;

      $("#headers").empty();
      $("#contentArea").empty();
      d3.select("#contentArea")
        .append("tr")
        .attr("class", "clusterize-no-data")
        .append("td")
        .text("Loading data...");

      $("#DatasetChoices").html(date + " <span class='caret'></span>");

      data = new Data(this.properties, _this.owfCommonService);
      this.json = data.json;
      this.dimensions = data.dimensions;

      this.currYear = this.dimensions.dateMin;
      this.topYear = this.dimensions.dateMin;

      // Update timeSlider.
      // Create a timescale for year slider.
      this.timeScale.domain([this.dimensions.dateMin, this.dimensions.dateMax]);
      this.dateArray = buildDateArray();
      // If the last data in the array isn't the last possible date add the last date to the end of the array.
      if (this.dateArray[this.dateArray.length - 1].getTime() !== this.dimensions.dateMax.getTime()) {
        this.dateArray.push(this.dimensions.dateMax);
      }
      dateLabel.text(this.formatDate(this.timeScale.ticks()[0]));

      var slidertext = g.selectAll("text").data(this.timeScale.ticks(getMaxXTicks(width, dateText.width)));
      slidertext.exit().remove();
      slidertext.enter().append("text");
      slidertext
        .attr("x", function (d) {
          return _this.timeScale(d);
        })
        .attr("text-anchor", "middle")
        .text((d: any) => this.formatDate(d));


      this.handleText.attr("transform", "translate(" + (this.timeScale(this.getClosest(this.currYear)) + ",-8)"));
      // UPDATE LEGEND:
      $("#legend").empty();
      legendData = getGroupingNames(this.json);
      addLegend(legendData);

      // UPDATE SELECTION BAR:
      $("#providerNames").empty();
      _this.nameOptions = getIndividualDots(this.json);

      // UPDATE PATH:
      this.pathData = [];
      if (this.properties.TracerNames !== "*" && this.properties.TracerNames !== "") {
        this.pathJSON = specificPathData(this.json.data);
      } else {
        this.pathJSON = this.json.data;
      }
      nested = this.nest(this.interpolatePath(this.dimensions.dateMin), this.pathData);
      addTracerPath(nested); // path is missing???

      this.pauseButton();
      this.displayYear(this.dimensions.dateMin);

      // update path here instead !!!
      if (!this.tracer) {
        document.getElementById("tracerButton").innerHTML = "Turn Tracer On";
      }

      d3.selectAll(".dot").remove();
      var data = this.interpolateData(this.dimensions.dateMin);
      addDots();
    }

    //---------------Various accessors that specify the four dimensions of data to visualize.-------------------
    /**
     * Getter function for data point color.
     */
    function color(d: any) { return d.color; }

    /**
     * Getter function for data point date.
     */
    function date(d: any) { return d.year; }

    //----------------------------Helper Functions that manipulate strings for d3.select() purposes-------------------------

    /**
     * Converts the string into a selector name.
     * ex: 'Denver Water' -> '.Denver.Water'
     */
    function toID(inputString: any) {
      var string = inputString.split(" ");
      var returnThis = "";
      for (var i = 0; i < string.length - 1; i++) {
        if (_this.checkForSymbol(string[i]) !== "") {
          returnThis = returnThis + string[i].replace(/[^A-Za-z0-9]/g, '') + "";
        }
      }
      returnThis = returnThis + string[string.length - 1].replace(/[^A-Za-z0-9]/g, '');
      return returnThis;
    }

    /**
     * Converts the string into a selector name.
     * ex: 'Denver Water' -> '.Denver.Water'
     */
    function pathClassSelector(inputString: any) {
      var string = inputString.split(" ");
      var returnThis = ".T";
      for (var i = 0; i < string.length - 1; i++) {
        if (_this.checkForSymbol(string[i]) !== "") {
          returnThis = returnThis + string[i]//.replace(/[^A-Za-z0-9]/g, '') + ".";
        }
      }
      returnThis = returnThis + string[string.length - 1].replace(/[^A-Za-z0-9]/g, '');
      return returnThis.toString();
    }

    function expandPropertyValue(propValue: any, properties: any) {
      var searchPosition = 0,
        delimStart = "${",
        delimEnd = "}";
      var b = "";
      while (searchPosition < propValue.length) {
        var positionStart = propValue.indexOf(delimStart),
          positionEnd = propValue.indexOf(delimEnd),
          propName = propValue.substr((positionStart + 2), ((positionEnd - positionStart) - 2)),
          propValue = properties[propName];

        if (positionStart === -1) {
          return b;
        }

        b = propValue.substr(0, positionStart) + propValue + propValue.substr(positionEnd + 1, propValue.length);
        searchPosition = positionStart + propValue.length;
        propValue = b;
      }
      return b;
    }

  }

  /**
   * Called when clicking Turn Annotations On/ Turn Annotations Off.
   * Either displays the annotation shapes on the canvas or hides them.
   */
  public annotationsButton() {
    var elem = document.getElementById("annotationsButton");
    if (elem.innerHTML === "Turn Annotations On") {
      this.properties.AnnotationShapes.toUpperCase() === "ON";
      if ($("annotationText").length) {
        this.annotationText.attr("fill-opacity", 1).on("mouseover",
        this.mouseoverAnnotation.bind(this));
      }
      d3.selectAll(".annotationShape").attr("stroke-opacity", 1).on("mouseover",
      this.mouseoverAnnotation.bind(this));
      elem.innerHTML = "Turn Annotations Off";
    } else {
      this.properties.AnnotationShapes.toUpperCase() === "OFF";
      if ($("annotationText").length) { this.annotationText.attr("fill-opacity", 0).on("mouseover", null); }
      d3.selectAll(".annotationShape").attr("stroke-opacity", 0).on("mouseover", null);
      elem.innerHTML = "Turn Annotations On";
    }
  }

  /**
   * Callback Function: Called when clicking on back button.
   * Displays the animation one year/date back.
   * Disables pause button.
   * Enables play button.
   */
  public backButton() {
    var _this = this;
    this.currYear = this.roundDate(this.currYear);
    this.decrementDate(this.currYear);
    (<HTMLInputElement>document.getElementById("pause")).disabled = true;
    (<HTMLInputElement>document.getElementById("play")).disabled = false;
    (<HTMLInputElement>document.getElementById("forward")).disabled = false;
    if (this.currYear >= this.dimensions.dateMin) {
      this.stopAnimation();
      setTimeout(function () {
        _this.displayYear(_this.currYear);
      }, 100);
    } else {
      this.displayYear(this.dimensions.dateMin);
      (<HTMLInputElement>document.getElementById("back")).disabled = true;
    }
  }

  /**
   * Removes symbols form string, returns the string with no symbols.
   * @param string The string to remove symbols from.
   * @returns A string with no symbols.
   */
  public checkForSymbol(string: any) {
    return string.replace(/[^A-Za-z0-9]/g, '');
  }

  /**
   * 
   * @param number 
   * @returns 
   */
  public checkMin(number: any) {
    if (number < 0) {
      d3.select(".title")
        .append("text")
        .style("color", "red")
        .style("font-size", "12px")
        .text('Error: log axis with negative values');
      throw 'Error: log axis with negative values';
    }
    if (number < 1) {
      number = 1;
    }
    return number;
  }

  /**
   * 
   * @param val 
   * @returns 
   */
  public checkXValue(val: any) {
    if (this.properties.XMax) {
      if (val > this.properties.XMax) {
        val = this.properties.XMax;
      }
    }
    if (this.properties.XMin) {
      if (val < this.properties.XMin) {
        val = this.properties.XMin;
      }
    }
    return val;
  }

  /**
   * 
   * @param val 
   * @returns 
   */
  public checkYValue(val: any) {
    if (this.properties.YMax) {
      if (val > this.properties.YMax) {
        val = this.properties.YMax;
      }
    }
    if (this.properties.YMin) {
      if (val < this.properties.YMin) {
        val = this.properties.YMin;
      }
    }
    return val;
  }

  /**
   * Depending on precision units from configuration file, decrements the date.
   * @param date 
   */
  public decrementDate(date: any) {

    switch (this.precisionUnit) {
      case "Year":
        date.setFullYear(date.getFullYear() - this.precisionInt);
        break;
      case "Month":
        date.setMonth(date.getMonth() - this.precisionInt);
        break;
      case "Day":
        date.setDate(date.getDate() - this.precisionInt);
        break;
      case "Hour":
        date.setHours(date.getHours() - this.precisionInt);
        break;
      case "Minute":
        date.setMinutes(date.getMinutes() - this.precisionInt);
        break;
      case "Second":
        date.setSeconds(date.getSeconds() - this.precisionInt);
        break;
      default:
        break;
    }
  }

  /**
   * Displays animation for data of specified year.
   * @param date The year to display data for.
   */
  public displayYear(date: any) {

    date.setHours(0, 0, 0); // This WILL prove to be an issue if dealing with hourly time.
    if (date <= this.dimensions.maxPopulatedDate) {
      // Display annotations.
      if (this.annotationsData) {
        if (this.getAnnotations(this.inputFileFormat(date))) {
          var d = this.getAnnotations(this.inputFileFormat(date));
          this.annotations.html(
            // "<p class='datatable' style='text-decoration:underline;'><strong> Annotations </strong></p>" +
            "<p class='datatable' style='font-weight:bold;'> Date: " + this.inputFileFormat(date) + "</p>" +
            "<p class='datatable' style='font-weight:bold; display:inline;'>" + d.Title + ": " +
            "<p class='datatable'style='display:inline;'>" + d.Description + "</p>"
          )
        }
      }
      this.dot.data(this.interpolateData(date), this.key).call(this.position.bind(this))
      if (this.displayAll === true) {
        this.dot.sort(this.order.bind(this));
      }
      this.handle.attr("transform", "translate(" + (this.timeScale(this.getClosest(date)) + ", 5)"));
      this.handle.select('text').text(Math.round(date));
      var handleFormat = this.formatHandleText();
      this.handleText.text(handleFormat(this.getClosest(date))).attr("transform", "translate(0" + (this.timeScale(this.getClosest(date)) + ", -8)"));
      d3.select("#currentDateDiv").selectAll("text").text(this.formatDate(this.roundDate(date)));
      if (date >= this.topYear) {
        this.updatePath(this.nest(this.interpolatePath(date), this.pathData));
      }
      if (date > this.topYear) {
        this.topYear = date;
      }
      this.currYear = new Date(date);
    } else {
      this.stopAnimation();
    }

  }

  /**
   * Converts the string into a selector name.
   * ex: 'Denver Water' -> '.Denver.Water'
   */
  public dotClassSelector(inputString: any) {
    var string = inputString.split(" ");
    var returnThis = ".D";
    for (var i = 0; i < string.length - 1; i++) {
      if (this.checkForSymbol(string[i]) !== "") {
        returnThis = returnThis + string[i].replace(/[^A-Za-z0-9]/g, '')// + ".";
      }
    }
    returnThis = returnThis + string[string.length - 1].replace(/[^A-Za-z0-9]/g, '');
    return returnThis.toString();
  }

  /**
   *Converts the string into an id selector name
    *ex: 'Denver Water' -> '.Denver.Water'
    */
  public dotIDSelector(inputString: any) {
    var string = inputString.split(" ");
    var returnThis = "#D";
    for (var i = 0; i < string.length - 1; i++) {
      if (this.checkForSymbol(string[i]) !== "") {
        returnThis = returnThis + string[i].replace(/[^A-Za-z0-9]/g, '') + "";
      }
    }
    returnThis = returnThis + string[string.length - 1].replace(/[^A-Za-z0-9]/g, '');
    return returnThis.toString();
  }

  /**
   * Returns a time format that is in relation to the precision units specified
   * in the configuration file.
   * @returns 
   */
  public formatHandleText() {
    var format: any;
    switch (this.precisionUnit) {
      case "Year":
        format = d3.timeFormat("%Y");
        return format;
      case "Month":
        format = d3.timeFormat("%B-%Y");
        return format;
      case "Day":
        format = d3.timeFormat("%B-%d");
        return format;
      case "Hour":
        format = d3.timeFormat("%H:%M");
        return format;
      case "Minute":
        format = d3.timeFormat("%H:%M");
        return format;
      case "Second":
        format = d3.timeFormat("%H:%M:%S");
        return format;
      default:
        break;
    }
  }

  /**
   * Callback Function: Called when clicking on the forward button.
   * Displays the animation one year/date forward.
   * Disables pause button.
   * Enables play button.
   */
  public forwardButton() {
    var _this = this;
    (<HTMLInputElement>document.getElementById("back")).disabled = false;
    if (this.currYear <= this.dimensions.maxPopulatedDate) {
      this.incrementDate(this.currYear);
      (<HTMLInputElement>document.getElementById("pause")).disabled = true;
      (<HTMLInputElement>document.getElementById("play")).disabled = false;
      if (this.currYear <= this.dimensions.maxPopulatedDate) {
        this.stopAnimation();
        setTimeout(function () {
          _this.displayYear(_this.currYear);
        }, 100);
      } else {
        this.displayYear(this.dimensions.maxPopulatedDate);
        (<HTMLInputElement>document.getElementById("forward")).disabled = true;
        (<HTMLInputElement>document.getElementById("play")).disabled = true;
      }
    }
  }

  /**
   * Checks to see if annotations exist for current time frame.
   * @param year 
   * @returns The annotations for the supplied year, if found.
   */
  public getAnnotations(year: any) {
    if (this.annotationsData.GeneralAnnotations[year] !== "undefined") {
      return this.annotationsData.GeneralAnnotations[year];
    } else {
      return null;
    }
  }

  /**
   * Parses through dateArray to return value closest to date.
   * @param date Date object which we want the closest date to.
   * @returns The closest date to the supplied date object.
   */
  public getClosest(date: any) {
    var close: any;
    var distance: any;
    for (var i = 0; i < this.dateArray.length; i++) {
      if (this.timeDiff(date, this.dateArray[i]) < distance || distance === undefined) {
        distance = this.timeDiff(date, this.dateArray[i]);
        close = this.dateArray[i];
      }
    };
    return close;
  }

  /**
   * Calculates total elapsed time between two time points, set at 1.33 seconds between each year.
   * @param startDate The starting year.
   * @param endDate The ending year.
   * @returns 
   */
  public getTimeInterpolate(startDate: any, endDate: any) {
    var distance = this.timeScale(endDate) - this.timeScale(startDate);
    return distance * this.visSpeed;
  }

  /**
   * Depending on precision units from the Config file, increments the date.
   * @param date The current date.
   */
  public incrementDate(date: any) {
    switch (this.precisionUnit) {
      case "Year":
        date.setFullYear(date.getFullYear() + this.precisionInt);
        break;
      case "Month":
        date.setMonth(date.getMonth() + this.precisionInt);
        break;
      case "Day":
        date.setDate(date.getDate() + this.precisionInt);
        break;
      case "Hour":
        date.setHours(date.getHours() + this.precisionInt);
        break;
      case "Minute":
        date.setMinutes(date.getMinutes() + this.precisionInt);
        break;
      case "Second":
        date.setSeconds(date.getSeconds() + this.precisionInt);
        break;
      default:
        break;
    }
  }

  /**
   * Returns an object containing one interpolated data point for the current year.
   * @param date Current year to get data for.
   * @returns An object with interpolated data point properties.
   */
  public interpolateData(date: any) {
    var _this = this;
    return _this.json.data.map(function (d: any) {
      return {
        // X-Axis.
        xVar: _this.interpolateValues(d[_this.variables.XAxis], date),
        // Y-Axis.
        yVar: _this.interpolateValues(d[_this.variables.YAxis], date),
        // Size of Dot.
        size: _this.interpolateValues(d[_this.variables.Sizing], date),
        // Original data, un-interpolated.
        xVarRaw: _this.interpolateValues(d[_this.variables.XAxis], _this.getClosest(date)),
        yVarRaw: _this.interpolateValues(d[_this.variables.YAxis], _this.getClosest(date)),
        sizeRaw: _this.interpolateValues(d[_this.variables.Sizing], _this.getClosest(date)),
        // Color of Dot.
        color: d[_this.variables.Grouping],
        // Name.
        name: d[_this.variables.Label],
        // Year.
        year: date
      };
    });
  }

  /**
   * Returns an object containing one interpolated data point for the current year.
   * @param year The year to get data for.
   * @returns 
   */
  public interpolatePath(year: any) {
    var _this = this;
    return this.pathJSON.map(function (d: any) {

      var x = _this.checkXValue(_this.interpolateValues(d[_this.variables.XAxis], year));
      var y = _this.checkYValue(_this.interpolateValues(d[_this.variables.YAxis], year));
      if (_this.properties.XAxisScale.toUpperCase() === "LOG") x = _this.checkMin(x);
      if (_this.properties.YAxisScale.toUpperCase() === "LOG") y = _this.checkMin(y);

      return {
        // X-Axis.
        xVar: x,
        // Y-Axis.
        yVar: y,
        // Size of Dot.
        size: _this.interpolateValues(d[_this.variables.Sizing], year),
        // Color of Dot.
        color: d[_this.variables.Grouping],
        // Name.
        name: d[_this.variables.Label],
        // Year.
        year: year
      };
    });
  }

  /**
   * Returns an interpolated value for the current year.
   * @param values Array of [year, data] pairs.
   * @param year Current year for which the interpolated data point corresponds to.
   * @returns 
   */
  public interpolateValues(values: any, year: any) {
    /** A bisector for interpolating data if sparsely-defined. */
    var bisect = d3.bisector((d) => d[0]);

    var i = bisect.left(values, year, 0, values.length - 1),
      a = values[i];

    if (i > 0) {
      var b = values[i - 1],
        t = (year - a[0]) / (b[0] - a[0]);
      return a[1] * (1 - t) + b[1] * t;
    }

    return a[1];
  }

  /**
   * Getter for the name of a data point object.
   * @param d The data point object.
   * @returns The name property of the data point object.
   */
  public key(d: any) { return d.name; }

  /**
   * Called when clicking on a selection on the legend.
   * Displays only dots related to that specific label.
   * @param d The data point object.
   * @param selectMultiple 
   */
  public legendClick(d: any, selectMultiple: any) {
    var _this = this;
    this.displayAll = false;
    this.selectedGroup = d;
    if (!selectMultiple) {
      d3.selectAll("path.tracer")
      .style("stroke-opacity", 0);

      d3.selectAll(".dot")
      .style("fill-opacity", ".2")
      .attr("stroke-width", "0")
      .attr("display", "false");

      d3.selectAll("text")
      .style("font-weight", "normal")
    }
    d3.selectAll("text" + _this.dotClassSelector(d)).style("font-weight", "bold");
    setTimeout(function () {
      d3.selectAll(_this.dotClassSelector(d))
      .style("fill-opacity", "1")
      .attr("stroke-width", function () {
        if (d3.select(this).attr("checked") !== "true") {
          return 1;
        } else {
          return 4;
        }
      }).attr("display", "true");

      if (_this.tracer) {
        d3.selectAll("path" + _this.pathIDSelector(d)).style("stroke-opacity", .75);
      }
    }, 100);

  }

  /**
   * Determines whether the radius of a dot is larger than the minimum of 3 pixels.
   * @param value Number to check.
   * @returns A radius whose value is at least 3 pixels in width.
   */
  public minRadius(value: any) {
    return value < 3.0 ? 3.0 : value;
  }

  /**
   * Callback Function: Called when user mouse's over an annotation shape on the canvas.
   * Displays a tooltip with the annotation information at mouseover event.
   * @param event Default event object.
   * @param d The data point object.
   */
  public mouseoverAnnotation(event: any, d: any) {
    // The way a popup like this is created does not take dialogs, or any kind of
    // different z-indexed element into account. Because of this, the mouseover
    // popup shows up behind the dialog.
    this.tip.transition().duration(0);
    this.tip.style('top', (event.pageY - 20) + 'px')
    .style('left', (event.pageX + 13) + 'px')
    .style('display', 'block')
    .html(d.Annotation);
  }

  /**
   * Adds data to the array and then nests that data by name.
   * https://github.com/d3/d3-3.x-api-reference/blob/master/Arrays.md#nest
   * @param data Object containing the data.
   * @param array Array containing data.
   * @returns 
   */
  public nest(data: any, array: any) {
    for (var i = 0; i < data.length; i++) {
      array.push(data[i]);
    }

    var group = d3.group(array, function (d: any) { return d.name; });
    return group;
  }

  /**
   * On each change of the select2 dropdown, deselect all dots, then iterate through
   * the updated string array and highlight each one.
   * @param event 
   */
  public onSelectValueChange(newSelectValue: string[]): void {
    d3.selectAll('.dot')
    .style('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('stroke-opacity', function () {
      if (d3.select(this).attr("display") === "true") {
        return 1;
      } else {
        return 0;
      }
    })
    .attr("checked", "false");

    for (let value of newSelectValue) {
      d3.select(this.dotIDSelector(value))
      .style('stroke', 'yellow')
      .attr('stroke-width', function () {
        if (d3.select(this).attr("display") === "true") {
          return 4;
        } else {
          return 0;
        }
      })
      .attr('stroke-opacity', .5)
      .attr("checked", "true");
    }
    
  }

  /**
  * Opens an attribute (data) table Dialog with the necessary configuration data.
  * @param geoLayerId The geoLayerView's geoLayerId to be matched so the correct
  * features are displayed.
  */
  public openDataTableLightDialog(): void {

    var windowID = this.geoLayer.geoLayerId + '-gapminder-dialog-data-table-light';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    Papa.parse(this.data.configProps.DataFileName, {
      delimiter: ",",
      download: true,
      comments: "#",
      skipEmptyLines: true,
      header: true,
      complete: (result: any, file: any) => {

        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
          allFeatures: result.data,
          geoLayer: this.geoLayer,
          geoMapName: this.owfCommonService.getGeoMapName(),
          mapConfigPath: this.owfCommonService.getMapConfigPath(),
          windowID: windowID
        }
        const dialogRef: MatDialogRef<DialogDataTableLightComponent, any> = this.dialog.open(DialogDataTableLightComponent, {
          data: dialogConfig,
          hasBackdrop: false,
          // Giving the panelClass a name of `mat-elevation-zX` tells Angular Material
          // to create a shadowed background behind the dialog. The higher X is (1-20),
          // the deeper the shadow becomes.
          panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
          height: "750px",
          width: "910px",
          minHeight: "275px",
          minWidth: "675px",
          maxHeight: "90vh",
          maxWidth: "90vw"
        });
        this.windowManager.addWindow(windowID, WindowType.TABLE);
      }
    });

    
  }

  /**
  * When the info button by the side bar slider is clicked, it will either open
  * a documentation Dialog for the selected geoLayerViewGroup or geoLayerView.
  */
  public openDocDialog(): void {
    var docPath = this.properties.DocFilePath;

    var windowID = this.geoLayer.geoLayerId + '-dialog-doc';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    var text: boolean, markdown: boolean, html: boolean;
    // Set the type of display the Mat Dialog will show
    if (docPath.includes('.txt')) text = true;
    else if (docPath.includes('.md')) markdown = true;
    else if (docPath.includes('.html')) html = true;

    this.owfCommonService.getPlainText(this.owfCommonService.buildPath(IM.Path.gP, [docPath]), IM.Path.dP)
      .pipe(take(1))
      .subscribe((doc: any) => {

        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
          doc: doc,
          docPath: docPath,
          docText: text,
          docMarkdown: markdown,
          docHtml: html,
          fullMarkdownPath: this.owfCommonService.getFullMarkdownPath(),
          geoId: this.geoLayer.geoLayerId,
          geoName: this.geoLayer.name,
          mapConfigPath: this.owfCommonService.getMapConfigPath(),
          windowID: windowID
        }

        var dialogRef: MatDialogRef<DialogDocComponent, any> = this.dialog.open(DialogDocComponent, {
          data: dialogConfig,
          hasBackdrop: false,
          panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
          height: "725px",
          width: "700px",
          minHeight: "240px",
          minWidth: "550px",
          maxHeight: "90vh",
          maxWidth: "90vw"
        });
        this.windowManager.addWindow(windowID, WindowType.DOC);
      });
  }

  /**
   * Ensures the smallest dots are above larger dots in the visualization.
   * @param a First svg dot.
   * @param b Second svg dot.
   * @returns The dots in order of their radius size, with larger on bottom.
   */
  public order(a: any, b: any) {
    return this.radius(b) - this.radius(a);
  }

  /**
   * Converts the string into an ID selector name.
   * @param inputString String to be converted.
   * @returns ID selector name.
   */
  public pathIDSelector(inputString: any) {
    var string = inputString.split(" ");
    var returnThis = "#T";
    for (var i = 0; i < string.length - 1; i++) {
      if (this.checkForSymbol(string[i]) !== "") {
        returnThis = returnThis + string[i].replace(/[^A-Za-z0-9]/g, '') + "";
      }
    }
    returnThis = returnThis + string[string.length - 1].replace(/[^A-Za-z0-9]/g, '');
    return returnThis.toString();
  }

  /**
   * Called when clicking on pause button.
   * Pauses the animation.
   * Disables pause button.
   * Enables play button.
   */
  public pauseButton() {
    this.stopAnimation();
    (<HTMLInputElement>document.getElementById("pause")).disabled = true;
    (<HTMLInputElement>document.getElementById("play")).disabled = false;
  }

   /**
    * Function which plays the animation starting from Config.currYear to Config.yearMax.
    */
  public playAnimation() {
    // Start transition.
    var transitionFunction = this.mainSVG.transition()
    // Call getTimeInterpolate to calculate amount of time between years transition.
    .duration(this.getTimeInterpolate(this.currYear, this.dimensions.maxPopulatedDate)) 
    .ease(d3.easeLinear)
    .tween("year", this.tweenYear.bind(this))
    .on("end", function () {
      var end = true;
      (<HTMLInputElement>document.getElementById("forward")).disabled = true;
      (<HTMLInputElement>document.getElementById("play")).disabled = true;
    });
  }

  /**
   * Callback Function: Called when clicking on play button.
   * Starts the animation.
   * Disables play button.
   * Enables pause button.
   */
  public playButton() {
    this.playAnimation();
    (<HTMLInputElement>document.getElementById("play")).disabled = true;
    (<HTMLInputElement>document.getElementById("pause")).disabled = false;
    (<HTMLInputElement>document.getElementById("back")).disabled = false;
  }

  /**
   * Positions the dots on the screen and sets the dots radius based off data for current year
   *
   *@param dot - the svg element 'dot' that gets positioned
    */
  public position(dot: any) {
    var _this = this;
    dot.attr("cx", function (d: any) {
      if (_this.properties.XAxisScale.toUpperCase() === "LOG") {
        return _this.xScale(_this.checkMin(_this.checkXValue(_this.getXVar(d))));
      } else {
        return _this.xScale(_this.checkXValue(_this.getXVar(d)));
      }
    })
    .attr("cy", function (d: any) {
      if (_this.properties.YAxisScale.toUpperCase() === "LOG") {
        return _this.yScale(_this.checkMin(_this.checkYValue(_this.getYVar(d))));
      } else {
        return _this.yScale(_this.checkYValue(_this.getYVar(d)));
      }
    })
    .attr("r", function(d: any) {return _this.minRadius(_this.radiusScale(_this.radius(d)))});
  }

  /**
  * Getter for dot size in data point object.
  * @param d The data point object.
  * @returns The dot size of the data point.
  */
  public radius(d: any) { return d.size; }

  /**
   * Callback Function: Called when clicking on replay button.
   * Restarts the animation from Config.yearMin.
   * Disables play button.
   * Enables pause button.
   */
  public replayButton() {
    var _this = this;
    this.stopAnimation();
    (<HTMLInputElement>document.getElementById("play")).disabled = true;
    (<HTMLInputElement>document.getElementById("pause")).disabled = false;
    (<HTMLInputElement>document.getElementById("back")).disabled = false;
    (<HTMLInputElement>document.getElementById("forward")).disabled = false;
    // NOTE: This might be a larger scoped variable?
    var end = false;
    setTimeout(function () {
      _this.replay()
    }, 100);
  }

  /**
   * Called separately to create a synchronous ordering of things, this way the
   * variables are properly configured before starting the animation again.
   */
  public replay() {
    this.pathData = [];
    this.updatePath(this.nest(this.interpolatePath(this.dimensions.dateMin), this.pathData));
    this.topYear = this.dimensions.dateMin;
    this.currYear = this.dimensions.dateMin;
    this.playAnimation();
  }

  /**
   * 
   * @param date 
   * @returns 
   */
  public roundDate(date: any) {

    switch (this.precisionUnit) {
      case "Year":
        var returnThis = new Date(date);
        var currMonth = date.getMonth();
        returnThis.setMonth(0);
        returnThis.setDate(1);
        returnThis.setHours(0);
        returnThis.setMinutes(0);
        returnThis.setSeconds(0);
        if (currMonth > 5) {
          returnThis.setFullYear(date.getFullYear() + 1);
        }
        return returnThis;
      case "Month":
        var currDay = date.getDate();
        date.setDate(1);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        if (currDay > 15) {
          date.setMonth(date.getMonth() + 1);
        }
        return date;
      case "Day":
        var currHour = date.getHours();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        if (currHour > 12) {
          date.setDate(date.getDate() + 1);
        }
        return date;
      case "Hour":
        var currMinute = date.getMinutes();
        date.setMinutes(0);
        date.setSeconds(0);
        if (currMinute > 30) {
          date.setHours(date.getHours() + 1);
        }
        return date;
      case "Minute":
        var currSecond = date.getSeconds();
        date.setSeconds(0);
        if (currSecond > 30) {
          date.setMinutes(date.getMinutes() + 1);
        }
        return date;
      // NOTE: NOT READY TO ROUND FOR SECONDS OR MILLISECONDS.
      default:
        break;
    }
  }

  /**
   * Callback Function: Called when clicking on Select All button. Displays all dots.
   */
  public selectAllButton() {

    this.displayAll = true;

    d3.selectAll(".dot")
    .style("fill-opacity", "1")
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 1)
    .attr("display", "true");

    this.dot.sort(this.order.bind(this));
    d3.selectAll("text").style("font-weight", "normal")
    if (this.tracer) {
      d3.selectAll("path.tracer").style("stroke-opacity", .75);
    }
    this.firstClick = true;
  }

  /**
   * 
   */
  public setGapminderDetails(): void {
    if (this.owfCommonService.getGapminderConfigPath() === '') {
      
    }
  }

  /**
   * Resets the speed of the visualization when moving the speed slider.
   * @param value The value from the speed slider, ranging from 0 - 100.
   */
  public setSpeed(value: any) {

    var speedScale = d3.scaleLinear()
    .domain([100, 0])
    .range([10000, 100000]);

    var mill = speedScale(value);
    var len = this.timeScale.range()[1] - this.timeScale.range()[0];
    this.visSpeed = mill / len;

    if ((<HTMLInputElement>document.getElementById("play")).disabled === true) {
      this.stopAnimation();
      this.playAnimation();
    }
  }

  /**
   * Pauses animation.
   */
  public stopAnimation() {
    this.transition = true;
    // Pause transition.
    this.mainSVG.transition()
    .duration(0);
  }

   /**
    * Returns an integer representing the difference between two dates.
    * @param date1 - Start date object.
    * @param date2 - End date object.
    * @returns 
    */
  public timeDiff(date1: any, date2: any) {
    return Math.abs(date2.getTime() - date1.getTime());
  }

   /**
    * Callback Function: Called when clicking Turn Tracer On/ Turn Tracer Off.
    * Either displays all tracers or turns them all off.
    */
  public tracerButton() {
     var elem = document.getElementById("tracerButton");
     if (elem.innerHTML === "Turn Tracer On") {
       // Turn on display for all tracers
       if (this.displayAll) {
         d3.selectAll("path.tracer").style("stroke-opacity", .75);
       } else {
         d3.selectAll("path" + this.pathIDSelector(this.selectedGroup)).style("stroke-opacity", .75);
       }
       this.tracer = true;
       elem.innerHTML = "Turn Tracer Off";
     } else {
       // Turn off display for tracers
       d3.selectAll("path.tracer").style("stroke-opacity", 0);
       this.tracer = false;
       elem.innerHTML = "Turn Tracer On";
     }
  }

   /**
    * Interpolates through years currYear - yearMax and calls display year on each year value.
    * @returns 
    */
  public tweenYear() {
    var _this = this;
    var interpolateDate = d3.interpolateDate(this.currYear, this.dimensions.maxPopulatedDate);
    return function (t: any) {
      if (t === 1) {
        _this.transition = true;
      }
      _this.displayYear(interpolateDate(t));
    };
  }

   /**
    * Update all path data with new information.
    * @param newData Array of updated data.
    */
  public updatePath(newData: any) {

    d3.select("#dataline").selectAll("path")
    // Update path with newData.
    .data(newData)
    .attr("d", (d: any) => this.line(d[1]));
  }

  /**
   * Getter for x-variable in a data point object.
   * @param d The data point object.
   * @returns The x-variable property from the data point object.
   */
  public getXVar(d: any) { return d.xVar; }

  /**
   * Getter for y-variable in a data point object.
   * @param d The data point object.
   * @returns The y-variable property from the data point object.
   */
  public getYVar(d: any) { return d.yVar; }

}
