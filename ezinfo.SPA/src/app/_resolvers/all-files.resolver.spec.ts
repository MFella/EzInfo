import { TestBed } from '@angular/core/testing';

import { AllFilesResolver } from './all-files.resolver';

describe('AllFilesResolver', () => {
  let resolver: AllFilesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(AllFilesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
