import { TestBed } from '@angular/core/testing';

import { CanvasHelperService } from './canvas-helper.service';

describe('CanvasHelperService', () => {
  let service: CanvasHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
