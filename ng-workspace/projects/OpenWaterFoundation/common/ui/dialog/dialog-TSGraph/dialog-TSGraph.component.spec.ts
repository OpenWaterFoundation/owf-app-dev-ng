import { HttpClientModule }       from '@angular/common/http';
import { ComponentFixture,
          TestBed }               from '@angular/core/testing';

import { MatDialogModule,
          MatDialogRef,
          MAT_DIALOG_DATA }       from '@angular/material/dialog';


import { DialogTSGraphComponent } from './dialog-TSGraph.component';

xdescribe('DialogTSGraphComponent', () => {
  let tsGraphComponent: DialogTSGraphComponent;
  let fixture: ComponentFixture<DialogTSGraphComponent>;

  const dataObject = {
    data: {
      TSIDLocation: "Weld.DOLA.Population.Year",
      chartPackage: undefined,
      featureProperties: {
        co_fips: "123",
        county: "Weld",
        househo_20: "89849",
        pop_2010: "252825",
        shape_st_1: "10396211026",
        shape_st_2: "486242.951314",
        shape_star: "0",
        shape_stle: "0"
      },
      graphFilePath: "/data-ts/Weld.DOLA.Population.Year.dv",
      graphTemplate: {
        product: {
          properties: {
            CurrentDateTime: "None",
            CurrentDateTimeColor: "Green",
            Enabled: "True",
            LayoutNumberOfCols: "1",
            LayoutNumberOfRows: "1",
            LayoutType: "Grid",
            MainTitleFontName: "Arial",
            MainTitleFontSize: "20",
            MainTitleFontStyle: "Plain",
            MainTitleString: "Larimer County Total Population",
            OutputFile: "C:\\temp\\tmp.jpg",
            ProductID: "Product1",
            ProductName: "",
            ProductType: "Graph",
            ShowDrawingAreaOutline: "False",
            SubTitleFontName: "Arial",
            SubTitleFontSize: "10",
            SubTitleFontStyle: "Plain",
            SubTitleString: "",
            TotalHeight: "400",
            TotalWidth: "600"
          },
          subProducts: [
            {
              annotations: [],
              data: [
                {
                  properties: {
                    Color: "red",
                    DataLabelFormat: "",
                    DataLabelPosition: "Right",
                    Enabled: "True",
                    FlaggedDataSymbolStyle: "None",
                    GraphType: "Point",
                    LegendFormat: "Auto",
                    LineStyle: "Solid",
                    LineWidth: "1",
                    SymbolSize: "0",
                    SymbolStyle: "None",
                    TSAlias: "Larimer-population",
                    TSID: "Larimer.DOLA.Population.Year~DateValue~/data-ts/Larimer.DOLA.Population.Year.dv",
                    XAxis: "Bottom",
                    YAxis: "Left"
                  }
                },
                {
                  properties: {
                    Color: "blue",
                    DataLabelFormat: "",
                    DataLabelPosition: "Right",
                    Enabled: "True",
                    FlaggedDataSymbolStyle: "None",
                    GraphType: "Line",
                    LegendFormat: "Auto",
                    LineStyle: "Solid",
                    LineWidth: "1",
                    SymbolSize: "0",
                    SymbolStyle: "None",
                    TSAlias: "Larimer-population-filled",
                    TSID: "Larimer.DOLA.Population.Year~DateValue~/data-ts/Larimer.DOLA.Population.Year.filled.dv",
                    XAxis: "Bottom",
                    YAxis: "Left"
                  }
                }
              ],
              properties: {
                AnnotationProvider: "",
                BottomXAxisLabelFontName: "Arial",
                BottomXAxisLabelFontSize: "10",
                BottomXAxisLabelFontStyle: "Plain",
                BottomXAxisMajorGridColor: "None",
                BottomXAxisMinorGridColor: "None",
                BottomXAxisTitleFontName: "Arial",
                BottomXAxisTitleFontSize: "12",
                BottomXAxisTitleFontStyle: "Plain",
                BottomXAxisTitleString: "",
                DataLabelFontName: "Arial",
                DataLabelFontSize: "10",
                DataLabelFontStyle: "Plain",
                DataLabelFormat: "",
                DataLabelPosition: "Right",
                Enabled: "True",
                GraphType: "Line",
                LayoutYPercent: "",
                LeftYAxisDirection: "Normal",
                LeftYAxisIgnoreUnits: "false",
                LeftYAxisLabelFontName: "Arial",
                LeftYAxisLabelFontSize: "10",
                LeftYAxisLabelFontStyle: "Plain",
                LeftYAxisLabelPrecision: "1",
                LeftYAxisLegendPosition: "BottomLeft",
                LeftYAxisMajorGridColor: "lightgray",
                LeftYAxisMajorTickColor: "None",
                LeftYAxisMax: "Auto",
                LeftYAxisMin: "Auto",
                LeftYAxisMinorGridColor: "None",
                LeftYAxisTitleFontName: "Arial",
                LeftYAxisTitleFontSize: "12",
                LeftYAxisTitleFontStyle: "Plain",
                LeftYAxisTitlePosition: "LeftOfAxis",
                LeftYAxisTitleRotation: "270",
                LeftYAxisTitleString: "Total Population",
                LeftYAxisType: "Linear",
                LeftYAxisUnits: "Persons",
                LegendFontName: "Arial",
                LegendFontSize: "10",
                LegendFontStyle: "Plain",
                LegendFormat: "Auto",
                LegendPosition: "BottomLeft",
                MainTitleFontName: "Arial",
                MainTitleFontSize: "20",
                MainTitleFontStyle: "Plain",
                MainTitleString: "",
                RightYAxisDirection: "Normal",
                RightYAxisGraphType: "None",
                RightYAxisIgnoreUnits: "false",
                RightYAxisLabelFontName: "Arial",
                RightYAxisLabelFontSize: "10",
                RightYAxisLabelFontStyle: "Plain",
                RightYAxisLabelPrecision: "2",
                RightYAxisLegendPosition: "BottomRight",
                RightYAxisMajorGridColor: "None",
                RightYAxisMajorTickColor: "None",
                RightYAxisMax: "Auto",
                RightYAxisMin: "Auto",
                RightYAxisMinorGridColor: "None",
                RightYAxisTitleFontName: "Arial",
                RightYAxisTitleFontSize: "12",
                RightYAxisTitleFontStyle: "Plain",
                RightYAxisTitlePosition: "None",
                RightYAxisTitleRotation: "0",
                RightYAxisTitleString: "",
                RightYAxisType: "Linear",
                RightYAxisUnits: "",
                SelectedTimeSeriesLineWidth: "x2",
                SubTitleFontName: "Arial",
                SubTitleFontSize: "10",
                SubTitleFontStyle: "Plain",
                SubTitleString: "",
                TopXAxisLabelFontName: "Arial",
                TopXAxisLabelFontSize: "10",
                TopXAxisLabelFontStyle: "Plain",
                TopXAxisTitleFontName: "Arial",
                TopXAxisTitleFontSize: "12",
                TopXAxisTitleFontStyle: "Plain",
                ZoomEnabled: "True",
                ZoomGroup: "1"
              }
            }
          ]
        }
      },
      mapConfigPath: "data-maps/map-configuration-files/",
      windowID: "county-popup-template-County"
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogTSGraphComponent ],
      imports: [ HttpClientModule, MatDialogModule ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {}
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: dataObject
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    // fixture = TestBed.createComponent(DialogTSGraphComponent);
    // tsGraphComponent = fixture.debugElement.componentInstance;
    // fixture.detectChanges();
  });

  describe('when unit and function testing', () => {
    // it('should pad a number', () => {
    //   expect(tsGraphComponent['zeroPad'](1, 1)).toEqual('01');
    // });
  });

  it('should create', () => {
    // expect(component).toBeTruthy();
  });
});
