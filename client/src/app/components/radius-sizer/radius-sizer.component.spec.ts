import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiusSizerComponent } from './radius-sizer.component';

describe('RadiusSizerComponent', () => {
  let component: RadiusSizerComponent;
  let fixture: ComponentFixture<RadiusSizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RadiusSizerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiusSizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
