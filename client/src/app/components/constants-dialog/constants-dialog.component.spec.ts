import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstantsDialogComponent } from './constants-dialog.component';

describe('ConstantsDialogComponent', () => {
  let component: ConstantsDialogComponent;
  let fixture: ComponentFixture<ConstantsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConstantsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConstantsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
