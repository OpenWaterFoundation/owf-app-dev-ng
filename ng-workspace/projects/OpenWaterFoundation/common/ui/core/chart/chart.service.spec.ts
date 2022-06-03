import { HttpClientTestingModule,
          HttpTestingController } from '@angular/common/http/testing';
import { TestBed }                from '@angular/core/testing';

import { DayTS,
          MonthTS,
          TS,
          YearTS }                from '@OpenWaterFoundation/common/ts';

import { ChartService }           from './chart.service';
import * as IM                    from '@OpenWaterFoundation/common/services';


describe('DialogService', () => {
  let chartService: ChartService,
    httpTestingController: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    chartService = TestBed.inject(ChartService);
    httpTestingController = TestBed.inject(HttpTestingController);

  });

  describe('when performing synchronous helper methods', () => {

    describe('and testing the Chart component', () => {

      // determineDatePrecision()
      it('should return a data precision number', () => {
        expect(chartService.determineDatePrecision('year')).toBe(100);
        expect(chartService.determineDatePrecision('month')).toBe(100);
        expect(chartService.determineDatePrecision('week')).toBe(100);
        expect(chartService.determineDatePrecision('day')).toBe(100);
        expect(chartService.determineDatePrecision('YEAR')).toBe(100);
        expect(chartService.determineDatePrecision('Month')).toBe(100);
        expect(chartService.determineDatePrecision('weEK')).toBe(100);
        expect(chartService.determineDatePrecision('dAy')).toBe(100);

        expect(chartService.determineDatePrecision('minute')).toBe(10);
        expect(chartService.determineDatePrecision('Hobbit')).toBe(10);
      });

      it('should format the backup legend label', () => {
        expect(chartService.formatLegendLabel(
          '0300911.DWR.DivTotal.Month~StateMod~/data-ts/0300911.DWR.DivTotal.Month.csv'
        )).toBe('0300911.DWR.DivTotal.Month');

        expect(chartService.formatLegendLabel(
          '0300911.StateMod.Streamflow.Month~StateMod~/data-ts/0300911.StateMod.Streamflow.Month.stm'
        )).toBe('0300911.StateMod.Streamflow.Month');

        expect(chartService.formatLegendLabel(
          '0300911.StateMod.Streamflow.Month~/data-ts/0300911.StateMod.Streamflow.Month.stm'
        )).toBe('0300911.StateMod.Streamflow.Month');
      });

      // getDates()
      it('should create a range of dates between two provided dates', () => {
        // 2020-01-01 to 2020-02-01 in days.
        var dayTS: DayTS = new DayTS();
        expect(chartService.getDates('2020-01-01', '2020-02-01', dayTS)).toEqual(
          [
            '2020-01-01', '2020-01-02', '2020-01-03', '2020-01-04', '2020-01-05',
            '2020-01-06', '2020-01-07', '2020-01-08', '2020-01-09', '2020-01-10',
            '2020-01-11', '2020-01-12', '2020-01-13', '2020-01-14', '2020-01-15',
            '2020-01-16', '2020-01-17', '2020-01-18', '2020-01-19', '2020-01-20',
            '2020-01-21', '2020-01-22', '2020-01-23', '2020-01-24', '2020-01-25',
            '2020-01-26', '2020-01-27', '2020-01-28', '2020-01-29', '2020-01-30',
            '2020-01-31', '2020-02-01'
          ]
        );

        // 2000-01 to 2000-12 in months.
        var monthTS: MonthTS = new MonthTS();
        expect(chartService.getDates('2000-01', '2000-12', monthTS)).toEqual(
          [
            '2000-01', '2000-02', '2000-03', '2000-04', '2000-05', '2000-06',
            '2000-07', '2000-08', '2000-09', '2000-10', '2000-11', '2000-12'
          ]
        );

        // 1988 to 2021 in years.
        var yearTS: YearTS = new YearTS();
        expect(chartService.getDates('1988', '2021', yearTS)).toEqual(
          [
            '1988', '1989', '1990', '1991', '1992', '1993', '1994', '1995', '1996',
            '1997', '1998', '1999', '2000', '2001', '2002', '2003', '2004', '2005',
            '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014',
            '2015', '2016', '2017', '2018', '2019', '2020', '2021'
          ]
        );
      });

      // TODO
      // it('should provide graph Axis objects', () => {
      //   // 
      //   expect(chartService.setAxisObject())
      // });

      // setPlotlyLegendPosition()
      it('should set the correct legend position for a Plotly graph', () => {
        // 
        expect(chartService.setPlotlyLegendPosition('Bottom')).toEqual({
          x: 0.4, y: -0.15
        });
        expect(chartService.setPlotlyLegendPosition('BottomLeft')).toEqual({
          x: 0, y: -0.15
        });
        expect(chartService.setPlotlyLegendPosition('BottomRight')).toEqual({
          x: 0.75, y: -0.15
        });
        expect(chartService.setPlotlyLegendPosition('Left')).toEqual({
          x: -0.5, y: 0.5
        });
        expect(chartService.setPlotlyLegendPosition('Right')).toEqual({
          x: 1, y: 0.5
        });
        expect(chartService.setPlotlyLegendPosition('InsideLowerLeft')).toEqual({
          x: 0, y: 0
        });
        expect(chartService.setPlotlyLegendPosition('InsideLowerRight')).toEqual({
          x: 0.75, y: 0
        });
        expect(chartService.setPlotlyLegendPosition('InsideUpperLeft')).toEqual({
          x: 0.01, y: 1
        });
        expect(chartService.setPlotlyLegendPosition('InsideUpperRight')).toEqual({
          x: 0.75, y: 1
        });
        // Expect multiple graphs to change the y axis position on the graph.
        expect(chartService.setPlotlyLegendPosition('Bottom', 2)).toEqual({
          x: 0.4, y: -0.25
        });
        expect(chartService.setPlotlyLegendPosition('Bottom', 3)).toEqual({
          x: 0.4, y: -0.3
        });
        expect(chartService.setPlotlyLegendPosition('Bottom', 4)).toEqual({
          x: 0.4, y: -0.35
        });
      });

      // verifyPlotlyProp()
      it('should verify graph properties', () => {
        expect(chartService.verifyPlotlyProp('Line', IM.GraphProp.cm)).toBe('lines');
        expect(chartService.verifyPlotlyProp('Point', IM.GraphProp.cm)).toBe('markers');
        expect(chartService.verifyPlotlyProp('Sponge', IM.GraphProp.cm)).toBe('lines');

        expect(chartService.verifyPlotlyProp('Line', IM.GraphProp.ct)).toBe('scatter');
        expect(chartService.verifyPlotlyProp('Point', IM.GraphProp.ct)).toBe('scatter');
        expect(chartService.verifyPlotlyProp('Zamboni', IM.GraphProp.ct)).toBe('scatter');

        expect(chartService.verifyPlotlyProp('0x41528a', IM.GraphProp.bc)).toBe('#41528a');
        expect(chartService.verifyPlotlyProp('white', IM.GraphProp.bc)).toBe('white');
        expect(chartService.verifyPlotlyProp('', IM.GraphProp.bc)).toBe('black');
      });

      // zeroPad()
      it('should correctly pad zeros to a number as a string', () => {
        expect(chartService.zeroPad(8, 1)).toBe('8');
        expect(chartService.zeroPad(8, 2)).toBe('08');
        expect(chartService.zeroPad(8, 3)).toBe('008');
        expect(chartService.zeroPad(8, 16)).toBe('0000000000000008');
      });
    });

  });

});
