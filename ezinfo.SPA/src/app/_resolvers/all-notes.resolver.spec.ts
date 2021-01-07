import { TestBed } from '@angular/core/testing';

import { AllNotesResolver } from './all-notes.resolver';

describe('MyFilesResolver', () => {
  let resolver: AllNotesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(AllNotesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
