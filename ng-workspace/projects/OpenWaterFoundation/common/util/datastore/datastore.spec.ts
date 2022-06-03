import { HttpClientTestingModule,
          HttpTestingController } from '@angular/common/http/testing';
import { TestBed }                from '@angular/core/testing';



xdescribe('Datastores', () => {
  let httpTestingController: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  describe('when using ', () => {

  });
});