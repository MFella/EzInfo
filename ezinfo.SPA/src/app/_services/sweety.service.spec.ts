/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SweetyService } from './sweety.service';

describe('Service: Sweety', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SweetyService]
    });
  });

  it('should ...', inject([SweetyService], (service: SweetyService) => {
    expect(service).toBeTruthy();
  }));
});
