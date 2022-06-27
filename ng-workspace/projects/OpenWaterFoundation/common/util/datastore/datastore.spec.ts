import { HttpClientTestingModule,
          HttpTestingController }         from '@angular/common/http/testing';
import { TestBed }                        from '@angular/core/testing';
import { HttpClient }                     from '@angular/common/http';

import { OwfCommonService }               from '@OpenWaterFoundation/common/services';

import { DatastoreManager }               from './DataStoreManager';
import { DateValueDatastore }             from './DateValueDataStore';
import { DelimitedDatastore }             from './DelimitedDataStore';
import { StateModDatastore }              from './StateModDataStore';
import { ColoradoHydroBaseRestDatastore } from './ColoradoHydroBaseRestDatastore';


xdescribe('Datastores', () => {
  let httpTestingController: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClient]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  xdescribe('when using the datastore manager', () => {

  });

  xdescribe('when using the DateValue datastore', () => {

    it('should correctly convert a path', () => {
      
    });
  });

  xdescribe('when using the ColoradoHydroBaseRest datastore', () => {

    // var hydroBaseDatastore = new ColoradoHydroBaseRestDatastore();

    it('should asynchronously get Telemetry Parameters on instance creation', () => {
      
    });
  });


});