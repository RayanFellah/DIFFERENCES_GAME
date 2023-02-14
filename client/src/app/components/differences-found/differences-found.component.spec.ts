import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DifferencesFoundComponent } from './differences-found.component';

describe('DifferencesFoundComponent', () => {
  let component: DifferencesFoundComponent;
  let fixture: ComponentFixture<DifferencesFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DifferencesFoundComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DifferencesFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
