import { HttpClientTestingModule,
          HttpTestingController } from '@angular/common/http/testing';
import { TestBed }                from '@angular/core/testing';
import { GRAPH_TEMPLATE }         from './owf-common-test-data';

import { OwfCommonService }       from './owf-common.service';

describe('OwfCommonService', () => {
  let commonService: OwfCommonService,
      httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });
    commonService = TestBed.inject(OwfCommonService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  describe('when performing asynchronous methods', () => {
    it('should GET JSON data into an object', () => {
      expect(commonService).toBeTruthy();

      commonService.getJSONData('assets/app/data-maps/data-ts/streamflow-graph-template.json')
      .subscribe((data: any) => {
        expect(data).toBeTruthy('No data returned');

        expect(data.product.properties.Enabled).toContain('True');
      });

      const req = httpTestingController.expectOne('assets/app/data-maps/data-ts/streamflow-graph-template.json');
      expect(req.request.method).toEqual('GET');
      
      req.flush(GRAPH_TEMPLATE);
    });
  });

  // describe('when performing synchronous helper methods', () => {
  // });
  
});
