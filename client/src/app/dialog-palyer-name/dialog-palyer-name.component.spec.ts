import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPalyerNameComponent } from './dialog-palyer-name.component';

describe('DialogPalyerNameComponent', () => {
  let component: DialogPalyerNameComponent;
  let fixture: ComponentFixture<DialogPalyerNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogPalyerNameComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogPalyerNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
