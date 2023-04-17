import { TestBed } from '@angular/core/testing';

import { TimerReplayService } from './timer-replay.service';

describe('TimerReplayService', () => {
  let service: TimerReplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimerReplayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
