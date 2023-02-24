import { HttpClientTestingModule,
          HttpTestingController } from '@angular/common/http/testing';
import { TestBed }                from '@angular/core/testing';
import { Bounds } from '@OpenWaterFoundation/common/services';

import { DialogService }          from './dialog.service';

describe('DialogService', () => {
  let dialogService: DialogService,
    httpTestingController: HttpTestingController,
    bounds: Bounds;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    dialogService = TestBed.inject(DialogService);
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
        dialogService.setZoomBounds(39, -105.5, bounds);
        expect(bounds).toEqual({NEMaxLat: 39, NEMaxLong: -105.5, SWMinLat: 39, SWMinLong: -105.5});
      });

      it('should create correct zoom bounds for multiple points', () => {
        dialogService.setZoomBounds(41.002, 102.052, bounds);
        dialogService.setZoomBounds(36.999, 109.045, bounds);
        expect(bounds).toEqual({NEMaxLat: 41.002, NEMaxLong: 109.045, SWMinLat: 36.999, SWMinLong: 102.052});
      });
    });

    xdescribe('and testing Properties Dialog', () => {

      // INCORRECT: Needs to be replaced - getInstanceOf()
    });
    
  });

});
