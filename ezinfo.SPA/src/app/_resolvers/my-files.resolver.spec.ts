import { TestBed } from '@angular/core/testing';

import { MyFilesResolver } from './my-files.resolver';

describe('MyFilesResolver', () => {
  let resolver: MyFilesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(MyFilesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
