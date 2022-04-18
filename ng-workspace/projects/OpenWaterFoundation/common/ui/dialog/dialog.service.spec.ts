import { HttpClientTestingModule,
          HttpTestingController } from '@angular/common/http/testing';
import { TestBed }                from '@angular/core/testing';

import { DialogService }          from './dialog.service';
import * as IM                    from '@OpenWaterFoundation/common/services';

describe('DialogService', () => {
  let commonService: DialogService,
    httpTestingController: HttpTestingController,
    bounds: IM.Bounds;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    commonService = TestBed.inject(DialogService);
    httpTestingController = TestBed.inject(HttpTestingController);
    bounds = {
      NEMaxLat: Number.NEGATIVE_INFINITY,
      NEMaxLong: Number.NEGATIVE_INFINITY,
      SWMinLat: Number.POSITIVE_INFINITY,
      SWMinLong: Number.POSITIVE_INFINITY
    }
  });

  describe('when performing synchronous helper methods', () => {

    describe('and testing Data Table Dialog', () => {

      // setZoomBounds()
      it('should create correct zoom bounds for a point', () => {
        commonService.setZoomBounds(39, -105.5, bounds);
        expect(bounds).toEqual({NEMaxLat: 39, NEMaxLong: -105.5, SWMinLat: 39, SWMinLong: -105.5});
      });

      it('should create correct zoom bounds for multiple points', () => {
        commonService.setZoomBounds(41.002, 102.052, bounds);
        commonService.setZoomBounds(36.999, 109.045, bounds);
        expect(bounds).toEqual({NEMaxLat: 41.002, NEMaxLong: 109.045, SWMinLat: 36.999, SWMinLong: 102.052});
      });
    });

    xdescribe('and testing Properties Dialog', () => {

      // INCORRECT: Needs to be replaced - getInstanceOf()
    });

    describe('and testing TSGraph Dialog', () => {

      // determineDatePrecision()
      it('should return a data precision number', () => {
        expect(commonService.determineDatePrecision('year')).toBe(100);
        expect(commonService.determineDatePrecision('month')).toBe(100);
        expect(commonService.determineDatePrecision('week')).toBe(100);
        expect(commonService.determineDatePrecision('day')).toBe(100);
        expect(commonService.determineDatePrecision('YEAR')).toBe(100);
        expect(commonService.determineDatePrecision('Month')).toBe(100);
        expect(commonService.determineDatePrecision('weEK')).toBe(100);
        expect(commonService.determineDatePrecision('dAy')).toBe(100);

        expect(commonService.determineDatePrecision('minute')).toBe(10);
        expect(commonService.determineDatePrecision('Hobbit')).toBe(10);
      });

      // formatLegendLabel()
      it('should format the backup legend label', () => {
        expect(commonService.formatLegendLabel(
          '0300911.DWR.DivTotal.Month~StateMod~/data-ts/0300911.DWR.DivTotal.Month.csv'
        )).toBe('0300911.DWR.DivTotal.Month');

        expect(commonService.formatLegendLabel(
          '0300911.StateMod.Streamflow.Month~StateMod~/data-ts/0300911.StateMod.Streamflow.Month.stm'
        )).toBe('0300911.StateMod.Streamflow.Month');

        expect(commonService.formatLegendLabel(
          '0300911.StateMod.Streamflow.Month~/data-ts/0300911.StateMod.Streamflow.Month.stm'
        )).toBe('0300911.StateMod.Streamflow.Month');
      });

      // getDates()
      it('should create a range of dates between two provided dates', () => {
        // Placeholder for DayTS test.

        
        // 2000-01 to 2000-12 in months.
        expect(commonService.getDates('2000-01', '2000-12', 'months')).toEqual({
          dataTableDates: ['2000-01', '2000-02', '2000-03', '2000-04', '2000-05',
          '2000-06', '2000-07', '2000-08', '2000-09', '2000-10', '2000-11', '2000-12'],
          graphDates: ['Jan 2000', 'Feb 2000', 'Mar 2000', 'Apr 2000', 'May 2000',
          'Jun 2000', 'Jul 2000', 'Aug 2000', 'Sep 2000', 'Oct 2000', 'Nov 2000', 'Dec 2000']
        });

        // 1988 to 2021 in years.
        expect(commonService.getDates(1988, 2021, 'years')).toEqual({
          dataTableDates: ['1988', '1989', '1990', '1991', '1992', '1993', '1994',
          '1995', '1996', '1997', '1998', '1999', '2000', '2001', '2002', '2003',
          '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012',
          '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021'],
          graphDates: ['1988', '1989', '1990', '1991', '1992', '1993', '1994',
          '1995', '1996', '1997', '1998', '1999', '2000', '2001', '2002', '2003',
          '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012',
          '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021']
        });
      });

      // TODO
      // it('should provide graph Axis objects', () => {
      //   // 
      //   expect(commonService.setAxisObject())
      // });

      // setPlotlyLegendPosition()
      it('should set the correct legend position for a Plotly graph', () => {
        // 
        expect(commonService.setPlotlyLegendPosition('Bottom')).toEqual({
          x: 0.4, y: -0.15
        });
        expect(commonService.setPlotlyLegendPosition('BottomLeft')).toEqual({
          x: 0, y: -0.15
        });
        expect(commonService.setPlotlyLegendPosition('BottomRight')).toEqual({
          x: 0.75, y: -0.15
        });
        expect(commonService.setPlotlyLegendPosition('Left')).toEqual({
          x: -0.5, y: 0.5
        });
        expect(commonService.setPlotlyLegendPosition('Right')).toEqual({
          x: 1, y: 0.5
        });
        expect(commonService.setPlotlyLegendPosition('InsideLowerLeft')).toEqual({
          x: 0, y: 0
        });
        expect(commonService.setPlotlyLegendPosition('InsideLowerRight')).toEqual({
          x: 0.75, y: 0
        });
        expect(commonService.setPlotlyLegendPosition('InsideUpperLeft')).toEqual({
          x: 0.01, y: 1
        });
        expect(commonService.setPlotlyLegendPosition('InsideUpperRight')).toEqual({
          x: 0.75, y: 1
        });
        // Expect multiple graphs to change the y axis position on the graph.
        expect(commonService.setPlotlyLegendPosition('Bottom', 2)).toEqual({
          x: 0.4, y: -0.25
        });
        expect(commonService.setPlotlyLegendPosition('Bottom', 3)).toEqual({
          x: 0.4, y: -0.3
        });
        expect(commonService.setPlotlyLegendPosition('Bottom', 4)).toEqual({
          x: 0.4, y: -0.35
        });
      });

      // verifyPlotlyProp()
      it('should verify graph properties', () => {
        expect(commonService.verifyPlotlyProp('Line', IM.GraphProp.cm)).toBe('lines');
        expect(commonService.verifyPlotlyProp('Point', IM.GraphProp.cm)).toBe('markers');
        expect(commonService.verifyPlotlyProp('Sponge', IM.GraphProp.cm)).toBe('lines');

        expect(commonService.verifyPlotlyProp('Line', IM.GraphProp.ct)).toBe('scatter');
        expect(commonService.verifyPlotlyProp('Point', IM.GraphProp.ct)).toBe('scatter');
        expect(commonService.verifyPlotlyProp('Zamboni', IM.GraphProp.ct)).toBe('scatter');

        expect(commonService.verifyPlotlyProp('0x41528a', IM.GraphProp.bc)).toBe('#41528a');
        expect(commonService.verifyPlotlyProp('white', IM.GraphProp.bc)).toBe('white');
        expect(commonService.verifyPlotlyProp('', IM.GraphProp.bc)).toBe('black');
      });

      // zeroPad()
      it('should correctly pad zeros to a number as a string', () => {
        expect(commonService.zeroPad(8, 1)).toBe('8');
        expect(commonService.zeroPad(8, 2)).toBe('08');
        expect(commonService.zeroPad(8, 3)).toBe('008');
        expect(commonService.zeroPad(8, 16)).toBe('0000000000000008');
      });
    });
    
  });

});
