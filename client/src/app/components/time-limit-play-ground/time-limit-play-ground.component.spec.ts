import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeLimitPlayGroundComponent } from './time-limit-play-ground.component';

describe('TimeLimitPlayGroundComponent', () => {
  let component: TimeLimitPlayGroundComponent;
  let fixture: ComponentFixture<TimeLimitPlayGroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimeLimitPlayGroundComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeLimitPlayGroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
