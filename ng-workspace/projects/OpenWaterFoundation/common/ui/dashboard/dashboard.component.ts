import { Component,
          OnDestroy }       from '@angular/core';
import { ActivatedRoute }   from '@angular/router';

import { Subscription }     from 'rxjs';

import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';



@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnDestroy {

  /**
   * 
   */
  dashboardConf: IM.DashboardConf;
  /**
   * 
   */
  dashboardConfigPathSub$: Subscription;

  chartObject = {
    downloadFileName: '${featureAttribute:wdid}-diversions.csv',
    graphFilePath: '/data-ts/0300911.DWR.DivTotal.Month.stm',
    mapConfigPath: 'data-maps/map-configuration-files/',
    TSID_Location: '0300911.DWR.DivTotal.Month',
    featureProperties: {
      division: 1,
      waterDistrict: 3,
      county: "LARIMER",
      stationName: "LARIMER COUNTY DITCH",
      dataSourceAbbrev: "NWSDR",
      dataSource: "Cooperative SDR Program of CDWR & NCWCD",
      waterSource: "CACHE LA POUDRE RIVER",
      gnisId: "00205018",
      streamMile: 53.32,
      abbrev: "LACDITCO",
      usgsStationId: "",
      stationStatus: "Active",
      stationType: "Diversion Structure",
      structureType: "Ditch",
      measDateTime: "2020-06-02T13:00:00.0000000-06:00",
      parameter: "DISCHRG",
      stage: null,
      measValue: 348.21,
      units: "CFS",
      flagA: "",
      flagB: "U",
      latitude: 40.656563,
      longitude: -105.185363,
      wdid: "0300911",
      moreInformation: "https://dwr.state.co.us/Tools/Stations/LACDITCO",
      stationPorStart: "2015-11-06T00:00:00.0000000-07:00",
      stationPorEnd: "2020-06-02T00:00:00.0000000-06:00",
      thirdParty: "False",
      timeTest: 1645465265000
    },
    graphTemplateObject: {
      product : {
        properties : {
          CurrentDateTime : "None",
          CurrentDateTimeColor : "Green",
          Enabled : "True",
          LayoutNumberOfCols : "1",
          LayoutNumberOfRows : "1",
          LayoutType : "Grid",
          MainTitleFontName : "Arial",
          MainTitleFontSize : "20",
          MainTitleFontStyle : "Plain",
          MainTitleString : "${featureAttribute:wdid} Total Diversion",
          OutputFile : "C:\\temp\\tmp.jpg",
          ProductID : "Product1",
          ProductName : "",
          ProductType : "Graph",
          ShowDrawingAreaOutline : "False",
          SubTitleFontName : "Arial",
          SubTitleFontSize : "10",
          SubTitleFontStyle : "Plain",
          SubTitleString : "",
          TotalHeight : "400",
          TotalWidth : "600"
        },
        subProducts : [ {
          properties : {
            AnnotationProvider : "",
            BottomXAxisLabelFontName : "Arial",
            BottomXAxisLabelFontSize : "10",
            BottomXAxisLabelFontStyle : "Plain",
            BottomXAxisMajorGridColor : "None",
            BottomXAxisMinorGridColor : "None",
            BottomXAxisTitleFontName : "Arial",
            BottomXAxisTitleFontSize : "12",
            BottomXAxisTitleFontStyle : "Plain",
            BottomXAxisTitleString : "",
            DataLabelFontName : "Arial",
            DataLabelFontSize : "10",
            DataLabelFontStyle : "Plain",
            DataLabelFormat : "",
            DataLabelPosition : "Right",
            Enabled : "True",
            GraphType : "Line",
            LayoutYPercent : "",
            LeftYAxisDirection : "Normal",
            LeftYAxisIgnoreUnits : "false",
            LeftYAxisLabelFontName : "Arial",
            LeftYAxisLabelFontSize : "10",
            LeftYAxisLabelFontStyle : "Plain",
            LeftYAxisLabelPrecision : "1",
            LeftYAxisLegendPosition : "BottomLeft",
            LeftYAxisMajorGridColor : "lightgray",
            LeftYAxisMajorTickColor : "None",
            LeftYAxisMax : "Auto",
            LeftYAxisMin : "Auto",
            LeftYAxisMinorGridColor : "None",
            LeftYAxisTitleFontName : "Arial",
            LeftYAxisTitleFontSize : "12",
            LeftYAxisTitleFontStyle : "Plain",
            LeftYAxisTitlePosition : "LeftOfAxis",
            LeftYAxisTitleRotation : "270",
            LeftYAxisTitleString : "ACFT",
            LeftYAxisType : "Linear",
            LeftYAxisUnits : "ACFT",
            LegendFontName : "Arial",
            LegendFontSize : "10",
            LegendFontStyle : "Plain",
            LegendFormat : "Auto",
            LegendPosition : "BottomLeft",
            MainTitleFontName : "Arial",
            MainTitleFontSize : "20",
            MainTitleFontStyle : "Plain",
            MainTitleString : "",
            RightYAxisDirection : "Normal",
            RightYAxisGraphType : "None",
            RightYAxisIgnoreUnits : "false",
            RightYAxisLabelFontName : "Arial",
            RightYAxisLabelFontSize : "10",
            RightYAxisLabelFontStyle : "Plain",
            RightYAxisLabelPrecision : "2",
            RightYAxisLegendPosition : "BottomRight",
            RightYAxisMajorGridColor : "None",
            RightYAxisMajorTickColor : "None",
            RightYAxisMax : "Auto",
            RightYAxisMin : "Auto",
            RightYAxisMinorGridColor : "None",
            RightYAxisTitleFontName : "Arial",
            RightYAxisTitleFontSize : "12",
            RightYAxisTitleFontStyle : "Plain",
            RightYAxisTitlePosition : "None",
            RightYAxisTitleRotation : "0",
            RightYAxisTitleString : "",
            RightYAxisType : "Linear",
            RightYAxisUnits : "",
            SelectedTimeSeriesLineWidth : "x2",
            SubTitleFontName : "Arial",
            SubTitleFontSize : "10",
            SubTitleFontStyle : "Plain",
            SubTitleString : "",
            TopXAxisLabelFontName : "Arial",
            TopXAxisLabelFontSize : "10",
            TopXAxisLabelFontStyle : "Plain",
            TopXAxisTitleFontName : "Arial",
            TopXAxisTitleFontSize : "12",
            TopXAxisTitleFontStyle : "Plain",
            ZoomEnabled : "True",
            ZoomGroup : "1"
          },
          data : [ {
            properties : {
              Color : "red",
              DataLabelFormat : "",
              DataLabelPosition : "Right",
              Enabled : "True",
              FlaggedDataSymbolStyle : "None",
              GraphType : "Line",
              LegendFormat : "Auto",
              LineStyle : "Solid",
              LineWidth : "1",
              SymbolSize : "0",
              SymbolStyle : "None",
              TSAlias : "${featureAttribute:wdid}-DivTotal",
              TSID : "${featureAttribute:wdid}.DWR.DivTotal.Month~StateMod~/data-ts/${featureAttribute:wdid}.DWR.DivTotal.Month.stm",
              XAxis : "Bottom",
              YAxis : "Left"
            }
          } ],
          annotations : [ ]
        } ]
      }
    }
  };

  /**
   * 
   * @param owfCommonService The injected Common library service.
   * @param route The injected ActivatedRoute for determining the correct URL and
   * Dashboard to be displayed.
   */
  constructor(private owfCommonService: OwfCommonService,
              private route: ActivatedRoute) {}


  /**
   * Called right after the constructor.
   */
  ngOnInit(): void {
    var id = this.route.snapshot.paramMap.get('id');
    var dashboardConfigPath = this.owfCommonService.getDashboardConfigPathFromId(id);

    this.dashboardConfigPathSub$ = this.owfCommonService
    .getJSONData(this.owfCommonService.getAppPath() + dashboardConfigPath)
    .subscribe((dashboardConfig: IM.DashboardConf) => {
      this.dashboardConf = dashboardConfig;
    });
  }

  /**
   * Called once, before the instance is destroyed.
   */
  ngOnDestroy(): void {
    this.dashboardConfigPathSub$.unsubscribe();
  }

  /**
   * Manipulates the style object given in the dashboard configuration file,
   * and adds in any default settings including the entire object if necessary.
   * @param style The style object to check.
   * @returns A style object that has had its properties verified.
   */
  setMatGridTileStyle(style: IM.WidgetTileStyle): any {
    // If no style object is provided, return the default object.
    if (!style) {
      return {
        backgroundColor: 'gray'
      }
    }

    return {
      backgroundColor: this.verify(style.backgroundColor, IM.Style.color)
    }
  }

  /**
   * Sets a style object's property to a default if it isn't provided in the dashboard
   * configuration file.
   * @param styleProp The style property to examine.
   * @param style The InfoMapper style type to differentiate types.
   */
  verify(styleProp: any, style: IM.Style): any {
    if (styleProp) {
      return styleProp;
    }
    // The property does not exist, so return a default value.
    else {
      switch (style) {
        case IM.Style.color: return 'gray';
      }
    }
  }

}
