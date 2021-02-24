import { TestBed } from '@angular/core/testing';

import { OwfCommonService } from './owf-common.service';

describe('OwfCommonService', () => {
  let service: OwfCommonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OwfCommonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
