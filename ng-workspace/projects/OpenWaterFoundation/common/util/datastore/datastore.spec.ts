import { HttpClientTestingModule,
          HttpTestingController } from '@angular/common/http/testing';
import { TestBed }                from '@angular/core/testing';

import { DatastoreManager }       from './DataStoreManager';
import { DateValueDatastore }     from './DateValueDataStore';
import { DelimitedDatastore }     from './DelimitedDataStore';
import { StateModDatastore }      from './StateModDataStore';


xdescribe('Datastores', () => {
  let httpTestingController: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  xdescribe('when using the datastore manager', () => {

  });

  xdescribe('when using the DateValue datastore', () => {

    it('should correctly convert a path', () => {
      
    });
  });


});