import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialaogGameOverComponent } from './dialaog-game-over.component';

describe('DialaogGameOverComponent', () => {
  let component: DialaogGameOverComponent;
  let fixture: ComponentFixture<DialaogGameOverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialaogGameOverComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialaogGameOverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
